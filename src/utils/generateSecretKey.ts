/**
 * @description We are using the cryptoRandomString library since we can't
 * depend on having something like opensl being installed.
 */
import cryptoRandomString from 'crypto-random-string';

/**
 * Helper function that generates a secret for our django application
 * @param {number} length
 * @returns {string}
 */
export function generateSecretKey(length: number = 64): string {
  return cryptoRandomString({ length, type: 'url-safe' });
}
