import { standardOutputBuilder } from './standardOutputBuilder.js';
import path from 'path';
import { access } from 'node:fs/promises';
import copy from 'recursive-copy';
import constants from 'constants';
import { REACT_TEMPLATES_PATH } from '../constants/reactConstants.js';

/**
 * @description Helper function that copies React Template files to the destination
 * @param destinationBase
 * @returns {Promise<{error: String, result: *, success: boolean}>}
 */
export async function copyReactFE(destinationBase) {
  const output = standardOutputBuilder();
  try {
    const currentFileUrl = import.meta.url;
    const templateBaseDir = path.resolve(
      new URL(currentFileUrl).pathname,
      REACT_TEMPLATES_PATH
    );

    await access(destinationBase, constants.W_OK);

    const results = await copy(templateBaseDir, destinationBase, {
      overwrite: true,
      dot: true,
    });

    output.result = `${results.length} React files copied`;
    output.success = true;
    return output;
  } catch (e) {
    output.result = 'Failed to copy files to destination';
    output.error = e.toString();
    return output;
  }
}
