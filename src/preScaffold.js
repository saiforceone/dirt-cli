import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const art = require('ascii-art');

/**
 * @description Prints out a dirt stack welcome message
 */
export function preScaffold() {
  art.style('D.I.R.T Stack', 'green');
}
