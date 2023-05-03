# This is an example of what your production settings file could look like.
# Feel free to set it up as you would like
from .base import *

print('Loaded with production configuration...')

# You may add to or overwrite ALLOWED_HOSTS below.
# For example, you could add a host to the list without overwriting by doing the following
# ALLOWED_HOSTS += ['127.0.0.1']
ALLOWED_HOSTS = []

# By default, in production, DEBUG is to be False
DEBUG = False

# Add your other application settings here like database settings

# Export a secret key to your environment.

# Alternatively: You can generate a secret key. Uncomment the line below and then paste it Note: if you have something
# like openssl installed, you can generate a string for your secret key by doing the following openssl rand -base64
# <length> where <length> can be a value like 64 and replace the environment variable.
# SECRET_KEY = os.environ.get('DIRT_SKEY')

# Uncomment the line below and update your installed apps to include <project_name> for the custom template tags to work
# INSTALLED_APPS += ['<project_name>']
