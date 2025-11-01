/**
 * E2E Test Setup
 * Loads credentials from environment variables for testing against real Jellyfin server
 */

import { JellyfinError } from '../../src/models/types.js';

export interface TestConfig {
  serverUrl: string;
  username: string;
  password: string;
}

/**
 * Load test configuration from environment
 * Fails fast if credentials are missing
 */
export function loadTestConfig(): TestConfig {
  const serverUrl = process.env.JELLYFIN_SERVER_URL;
  const username = process.env.JELLYFIN_TEST_USERNAME;
  const password = process.env.JELLYFIN_TEST_PASSWORD;

  if (!serverUrl) {
    throw new Error(
      'JELLYFIN_SERVER_URL is required for E2E tests. Please set it in .env file.'
    );
  }

  if (!username || !password) {
    throw new Error(
      'JELLYFIN_TEST_USERNAME and JELLYFIN_TEST_PASSWORD are required for E2E tests. Please set them in .env file.'
    );
  }

  console.log(`\nE2E Test Configuration:`);
  console.log(`  Server: ${serverUrl}`);
  console.log(`  Credentials: Configured`);
  console.log(`  Note: If tests fail with 500 errors, verify credentials work in Jellyfin web UI\n`);

  return {
    serverUrl,
    username,
    password,
  };
}

/**
 * Skip tests if credentials are not configured
 */
export function skipIfNoCredentials(): void {
  const hasCredentials =
    process.env.JELLYFIN_TEST_USERNAME && process.env.JELLYFIN_TEST_PASSWORD;

  if (!hasCredentials) {
    console.warn(
      '⚠️  Skipping E2E tests - JELLYFIN_TEST_USERNAME and JELLYFIN_TEST_PASSWORD not set'
    );
  }
}

/**
 * Delay helper for avoiding Jellyfin SQLite concurrency issues
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Standard delay between authentication attempts
 * Helps avoid Jellyfin SQLite concurrency issues
 */
export const AUTH_DELAY = 2000; // 2 seconds

/**
 * Retry configuration for handling transient Jellyfin errors
 * Conservative retry for occasional database locks
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 4000,
};

/**
 * Retry wrapper for authentication to handle transient HTTP 500 errors
 * caused by Jellyfin SQLite database locks
 */
export async function retryableLogin<T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null;
  let delayMs = RETRY_CONFIG.baseDelay;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      const isJellyfinError = error instanceof JellyfinError;
      const statusCode = isJellyfinError ? error.statusCode : undefined;
      const isRetryable = isJellyfinError && statusCode === 500;

      if (!isRetryable || attempt === RETRY_CONFIG.maxAttempts) {
        throw error;
      }

      // Only log on retries, not final failure
      if (process.env.CI) {
        console.warn(
          `⚠️  ${context} failed (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}), retrying in ${delayMs}ms...`
        );
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * 2, RETRY_CONFIG.maxDelay);
    }
  }

  throw lastError;
}
