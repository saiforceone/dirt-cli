# Main view file for this D.I.R.T Stack application and contains the default index view
# You may replace the contents of this as you see fit
from inertia import inertia


@inertia('Home/Index')
def index(request):
    return {}
