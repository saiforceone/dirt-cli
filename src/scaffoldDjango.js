/**
 * scaffoldDjango.js
 * This is the main file responsible for scaffolding the Django part of the DIRT stack
 */
import { exec } from 'child_process';
import { execaCommand } from 'execa';
import path from 'path';
import fs from 'fs';
import { access, appendFile, rename, unlink } from 'node:fs/promises';
import djangoDependencies from './configs/djangoDependencies.json' assert { type: 'json' };
import copy from 'recursive-copy';
import { generateSecretKey } from './utils/generateSecretKey.js';
import * as constants from 'constants';

/**
 * @description This function handles the installation of dependencies via Pipenv
 * @returns {Promise<*>}
 */
function installDependencies() {
  console.log('execute install dependencies at: ', new Date().toString());
  return new Promise((resolve, reject) => {
    // use the dependencies file to build the install string
    const packageList = Object.keys(djangoDependencies.packages)
      .map((pkg) => `${pkg}==${djangoDependencies.packages[pkg]}`)
      .join(' ');
    const command = `pipenv install ${packageList}`;
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
 * @description Copies django template data to the destination directory. Overwrites the original manage.py file
 * @param destinationBase
 * @returns {Promise<void>}
 */
async function copyDjangoSettings(destinationBase) {
  try {
    const currentFileUrl = import.meta.url;
    const templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      '../../templates/django-templates'
    );

    await access(destinationBase, constants.W_OK);
    console.log('template base dir: ', templateBaseDir);
    const results = await copy(templateBaseDir, destinationBase, {
      overwrite: true,
      dot: true,
    });
    console.log(`File copy results: ${results.length} files copied.`);
  } catch (e) {
    console.log('Failed to copy files with error: ', e.toString());
  }
}

async function writeDevSettings(secretKey, destination) {
  try {
    await appendFile(destination, `\nSECRET_KEY = '${secretKey}'`);
  } catch (e) {
    console.log('Failed to overwrite settings file with error: ', e.toString());
  }
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
    // Create the django project or at least attempt to
    const createProjectResult = await createDjangoProject(
      projectName,
      pythonExecutable
    );
    console.log('create project results: ', createProjectResult);
    // copy settings template
    console.log('copy django files to project');
    await copyDjangoSettings(destination);
    // generate secret key file and update dirt_settings/dev.py
    const secretKey = generateSecretKey();
    console.log('setting secret key...');
    const devSettingsPath = path.join(destination, 'dirt_settings', 'dev.py');
    await writeDevSettings(secretKey, devSettingsPath);
    // delete generated settings file
    console.log(
      "Removing default settings.py file (we won't need it anymore, trust me...)"
    );
    const originalSettingsFilePath = path.join(
      destination,
      projectName,
      'settings.py'
    );
    await unlink(originalSettingsFilePath);
    // rename git ignore file
    const originalIgnorePath = path.join(destination, '.gitignore.template');
    const newIgnorePath = path.join(destination, '.gitignore');
    console.log('renaming ignore file...');
    await rename(originalIgnorePath, newIgnorePath);
    return true;
  } catch (e) {
    console.log('failed to execute commands with error: ', e.toString());
    return false;
  }
}
