import djangoDependencies from '../configs/djangoDependencies.json';
import {exec} from 'child_process';
import fs from 'fs';
import constants from 'constants';
import path from 'path';
import {access, appendFile} from 'node:fs/promises';
import copy from 'recursive-copy';

// TODO: Figure out why this isn't working when we export the functions

/**
 * @description This function handles the installation of dependencies via Pipenv
 * @returns {Promise<*>}
 */
export function installDependencies() {
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
export function createDjangoProject(projectName, pythonExecutable) {
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
export function getVirtualEnvLocation() {
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
export async function copyDjangoSettings(destinationBase) {
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

/**
 * @description Writes settings for dev mode
 * @param secretKey This serves as Django's secret key
 * @param destination
 * @returns {Promise<void>}
 */
export async function writeDevSettings(secretKey, destination) {
  try {
    await appendFile(destination, `\nSECRET_KEY = "${secretKey}"`);
  } catch (e) {
    console.log('Failed to overwrite settings file with error: ', e.toString());
  }
}

/**
 * @description Writes updated configuration to base settings
 * @param projectName
 * @param destination
 * @returns {Promise<void>}
 */
export async function writeBaseSettings(projectName, destination) {
  try {
    await appendFile(
      destination,
      `\nWSGI_APPLICATION = "${projectName}.wsgi.application"`
    );
    await appendFile(destination, `\nROOT_URLCONF = "${projectName}.urls"`);
  } catch (e) {
    console.log('Failed to overwrite vase settings with error: ', e.toString());
  }
}

/**
 * @description Copies inertia specific urls.py and default views file to the project destination
 * @param destinationPath
 * @returns {Promise<void>}
 */
export async function copyInertiaDefaults(destinationPath) {
  try {
    const currentFileUrl = import.meta.url;
    const inertiaDefaultsDir = path.resolve(
      new URL(currentFileUrl).pathname,
      '../../templates/inertia-defaults'
    );
    const copyResults = await copy(inertiaDefaultsDir, destinationPath, {
      overwrite: true,
    });
    console.log(`${copyResults.length} Inertia files copied`);
  } catch (e) {
    console.log('Failed to copy inertia defaults with error: ', e.toString());
  }
}
