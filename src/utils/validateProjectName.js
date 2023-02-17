/**
 * @description Checks a given project name to determine if it is valid
 * @param projectName
 */

// exclude starting with
const validPattern = /^[a-z]\w+$/gim;

/**
 * @description Helper function to validate a project name. Valid project names should start with a letter and not
 * contain spaces or dashes
 * @param projectName
 * @returns {*}
 */
export function validateProjectName(projectName) {
  if (!projectName) return;
  return projectName.match(validPattern);
}
