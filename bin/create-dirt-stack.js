#! /usr/bin/env node

const { cli } = await import('../dist/cli.js');
cli().then();
