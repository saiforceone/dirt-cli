/**
 * @description Advanced command execution for the D.I.R.T CLI
 */

// imports for dirt check / checkDirt
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { platform } from 'node:os';
import path from 'node:path';

import DIRTProjectConfig = DIRTStackCLI.DIRTProjectConfig;
import {
  DIRT_PROJECT_FOLDER_NAME,
  DIRT_PROJECT_CONFIG_FILE_NAME,
} from './constants/feConstants.js';
import ConsoleLogger from './utils/ConsoleLogger.js';
import { normalizeWinFilePath } from './utils/fileUtils.js';

/**
 * // todo: extract this function
 * @function cliInfo
 * @description Helper function that prints out CLI version and other details
 */
export async function cliInfo(): Promise<void> {
  const currentFileUrl = import.meta.url;

  let packagePath = path.resolve(
    path.normalize(new URL(currentFileUrl).pathname),
    '../../package.json'
  );

  if (platform() === 'win32') {
    packagePath = normalizeWinFilePath(packagePath);
  }

  // get the file and read it
  try {
    const _packageData = await readFile(packagePath, {
      encoding: 'utf-8',
    });
    const packageData = JSON.parse(_packageData);
    ConsoleLogger.printMessage(
      `D.I.R.T Stack CLI Version: ${packageData['version']}`
    );
  } catch (e) {
    ConsoleLogger.printMessage(
      `Failed to read CLI info with error: ${(e as Error).message}`,
      'error'
    );
  }
}

// check if we are in a DIRT project
// todo: extract this function
/**
 * @function checkDirt
 * @description Helper function that runs to ensure that the command is being
 * run from a dirt project folder. This might be overkill...or not.
 * @returns boolean
 */
export async function checkDirt(): Promise<boolean> {
  // get the current dir
  const currentDir = process.cwd();
  // check for the files and folders
  const dirtSettingsFile = path.join(
    currentDir,
    DIRT_PROJECT_FOLDER_NAME,
    DIRT_PROJECT_CONFIG_FILE_NAME
  );

  if (!existsSync(dirtSettingsFile)) return false;

  try {
    const fileContents = await readFile(dirtSettingsFile, {
      encoding: 'utf-8',
    });
    const configData = JSON.parse(fileContents) as DIRTProjectConfig;
    // frontend check
    if (!['react', 'vue'].includes(configData.projectConfig.frontend)) {
      ConsoleLogger.printMessage(
        'Invalid frontend option in config file',
        'error'
      );
      return false;
    }
    // database option check
    if (
      !['None', 'sqlite', 'mysql', 'postgresql'].includes(
        configData.projectConfig.databaseOption
      )
    ) {
      ConsoleLogger.printMessage(
        'Invalid database option in config file',
        'error'
      );
      return false;
    }
  } catch (e) {
    ConsoleLogger.printMessage(
      `Failed to read settings file with error: ${(e as Error).message}`,
      'error'
    );
    return false;
  }

  return true;
}

/**
 * @function advCli
 * @description Advanced CLI command runner. An example of advanced command
 * execution would look like npx create-dirt-stack --exec <command name>
 * where <command name> could be something like "create-app contact_list"
 * @param {Array<string>} args
 */
export async function advCli(args: Array<string>) {
  ConsoleLogger.printMessage('Checking CLI project...');

  const isValidProject = await checkDirt();
  ConsoleLogger.printMessage(
    isValidProject
      ? 'Looks like this is a valid dirt cli project'
      : 'This does not seem to be a valid dirt cli project',
    isValidProject ? 'success' : 'error'
  );
  if (!isValidProject) return;

  ConsoleLogger.printMessage(`Command and args: ${args}`);
}
