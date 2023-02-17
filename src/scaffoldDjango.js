/**
 * scaffoldDjango.js
 * This is the main file responsible for scaffolding the Django part of the DIRT stack
 */
import { execaCommand } from 'execa';
import path from 'path';
import fs from 'fs';
import { chmod, rename, unlink } from 'node:fs/promises';
import {
  copyDjangoSettings,
  copyInertiaDefaults,
  createDjangoProject,
  getVirtualEnvLocation,
  installDependencies,
  writeBaseSettings,
  writeDevSettings,
} from './utils/djangoUtils.js';
import { generateSecretKey } from './utils/generateSecretKey.js';
import * as constants from 'constants';

// Permission that should be applied when we overwrite manage.py
const MANAGE_PY_MODE = 0o775;

const DIRT_SETTINGS_FOLDER = 'dirt_settings';

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
    const devSettingsPath = path.join(
      destination,
      DIRT_SETTINGS_FOLDER,
      'dev.py'
    );
    await writeDevSettings(secretKey, devSettingsPath);
    const baseSettingsPath = path.join(
      destination,
      DIRT_SETTINGS_FOLDER,
      'base.py'
    );
    await writeBaseSettings(projectName, baseSettingsPath);
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

    // overwrite urls.py and views.py in base project
    const projectPath = path.join(destination, projectName);
    await copyInertiaDefaults(projectPath);

    console.log('Making project runnable...');
    // change permissions of manage.py so that we can run it
    // check if on windows on *Nix
    const managePyPath = path.join(destination, 'manage.py');
    await chmod(managePyPath, MANAGE_PY_MODE);
    return true;
  } catch (e) {
    console.log('failed to execute commands with error: ', e.toString());
    return false;
  }
}
