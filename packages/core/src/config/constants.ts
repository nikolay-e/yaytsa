/**
 * Shared application constants
 */

/**
 * Application metadata
 */
export const APP_VERSION = '0.1.0';
export const DEFAULT_CLIENT_NAME = 'Jellyfin Mini Client';
export const DEFAULT_DEVICE_NAME = 'Web Browser';

/**
 * Storage keys for browser storage
 */
export const STORAGE_KEYS = {
  DEVICE_ID: 'jellyfin_device_id',
  SESSION: 'jf_session',
  USER_ID: 'jf_user_id',
  SERVER_URL: 'jf_server_url',
} as const;

/**
 * Jellyfin ticks conversion
 * Jellyfin uses ticks (10,000,000 ticks per second) for time positions
 */
export const TICKS_PER_SECOND = 10_000_000;

/**
 * Convert seconds to Jellyfin ticks
 */
export function secondsToTicks(seconds: number): number {
  return Math.floor(seconds * TICKS_PER_SECOND);
}

/**
 * Convert Jellyfin ticks to seconds
 */
export function ticksToSeconds(ticks: number): number {
  return ticks / TICKS_PER_SECOND;
}
