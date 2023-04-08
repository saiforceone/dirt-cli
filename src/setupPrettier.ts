import { $ } from 'execa';
import { createRequire } from 'module';
import { access, cp as copy } from 'node:fs/promises';
import constants from 'node:constants';
import path from 'node:path';
import { platform } from 'node:os';

import { standardOutputBuilder } from './utils/standardOutputBuilder.js';
const require = createRequire(import.meta.url);

const prettierPkg = require('../configs/prettierDependencies.json');
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;
import DIRTDependenciesFile = DIRTStackCLI.DIRTDependenciesFile;
import { PRETTIER_TEMPLATE_PATH } from './constants/feConstants.js';
import { normalizeWinFilePath } from './utils/fileUtils.js';
import { FILE_COPY_OPTS } from './constants/index.js';

/**
 * @description Helper function that sets up prettier. Copies over prettier config file and installs dependencies
 * @param destination
 */
export async function setupPrettier(
  destination: string
): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();

  try {
    // get the source
    const currentFilePath = import.meta.url;
    let prettierTemplateBase = path.resolve(
      new URL(currentFilePath).pathname,
      PRETTIER_TEMPLATE_PATH
    );

    if (platform() === 'win32') {
      prettierTemplateBase = normalizeWinFilePath(prettierTemplateBase);
    }

    await access(destination, constants.W_OK);

    // copy the file to destination
    await copy(prettierTemplateBase, destination, FILE_COPY_OPTS);

    const { packages } = prettierPkg as DIRTDependenciesFile;
    const pkgList = Object.keys(packages)
      .map((pkg) => `${pkg}@${packages[pkg]}`)
      .join(' ');

    // install prettier
    await $`npm i ${pkgList}`;

    output.success = true;
    output.result = 'Prettier installed...';
    return output;
  } catch (e) {
    output.error = (e as Error).message;
    return output;
  }
}
