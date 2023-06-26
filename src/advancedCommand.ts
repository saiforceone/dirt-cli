/**
 * @description Advanced command execution for the D.I.R.T CLI
 */
import chalk from 'chalk';
import inquirer from 'inquirer';

// imports for dirt check / checkDirt
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import DIRTProjectConfig = DIRTStackCLI.DIRTProjectConfig;
import {
  DIRT_PROJECT_FOLDER_NAME,
  DIRT_PROJECT_CONFIG_FILE_NAME,
} from './constants/feConstants.js';
import ConsoleLogger from './utils/ConsoleLogger.js';

// check if we are in a DIRT project
// todo: extract this function
/**
 * @function checkDirt
 * @description Helper function that runs to ensure that the command is being
 * run from a dirt project folder. This might be overkill...or not.
 * @returns boolean
 */
async function checkDirt(): Promise<boolean> {
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
    if (!['react', 'vue'].includes(configData.frontend)) {
      ConsoleLogger.printMessage(
        'Invalid frontend option in config file',
        'error'
      );
      return false;
    }
    // database option check
    if (
      !['None', 'sqlite', 'mysql', 'postgresql'].includes(
        configData.databaseOption
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
 * @param {string} command
 * @param {string?} arg
 */
export async function advCli(command: string, arg?: string) {
  ConsoleLogger.printMessage('Checking CLI project...');

  const isValidProject = await checkDirt();
  ConsoleLogger.printMessage(
    isValidProject
      ? 'Looks like this is a valid dirt cli project'
      : 'This does not seem to be a valid dirt cli project',
    isValidProject ? 'success' : 'error'
  );
}
