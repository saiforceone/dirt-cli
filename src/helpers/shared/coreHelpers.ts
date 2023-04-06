import { existsSync } from 'node:fs';
import { standardOutputBuilder } from '../../utils/standardOutputBuilder.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

/**
 * @description Given the project destination (directory path), checks if it already exists
 * @param {string} destination - the destination of the project
 */
export function checkDestinationExistence(destination: string): ScaffoldOutput {
  const output = standardOutputBuilder();
  const destinationExists = existsSync(destination);
  if (destinationExists)
    output.error = `Project destination path: [${destination}] already exists.\nYou may need to remove the corresponding virtual environment if it exists`;
  output.result = destinationExists
    ? 'Project destination already exists'
    : 'Project can be created at destination';
  output.success = destinationExists;
  return output;
}
