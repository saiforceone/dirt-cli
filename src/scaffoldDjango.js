/**
 * scaffoldDjango.js
 * This is the main file responsible for scaffolding the Django part of the DIRT stack
 */
import { exec } from 'child_process';
import { execaCommand } from 'execa';
import path from 'path';
import fs from 'fs';
import * as constants from 'constants';

/**
 * @description This function handles the installation of dependencies via Pipenv
 * @returns {Promise<*>}
 */
function installDependencies() {
  console.log('execute install dependencies at: ', new Date().toString());
  return new Promise((resolve, reject) => {
    const command = 'pipenv install Django==4.1 inertia-django django-vite';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

/**
 * @description This function is responsible for creating the Django project. For this process to work, we
 * have to specify which python executable needs to be used as we cannot activate the virtual environment.
 * @param projectName This refers to the name of the project which is read from the command line
 * @param pythonExecutable The path to the python executable so that `startproject` can be kicked off
 * @returns {Promise<*>}
 */
function createDjangoProject(projectName, pythonExecutable) {
  console.log('execute create django project at: ', new Date().toString());
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(pythonExecutable, constants.R_OK | constants.X_OK);
    } catch (e) {
      reject(e);
    }
    const venvCommand = 'pipenv --venv';
    const projectCommand = `${pythonExecutable} -m django startproject ${projectName} .`;
    exec(venvCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      exec(projectCommand, (pcError, pcStdout, pcStderr) => {
        if (pcError) {
          console.warn(pcError);
        }
        resolve(pcStdout ? pcStdout : pcStderr);
      });
    });
  });
}

/**
 * @description Gets the location of the virtual environment that was created so that
 * the path to the python executable can be determined.
 * @returns {Promise<*>}
 */
function getVirtualEnvLocation() {
  console.log('execute get venv location at: ', new Date().toString());
  return new Promise((resolve, reject) => {
    const command = 'pipenv --venv';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

/**
 * @description Main function that kicks off the process for scaffolding the Django application
 * @param options The options coming in from the CLI (process.argv)
 * @returns {Promise<*>}
 */
export async function scaffoldDjango(options) {
  console.log('preparing to scaffold your django project...');
  console.log('executing scaffoldDjango at ', new Date().toString());
  // check if we have a project name in options, if not exit
  const { projectName, withPipenv } = options;
  // TODO: validate projectName based on Django requirements
  if (!projectName) {
    return false;
  }

  console.log('creating project with name: ', projectName);

  // get the current directory and append the projectName
  const destination = path.join(process.cwd(), projectName);
  try {
    // make the directory if it does not exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    fs.accessSync(destination, constants.R_OK | constants.W_OK);
  } catch (e) {
    console.log('nope, that did not work. Here is your error: ', e.toString());
    return false;
  }

  // change directory to destination
  process.chdir(destination);

  console.log('in directory: ', process.cwd());
  const venvCommand = 'python3 -m virtualenv .venv';
  const pipenvCommand = 'pipenv shell';
  // create virtual environment
  try {
    await execaCommand(`pipenv shell`).stdout.pipe(process.stdout);
    // Kick off the dependency installation
    const installDepsResults = await installDependencies();
    console.log('install deps results: ', installDepsResults);
    // Determine environment of the related virtual environment
    const pipenvLocation = await getVirtualEnvLocation();
    console.log('pipenv location: ', pipenvLocation);
    // build path to the python executable
    const pythonExecutable = path.join(
      String(pipenvLocation).trim(),
      'bin',
      'python3'
    );
    console.log('python executable to be used: ', pythonExecutable);
    // Create the django project or at least attmept to
    const createProjectResult = await createDjangoProject(
      projectName,
      pythonExecutable
    );
    console.log('create project results: ', createProjectResult);
    return true;
  } catch (e) {
    console.log('failed to execute commands with error: ', e.toString());
    return false;
  }
}
