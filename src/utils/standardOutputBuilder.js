/**
 * @description TEMPORARY (until TypeScript) output builder function to standardize output from functions that return promises
 * @returns {{error: String, result: *, success: boolean}}
 */
// TODO: REMOVE (to Sai) this when TypeScript is set up for this CLI project
export function standardOutputBuilder() {
  return {
    error: '',
    result: undefined,
    success: false,
  };
}
