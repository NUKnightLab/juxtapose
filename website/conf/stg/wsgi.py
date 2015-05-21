"""
WSGI config for storymap project
"""
import os
import sys
import site

site.addsitedir('/home/apps/env/StoryMapJS/lib/python2.7/site-packages')
sys.path.append('/home/apps/sites/StoryMapJS')
sys.stdout = sys.stderr

os.environ.setdefault('FLASK_SETTINGS_MODULE', 'core.settings.stg')

from api import app as application
