```
______ ___________ _____   _____  _     _____ 
|  _  \_   _| ___ \_   _| /  __ \| |   |_   _|
| | | | | | | |_/ / | |   | /  \/| |     | |  
| | | | | | |    /  | |   | |    | |     | |  
| |/ / _| |_| |\ \  | |   | \__/\| |_____| |_ 
|___/  \___/\_| \_| \_/    \____/\_____/\___/ 
```
# D.I.R.T Stack CLI / D.I.R.T CLI (Alpha)
__Note:__ This is a work-in-progress and will be updated with more useful information

Official CLI Utility for the D.I.R.T stack

Welcome to a nicer way to scaffold Django projects utilizing InertiaJs, React & Tailwind CSS.

## Requirements
The DIRT CLI has the following requirements
* [Python 3.x](https://www.python.org/)
* [NodeJs 16.x](https://nodejs.org/en)
* [Pipenv](https://pipenv.pypa.io/en/latest/) 

## Things to keep in mind
* This is a very early version of the CLI
* New features will be added
* This CLI has been tested on __MacOS__, __Linux (Ubuntu)__ and now, __Windows__.

## Creating a DIRT Stack Application

The DIRT-CLI makes it very easy to create a project

```shell
# Run the command using NPX (this may change in the future)
npx @saiforceone/dirt-cli
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
```

If you opted to use the StoryBook option, you may run it from the project directory using
```shell
npm run storybook
```

