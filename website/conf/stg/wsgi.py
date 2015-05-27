"""
WSGI config for juxtapose project
"""
import os
import sys
import site

site.addsitedir('/home/apps/env/juxtapose/lib/python2.7/site-packages')
sys.path.append('/home/apps/sites/juxtapose/website')
sys.stdout = sys.stderr

os.environ.setdefault('FLASK_SETTINGS_MODULE', 'core.settings.stg')

from app import app as application
