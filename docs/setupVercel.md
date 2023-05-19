```
______ ___________ _____   _____  _     _____ 
|  _  \_   _| ___ \_   _| /  __ \| |   |_   _|
| | | | | | | |_/ / | |   | /  \/| |     | |  
| | | | | | |    /  | |   | |    | |     | |  
| |/ / _| |_| |\ \  | |   | \__/\| |_____| |_ 
|___/  \___/\_| \_| \_/    \____/\_____/\___/ 
```

If you're reading this, it means you chose the __Vercel__ deployment option during the scaffolding process. Awesome!
Now, let's make sure we can get everything set up as required.

### A few things to consider

- This is an early version of this document so things might just change
- This is meant as a starting point
- We've broken some rules to serve static assets from Django (only applies to Vercel)
- There are two files to pay attention to `vercel.json` and `build_vercel.sh`
- --

### Prerequisites

Before we get started with the setup for deploying to __Vercel__, we will need to make sure we have a few things in
place
- An account on Vercel (Don't have one? [Click Here](https://vercel.com/))
- A repo set for your project already set up

### Important files
- __vercel.json:__
`This file contains the configuration that Vercel will use when deploying your project.`
- __build_vercel.sh:__ `This file contains the commands that should be run during the deployment process on Vercel`


