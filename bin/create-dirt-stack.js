#! /usr/bin/env node

import console from 'node:console';
import process from 'node:process';

/**
 * @function execCli
 * @description CLI branching based on params
 * @param args
 * @returns {Promise<void>}
 */
async function execCli(args) {
  console.log('args: ', args);

  const useExec = args[2] && args[2] === '--exec';

  if (useExec) {
    // check 3rd arg
    const { advCli } = await import('../dist/advancedCommand.js');
    // get command and params
    advCli().then();
    return;
  }

  const { cli } = await import('../dist/cli.js');
  cli().then();
}

execCli(process.argv).then();
