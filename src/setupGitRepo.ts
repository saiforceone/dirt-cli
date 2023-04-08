import { exec } from 'child_process';
import { standardOutputBuilder } from './utils/standardOutputBuilder.js';
import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

/**
 * @description Executes the command to initialize git...(this is really overkill)
 * @returns {Promise<*>}
 */
export function setupGitRepo(): Promise<ScaffoldOutput> {
  const output = standardOutputBuilder();
  return new Promise((resolve, reject) => {
    exec('git init', (error) => {
      if (error) {
        output.error = error.message;
        reject(output);
      }

      output.success = true;
      resolve(output);
    });
  });
}
