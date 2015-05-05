from flask import Flask, request, session, redirect, url_for, \
    render_template, jsonify, abort, send_from_directory
import os
import sys
import importlib
import uuid
import json
import traceback
import boto

# Import settings module
if __name__ == "__main__":
    if not os.environ.get('FLASK_SETTINGS_MODULE', ''):
        os.environ['FLASK_SETTINGS_MODULE'] = 'core.settings.loc'

settings_module = os.environ.get('FLASK_SETTINGS_MODULE')

try:
    importlib.import_module(settings_module)
except ImportError, e:
    raise ImportError("Could not import settings '%s' (Is it on sys.path?): %s" % (settings_module, e))


app = Flask(__name__)
app.config.from_envvar('FLASK_CONFIG_MODULE')

settings = sys.modules[settings_module]


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

    return dict(
        STATIC_URL=static_url, static_url=static_url,
        STORAGE_URL=storage_url, storage_url=storage_url,
        CDN_URL=cdn_url, cdn_url=cdn_url)


# Views
@app.route("/")
def index():
    return render_template('index.html')


@app.route('/build/<path:path>')
def catch_build(path):
    """
    Serve /build/... urls from the build directory
    """
    build_dir = os.path.join(settings.JUXTAPOSE_ROOT, 'build')
    return send_from_directory(build_dir, path)


# Juxtapose API
def _get_uid():
    """Generate a unique identifer for slider"""
    return uuid.uuid1().urn.split(':')[2]


@app.route('/juxtapose/create/', methods=['POST'])
def upload_juxtapose_json():
    """Create a juxtapose"""
    try:
        data = request.json
        uid = _get_uid()
        s3 = boto.connect_s3(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        bucket = s3.get_bucket('jx-test-data')
        from boto.s3.key import Key
        k = Key(bucket)
        k.key = uid + '.json'
        k.set_contents_from_string(json.dumps(data))
        return jsonify({'uid': uid})
    except Exception, e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


# Flask Server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
