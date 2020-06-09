from flask import Flask, request, session, redirect, url_for, \
    render_template, jsonify, abort, send_from_directory
import os
import sys
import importlib
import uuid
import json
import traceback
import boto
from boto.s3.connection import OrdinaryCallingFormat


# Import settings module
if __name__ == "__main__":
    if not os.environ.get('FLASK_SETTINGS_MODULE', ''):
        os.environ['FLASK_SETTINGS_MODULE'] = 'core.settings'

settings_module = os.environ.get('FLASK_SETTINGS_MODULE')
examples_json = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'examples.json')
faq_json = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'faq.json')

try:
    importlib.import_module(settings_module)
except ImportError as e:
    raise ImportError("Could not import settings '%s' (Is it on sys.path?): %s" % (settings_module, e))


app = Flask(__name__)
app.config.from_envvar('FLASK_SETTINGS_FILE')

settings = sys.modules[settings_module]

build_dir = os.path.join(settings.PROJECT_ROOT, 'build')
source_dir = os.path.join(settings.PROJECT_ROOT, 'juxtapose')


@app.context_processor
def inject_urls():
    """
    Inject urls into the templates.
    Template variable will always have a trailing slash.
    """
    static_url = settings.STATIC_URL or app.static_url_path
    if not static_url.endswith('/'):
        static_url += '/'

    storage_url = settings.AWS_STORAGE_BUCKET_URL
    if not storage_url.endswith('/'):
        storage_url += '/'

    storage_url += settings.AWS_STORAGE_BUCKET_KEY
    if not storage_url.endswith('/'):
        storage_url += '/'

    cdn_url = settings.CDN_URL
    if not cdn_url.endswith('/'):
        cdn_url += '/'

    dropbox_app_key = settings.DROPBOX_APP_KEY

    return dict(
        STATIC_URL=static_url, static_url=static_url,
        STORAGE_URL=storage_url, storage_url=storage_url,
        CDN_URL=cdn_url, cdn_url=cdn_url,
        DROPBOX_APP_KEY=dropbox_app_key, dropbox_app_key=dropbox_app_key)


@app.context_processor
def inject_index_data():
    return dict(examples=json.load(open(examples_json)),faqs=json.load(open(faq_json)))


@app.route('/')
@app.route('/<path:path>')
def catch_all(path='index.html', context=None):
    """Catch-all function which serves every URL."""
    context = context or {}
    if not os.path.splitext(path)[1]:
        path = os.path.join(path, 'index.html')
    return render_template(path, **context)


@app.route('/juxtapose/<path:path>')
@app.route('/source/<path:path>')
@app.route('/images/<path:path>')
def catch_source(path):
    """
    Serve /source/... urls from the source directory
    """
    return send_from_directory(source_dir, path)


@app.route('/build/<path:path>')
def catch_build(path):
    """
    Serve urls from the build directory
    """
    return send_from_directory(build_dir, path)


# Juxtapose API
def _get_uid():
    """Generate a unique identifer for slider"""
    return uuid.uuid1().urn.split(':')[2]


@app.route('/juxtapose/create/', methods=['POST'])
def upload_juxtapose_json():
    """Post JSON to S3 Bucket"""
    import boto3
    try:
        data = request.json
        uid = _get_uid()
        key = 'juxtapose/' + uid + '.json'
        _conn = boto3.client('s3',
            verify=True,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        _conn.put_object(
            ACL='public-read',
            Body=json.dumps(data),
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
            ContentType='application/json')
        #s3 = boto.connect_s3(
        #    calling_format=OrdinaryCallingFormat,
        #    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        #    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        #bucket = s3.get_bucket(settings.AWS_STORAGE_BUCKET_NAME)
        #k = boto.s3.key.Key(bucket)
        #k.key = 'juxtapose/' + uid + '.json'
        #k.set_contents_from_string(json.dumps(data), policy='public-read')
        if request.host == 'stg-juxtapose.knightlab.com':
            uid = 'https://s3.amazonaws.com/uploads.knilab.com/%s' % key
        return jsonify({'uid': uid})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


if __name__ == "__main__":
    import getopt

    ssl_context = None
    port = 5000

    try:
        opts, args = getopt.getopt(sys.argv[1:], "sp:", ["port="])
        for opt, arg in opts:
            if opt == '-s':
                ssl_context = 'adhoc'
            elif opt in ('-p', '--port'):
                port = int(arg)
            else:
                print('Usage: app.py [-s]')
                sys.exit(1)
    except getopt.GetoptError:
        print('Usage: app.py [-s] [-p port]')
        sys.exit(1)

    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=ssl_context)
