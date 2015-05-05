from flask import Flask, request, session, redirect, url_for, \
    render_template, jsonify, abort, send_from_directory
import os
import sys
import importlib
import hashlib
import requests
import slugify
import json
import traceback

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

# Views
#


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/examples/<name>/")
def examples(name):
    return render_template('examples/%s.html' % name)


@app.route('/build/<path:path>')
def catch_build(path):
    """
    Serve /build/... urls from the build directory
    """
    build_dir = os.path.join(settings.JUXTAPOSE_ROOT, 'build')
    return send_from_directory(build_dir, path)


#
# Juxtapose API
#

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


# def _jsonify(*args, **kwargs):
#     """Convert to JSON"""
#     return app.response_class(json.dumps(dict(*args, **kwargs), cls=APIEncoder),
#         mimetype='application/json')


def _format_err(err_type, err_msg):
    return "%s: %s" % (err_type, err_msg)


def _get_uid(user_string):
    """Generate a unique identifer for user string"""
    return hashlib.md5(user_string).hexdigest()


def _utc_now():
    return datetime.datetime.utcnow().isoformat()+'Z'


def _write_embed(embed_key_name, json_key_name, meta):
    """Write embed page"""    
    # NOTE: facebook needs the protocol on embed_url for og tag
    image_url = meta.get('image_url', settings.STATIC_URL+'img/logos/logo_storymap.png')
    if image_url.startswith('//'):
        image_url = 'http:'+image_url
        
    content = render_template('_embed.html',
        embed_url='http:'+settings.AWS_STORAGE_BUCKET_URL+embed_key_name,
        json_url=settings.AWS_STORAGE_BUCKET_URL+json_key_name,
        title=meta.get('title', ''),
        description=meta.get('description', ''),
        image_url=image_url
    )            
    storage.save_from_data(embed_key_name, 'text/html', content)


@app.route('/juxtapose/create/', methods=['POST'])
def juxtapose_create():
    """Create a juxtapose"""
    try:
        data = request.json

    except Exception, e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

#
# Flask Server
#
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


