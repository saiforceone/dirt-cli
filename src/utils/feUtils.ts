import constants from 'node:constants';
import path from 'node:path';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import {
  DIRT_PROJECT_CONFIG_FILE_NAME,
  DIRT_PROJECT_FOLDER_NAME,
  PACKAGE_JSON_FILE,
} from '../constants/feConstants.js';
import ScaffoldOptions = DIRTStackCLI.ScaffoldOptions;
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTPkgFile = DIRTStackCLI.DIRTPkgFile;

/**
 * @description Helper function that gets the package json file and returns the contents
 * @param {string}destinationPath
 */
export async function getPackageFile(
  destinationPath: string
): Promise<number | unknown> {
  try {
    const pkgFilePath = path.join(destinationPath, PACKAGE_JSON_FILE);
    const _fileTemp = await readFile(pkgFilePath, { encoding: 'utf8' });
    return JSON.parse(_fileTemp);
  } catch (e) {
    return -1;
  }
}

/**
 * @description Write project configuration details as a json file
 * @param {ScaffoldOptions} options
 * @param {string} destinationBase
 */
export async function writeProjectConfig(
  options: ScaffoldOptions,
  destinationBase: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    const fileContents = {
      projectConfig: {
        ...options,
        // add dirt cli version
        dirtCLIVersion: 'n/a',
      },
    };

    // console.log('write config: ', JSON.stringify(fileContents));

    const folderPath = path.join(destinationBase, DIRT_PROJECT_FOLDER_NAME);
    await mkdir(folderPath);

    const filePath = path.join(
      destinationBase,
      DIRT_PROJECT_FOLDER_NAME,
      DIRT_PROJECT_CONFIG_FILE_NAME
    );

    await access(folderPath, constants.W_OK);
    // write file contents and then return
    await writeFile(filePath, JSON.stringify(fileContents, null, 2));

    output.result = 'Project configuration written';
    output.success = true;
    return output;
  } catch (e) {
    console.log('failed to write config with error: ', e.toString());
    output.error = e.toString();
    output.result = 'Failed to write project configuration';
    return output;
  }
}

/**
 * @description Updates the basic NPM attributes
 * @param {ScaffoldOptions} options
 * @param {string} destinationPath
 */
export async function updateNPMAttribs(
  options: ScaffoldOptions,
  destinationPath: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // get package file
    const pkgContents = (await getPackageFile(destinationPath)) as DIRTPkgFile;

    if (!pkgContents) {
      output.error = 'Package.json file not found';
      return output;
    }

    pkgContents['name'] = options['projectName'];

    await writeFile(
      path.join(destinationPath, PACKAGE_JSON_FILE),
      JSON.stringify(pkgContents, null, 2)
    );

    output.result = 'Package.json file updated';
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to update package.json file';
    output.error = e.toString();
    return output;
  }
}

/**
 * @description Why does JavaScript not have a way to do this still?
 * @param text
 */
export function toTitleCase(text: string): string {
  if (!text.length) return '';
  return text
    .trim()
    .split(' ')
    .map((word) => {
      return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(' ');
}
