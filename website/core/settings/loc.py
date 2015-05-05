"""
Local settings and globals.
"""
import sys
import os
from .base import *

# Import secrets
secrets_path = os.path.normpath(os.path.join(JUXTAPOSE_ROOT, '../secrets/juxtapose/loc'))
sys.path.append(secrets_path)

from secrets import *

# Set Flask configuration
os.environ['FLASK_CONFIG_MODULE'] = os.path.join(secrets_path, 'flask_config.py')
    
STATIC_URL = '/static/'

# CDN_URL = 'https://s3.amazonaws.com/cdn.knightlab.com/libs/storymapjs/dev/'
CDN_URL = os.path.abspath(os.path.join(JUXTAPOSE_ROOT, '/build/'))

# User storage bucket name on S3
# AWS_STORAGE_BUCKET_NAME = 'uploads.knilab.com'
AWS_STORAGE_BUCKET_NAME = 'jx-test-data'

# User storage bucket url on S3
# AWS_STORAGE_BUCKET_URL = '//s3.amazonaws.com/uploads.knilab.com/'
AWS_STORAGE_BUCKET_URL = '//s3.amazonaws.com/jx-test-data/'

# Application key name within storage bucket
# AWS_STORAGE_BUCKET_KEY = 'juxtapose'
AWS_STORAGE_BUCKET_KEY = 'juxtapose'
