import ScaffoldOutput = DIRTStackCLI.ScaffoldOutput;

/**
 * @description Standard output builder function
 */
export function standardOutputBuilder(): ScaffoldOutput {
  return {
    error: '',
    result: '',
    success: false,
  };
}
