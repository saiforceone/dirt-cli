/**
 * @description We are using the cryptoRandomString library since we can't
 * depend on having something like opensl being installed.
 */
import cryptoRandomString from 'crypto-random-string';

/**
 * Helper function that generates a secret for our django application
 * @param length
 * @returns {string}
 */
export function generateSecretKey(length = 64) {
  return cryptoRandomString({ length, type: 'ascii-printable' });
}
