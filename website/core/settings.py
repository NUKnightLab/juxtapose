from os.path import dirname
from os import environ as env

CORE_ROOT = dirname(dirname(abspath(__file__)))
PROJECT_ROOT = dirname(CORE_ROOT)
JUXTAPOSE_ROOT = dirname(PROJECT_ROOT)

STATIC_URL = env['STATIC_URL']
CDN_URL = env['CDN_URL']
AWS_STORAGE_BUCKET_NAME = env['AWS_STORAGE_BUCKET_NAME']
AWS_STORAGE_BUCKET_URL = env['AWS_STORAGE_BUCKET_URL']
AWS_STORAGE_BUCKET_KEY = env['AWS_STORAGE_BUCKET_KEY']
