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

# Generate a secret key, uncomment the line below and then paste it Note: if you have something like openssl
# installed, you can generate a string for your secret key by doing the following openssl rand -base64 <length> where
# <length> can be a value like 64
# SECRET_KEY = ""
