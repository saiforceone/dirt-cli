#! /usr/bin/env node

const { cli } = await import('../src/cli.js');
cli(process.argv).then();
