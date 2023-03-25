/**
 * @description Helper function that fixes windows file paths. Not needed for Posix
 * @param {string} filePath
 */
export function normalizeWinFilePath(filePath: string) {
  return filePath.replace(/^([A-Z]:\\)([A-Z]:\\)/i, '$2');
}
