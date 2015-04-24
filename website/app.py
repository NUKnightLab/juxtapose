'''
Main entrypoint file.  To run:
  $ python serve.py
'''

from flask import Flask
from flask import request
from flask import render_template
from flask import json
from flask import send_from_directory
import importlib
import traceback
import sys
import os

#if __name__ == "__main__":
# Add current directory to sys.path
site_dir = os.path.dirname(os.path.abspath(__file__))
         
if site_dir not in sys.path:
    sys.path.append(site_dir)
      
# Import settings module
if __name__ == "__main__":
    if not os.environ.get('FLASK_SETTINGS_MODULE', ''):
        os.environ['FLASK_SETTINGS_MODULE'] = 'core.settings.loc'

settings_module = os.environ.get('FLASK_SETTINGS_MODULE')

try:
    importlib.import_module(settings_module)
except ImportError, e:
    raise ImportError("Could not import settings '%s' (Is it on sys.path?): %s" % (settings_module, e))


# Create app
app = Flask(__name__)

build_dir = os.path.join(settings.PROJECT_ROOT, 'build')
source_dir = os.path.join(settings.PROJECT_ROOT, 'juxtapose')

@app.context_processor
def inject_static_url():
    """
    Inject urls into the templates. 
    Template variable will always have a trailing slash.
    """
    static_url = settings.STATIC_URL or app.static_url_path
    if static_url.endswith('/'):
        static_url = static_url.rstrip('/')

    storage_url += settings.AWS_STORAGE_BUCKET_KEY
    if not storage_url.endswith('/'):
        storage_url += '/'

    return dict(
        STATIC_URL=static_url, static_url=static_url,
        STORAGE_URL=storage_url, storage_url=storage_url, 
    )


@app.route('/build/<path:path>')
def catch_build(path):
    """
    Serve /build/... urls from the build directory
    """
    return send_from_directory(build_dir, path)    

@app.route('/juxtapose/<path:path>')
@app.route('/source/<path:path>')
def catch_source(path):
    """
    Serve /source/... urls from the source directory
    """
    return send_from_directory(source_dir, path)    

@app.route('/')
@app.route('/<path:path>')
def catch_all(path='index.html'):
    """Catch-all function which serves every URL."""
      
    if not os.path.splitext(path)[1]:
        path = os.path.join(path, 'index.html')
    return render_template(path)
    
        
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
