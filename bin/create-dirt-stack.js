#! /usr/bin/env node

import process from 'node:process';

/**
 * @function execCli
 * @description CLI branching based on params
 * @param args
 * @returns {Promise<void>}
 */
async function execCli(args) {
  // Execute advanced cli command processor
  if (args.length > 2) {
    const program = await import('../dist/advancedCli.js');
    program.default.parse();
    return;
  }

  // fallback to running default command
  const { cli } = await import('../dist/cli.js');
  cli().then();
}

execCli(process.argv).then();
