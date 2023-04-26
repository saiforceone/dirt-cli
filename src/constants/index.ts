import type { CopyOptions } from 'node:fs';

export const FILE_COPY_OPTS: CopyOptions = {
  recursive: true,
  force: true,
};

export const LOCAL_ASSET_BUILDERS_PATH =
  '../../../templates/local-asset-builders';
