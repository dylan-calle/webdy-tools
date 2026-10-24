/**
 * Utility functions for BCrypt hashing, verification, inspection, and password generation.
 */

import bcrypt from "bcryptjs";

export interface BcryptHashInfo {
  isValid: boolean;
  raw: string;
  version: string;
  prefix: string;
  rounds: number;
  iterations: number;
  salt: string;
  checksum: string;
}

/**
 * Validates and deconstructs a 60-character BCrypt hash string.
 * Format: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 */
export function parseBcryptHash(hash: string): BcryptHashInfo {
  const trimmed = hash.trim();
  const match = trimmed.match(
    /^(\$2[abxy]?)\$(\d{2})\$([./A-Za-z0-9]{22})([./A-Za-z0-9]{31})$/
  );

  if (!match) {
    return {
      isValid: false,
      raw: trimmed,
      version: "",
      prefix: "",
      rounds: 0,
      iterations: 0,
      salt: "",
      checksum: "",
    };
  }

  const rounds = parseInt(match[2], 10);
  return {
    isValid: true,
    raw: trimmed,
    version: match[1].replace(/\$/g, ""),
    prefix: match[1],
    rounds,
    iterations: Math.pow(2, rounds),
    salt: match[3],
    checksum: match[4],
  };
}

/**
 * Checks whether a given string is a valid BCrypt hash format.
 */
export function isValidBcryptHash(hash: string): boolean {
  return /^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash.trim());
}

/**
 * Asynchronously generates a BCrypt hash for a plaintext password.
 */
export async function hashPassword(
  password: string,
  rounds = 10
): Promise<{ hash: string; elapsedMs: number; info: BcryptHashInfo }> {
  const start = performance.now();
  const hash = await bcrypt.hash(password, rounds);
  const end = performance.now();

  const elapsedMs = Math.round(end - start);
  const info = parseBcryptHash(hash);

  return { hash, elapsedMs, info };
}

/**
 * Asynchronously checks if a plaintext password matches an existing BCrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<{ match: boolean; elapsedMs: number; error?: string }> {
  if (!isValidBcryptHash(hash)) {
    return {
      match: false,
      elapsedMs: 0,
      error: "Invalid BCrypt hash format. Must be a 60-character string starting with $2a$, $2b$, or $2y$.",
    };
  }

  try {
    const start = performance.now();
    const match = await bcrypt.compare(password, hash.trim());
    const end = performance.now();
    const elapsedMs = Math.round(end - start);

    return { match, elapsedMs };
  } catch (err) {
    return {
      match: false,
      elapsedMs: 0,
      error: err instanceof Error ? err.message : "Error verifying hash",
    };
  }
}

/**
 * Generates a cryptographically strong random password for testing.
 */
export function generateRandomPassword(length = 16): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|";
  let result = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * Preset samples for quick testing.
 */
export const BCRYPT_SAMPLES = {
  plaintext: "SecretPassword123!",
  hash: "$2b$10$nF7z2X2eD33jPq04IUk0dOu3p5vU8c1m56Xw29HhPzO.l6M.a8Z3O",
};
