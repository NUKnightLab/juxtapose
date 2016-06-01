"""
Staging settings and globals.
"""
import sys
import os
from .base import *

# Import secrets
secrets_path = os.path.normpath(os.path.join(JUXTAPOSE_ROOT, '../secrets/juxtapose/stg'))
sys.path.append(secrets_path)

from secrets import *

# Set Flask configuration
os.environ['FLASK_CONFIG_MODULE'] = os.path.join(secrets_path, 'flask_config.py')

STATIC_URL = '//media.knilab.com/juxtapose/'

CDN_URL = '//s3.amazonaws.com/cdn.knightlab.com/libs/juxtapose/dev/'


# name of user storage bucket on S3
AWS_STORAGE_BUCKET_NAME = 'uploads.knilab.com'

# User storage bucket url on S3
AWS_STORAGE_BUCKET_URL = '//s3.amazonaws.com/uploads.knilab.com/'

# Application key name within storage bucket
AWS_STORAGE_BUCKET_KEY = 'juxtapose'
