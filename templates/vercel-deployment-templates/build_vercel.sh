# Vercel build script for D.I.R.T Stack Projects
# This script ensure that the required dependencies are installed and static assets copied to the correct location.
# Feel free to modify this file as necessary to suit your needs when deploying to Vercel.

# install dependencies
pip install -r requirements.txt

# collect static files
python3.9 manage.py collectstatic --no-input