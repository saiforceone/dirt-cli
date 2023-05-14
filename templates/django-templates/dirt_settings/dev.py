# Settings that should be applied when running in dev mode.
# By default, we will use dev mode. Feel free to add any additional settings you might need to this file.
from .base import *

print('Loaded with dev configuration...')

# Set Debug mode. For development, this is usually going to stay as True
DEBUG = True

# Allowed hosts
ALLOWED_HOSTS += ['127.0.0.1']

# Add your additional settings below
