```
______ ___________ _____   _____  _     _____ 
|  _  \_   _| ___ \_   _| /  __ \| |   |_   _|
| | | | | | | |_/ / | |   | /  \/| |     | |  
| | | | | | |    /  | |   | |    | |     | |  
| |/ / _| |_| |\ \  | |   | \__/\| |_____| |_ 
|___/  \___/\_| \_| \_/    \____/\_____/\___/ 
```
# D.I.R.T Stack CLI / D.I.R.T CLI (Beta)
__Note:__ This is a work-in-progress and will be updated with more useful information

Official CLI Utility for the D.I.R.T stack

Welcome to a nicer way to scaffold Django projects utilizing InertiaJs, Reactive UI (React/Vue/Svelte soon) & Tailwind CSS.

## Requirements
The DIRT CLI has the following requirements before it can be used. For a smoother experience, make sure the requirements below are working correctly.
* [Python 3.8+](https://www.python.org/)
* [NodeJs 16.x](https://nodejs.org/en)
* [Pipenv](https://pipenv.pypa.io/en/latest/) 

## Things to keep in mind
* This is an early version of the CLI
* New features will be added
* This CLI has been tested on __MacOS__, __Linux (Ubuntu)__ and now, __Windows__.
* There are bugs

## Creating a DIRT Stack Application

The DIRT-CLI makes it very easy to create a project harnessing the power of Django, InertiaJS, React/Vue and Tailwind CSS.

```shell
# Run the command using NPX (this may change in the future)
npx @saiforceone/dirt-cli@latest
```
and answer the prompts. For an example, see below

```shell
? What should we call this project? testproj
? Select a frontend framework / library react
? Would you like to use StorybookJS? No
? Would you like to have git initialized? No
? Show verbose logs? No
```

Once the scaffolding of your project is complete, navigate to the directory and run the following
```shell
# activate pipenv's shell
pipenv shell

# run the project
npm run dirt-dev

# open the web app in browser: http://127.0.0.1:8000
```

If you opted to use the StoryBook option, you may run it from the project directory using
```shell
npm run storybook
```

## Creating Controllers (Django Apps within a D.I.R.T Stack project)

A controller in this context is defined as a Django app within the project and the associated InertiaJS View files

### Creating a controller

To create a controller, the following command will need to be used. 
This command does not need to the virtual environment to be active for it to work.

```shell
# Controller create command
@saiforceone/dirt-cli create-controller <controller_name>

# or (the create-app alias may be used)
@saiforceone/dirt-cli create-app <controller_name>
```

When the command runs, the necessary files will be created. Once that is done, you will need to update your project's main `urls.py` file as follows (see the example below)
* Import the `include` function from `django.urls`
* Copy and paste the path in the list of `urlpatterns` 

```shell
### Example output
 D.I.R.T CLI Controller Created

 Update your main urls.py file as follows

 1. Import the include function from django.urls

 from django.urls import path, include

 2. Add this entry to urlpatterns

 path('demoapp9/', include('demoapp9.urls')),

 3. Navigate to the newly-created controller

 http://127.0.0.1:8000/demoapp9/
```

#### Technical Stuff
When the `create-controller` command is run, the following processes take place:
* A Django application is created within the project matching the name specified. 
* The corresponding InertiaJS View is then created `[project_root]/dirt_fe_[react|vue]/src/pages/[controller_name]/Index.[tsx|vue]`

### Known issues

#### Failed to scaffold project
Currently, the scaffolding process may fail at the initial step of creating the Django project. If that happens, delete the generated project folder, the corresponding virtual environment and then rerun the CLI.

Typically, virtual environments will be located in somewhere like: `~/.local/share/virtualenvs` for Posix system or `.virtualenvs` for Windows.

#### Hidden Django dev server output: 
Currently, some Django development server output is hidden when using `npm run dirt-dev` on __Windows__. The workaround is to run Django normally in it's own terminal (`pipenv shell` must be activated) and then the frontend in another terminal using `npm run dirt-fe`. Workaround: set the environment variable `PYTHONUNBUFFERED=1`. 