import path from 'node:path/win32';
import { writeFile } from 'node:fs/promises';
import { standardOutputBuilder } from '../../utils/standardOutputBuilder.js';
import {
  DIRT_DEV_SCRIPT_WINDOWS,
  PACKAGE_JSON_FILE,
} from '../../constants/feConstants.js';
import { getPackageFile } from '../../utils/feUtils.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTPkgFile = DIRTStackCLI.DIRTPkgFile;

/**
 * @description Helper function that updates the `dirt-dev` script for windows environments
 * @param {string} destination
 */
export async function updateNPMScriptsWin32(
  destination: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();

  // get and read package file
  const packageFileData = (await getPackageFile(destination)) as DIRTPkgFile;

  packageFileData['scripts']['dirt-dev'] = DIRT_DEV_SCRIPT_WINDOWS;

  // write file
  const filePath = path.join(destination, PACKAGE_JSON_FILE);
  try {
    await writeFile(filePath, JSON.stringify(packageFileData, null, 2));
  } catch (e) {
    output.error = `Failed to write package file updates with error: ${e.toString()}`;
    return output;
  }

  output.result = 'Settings written for windows successfully';
  output.success = true;
  return output;
}
