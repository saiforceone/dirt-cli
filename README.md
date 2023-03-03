```
______ ___________ _____   _____  _     _____ 
|  _  \_   _| ___ \_   _| /  __ \| |   |_   _|
| | | | | | | |_/ / | |   | /  \/| |     | |  
| | | | | | |    /  | |   | |    | |     | |  
| |/ / _| |_| |\ \  | |   | \__/\| |_____| |_ 
|___/  \___/\_| \_| \_/    \____/\_____/\___/ 
```
# D.I.R.T Stack CLI / D.I.R.T CLI
__Note:__ This is a work-in-progress and will be updated with more useful information

Official CLI Utility for the D.I.R.T stack

Welcome to a nicer way to scaffold Django projects utilizing InertiaJs, React & Tailwind CSS.

## Requirements
The DIRT CLI has the following requirements
* Python 3.x
* NodeJs 16.x
* Pipenv

## Things to keep in mind
* This is a very early version of the CLI
* This CLI has only been tested on __MacOS__ and __Linux (Ubuntu)__. I think it should work on __Windows__ but haven't tested it yet.

## Creating a DIRT Stack Application

The DIRT-CLI makes it very easy to create a project

```shell
# Run the command using NPX
npx @saiforceone/create-dirt-stack
```
and answer the prompts.

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

