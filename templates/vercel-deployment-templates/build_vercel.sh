# vercel build script for D.I.R.T Stack Projects

# install dependencies
pip install -r requirements.txt

# collect static files
python3.9 manage.py collectstatic --no-input