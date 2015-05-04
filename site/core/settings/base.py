"""
base configuration file
"""
from os.path import abspath, dirname

CORE_ROOT = dirname(dirname(abspath(__file__)))
PROJECT_ROOT = dirname(CORE_ROOT)
JUXTAPOSE_ROOT = dirname(PROJECT_ROOT)

#DATABASES = {
#    'default': {
#        'ENGINE': 'mongo',
#        'NAME': 'pitcha',
#        'HOST': '127.0.0.1',
#        'PORT': 27017,
#    }
#}
