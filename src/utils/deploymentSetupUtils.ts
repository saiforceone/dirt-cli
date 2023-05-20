/**
 * Implementation of deployment options for the DIRT Stack CLI
 */
// Core Imports
import { cp as copy, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { platform } from 'node:os';
// DIRT Imports
import {
  FILE_COPY_OPTS,
  VERCEL_CONFIG_FILENAME,
  VERCEL_TEMPLATES_PATH,
} from '../constants/index.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTVercelOpts = DIRTStackCLI.DIRTVercelOpts;
import { standardOutputBuilder } from './standardOutputBuilder.js';
import { normalizeWinFilePath } from './fileUtils.js';
import DIRTVercelConfigFile = DIRTStackCLI.DIRTVercelConfigFile;

/**
 * Helper function that copies and modifies the necessary files to support deployment to vercel
 * @param {DIRTVercelOpts} options
 */
export async function setupVercelDeployment(
  options: DIRTVercelOpts
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  try {
    // copy files
    const currentUrl = import.meta.url;
    let templatePath = path.resolve(
      path.normalize(new URL(currentUrl).pathname),
      VERCEL_TEMPLATES_PATH
    );

    if (platform() === 'win32')
      templatePath = normalizeWinFilePath(templatePath);

    await copy(templatePath, options.destination, FILE_COPY_OPTS);

    // overwrite vercel.json file
    const vercelConfigPath = path.join(
      options.destination,
      VERCEL_CONFIG_FILENAME
    );

    // read file as JSON
    const _fileData = await readFile(vercelConfigPath, { encoding: 'utf-8' });
    const vercelConfig = JSON.parse(_fileData) as DIRTVercelConfigFile;

    vercelConfig.builds[0]
      ? (vercelConfig.builds[0].src = `${options.projectName}/wsgi.py`)
      : undefined;
    vercelConfig.routes[0]
      ? (vercelConfig.routes[0].dest = `${options.projectName}/wsgi.py`)
      : undefined;

    await writeFile(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

    output.result = 'Vercel deployment options configured';
    output.success = true;
    return output;
  } catch (e) {
    output.error = (e as Error).message;
    return output;
  }
}
