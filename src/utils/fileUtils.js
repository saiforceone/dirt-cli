/**
 * @description Helper function that fixes windows file paths. Not needed for Posix
 * @param filePath
 * @returns {*}
 */
export function normalizeWinFilePath(filePath) {
  return filePath.replace(/^([A-Z]:\\)([A-Z]:\\)/i, '$2');
}
