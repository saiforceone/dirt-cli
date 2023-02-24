import constants from 'node:constants';
import path from 'node:path';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { standardOutputBuilder } from './standardOutputBuilder.js';
import {
  DIRT_PROJECT_CONFIG_FILE_NAME,
  DIRT_PROJECT_FOLDER_NAME,
} from '../constants/feConstants.js';

/**
 * @description Write project configuration details as a json file
 * @param options
 * @param destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function writeProjectConfig(options, destinationBase) {
  const output = standardOutputBuilder();
  try {
    const fileContents = {
      projectConfig: {
        ...options,
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
