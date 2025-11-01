/**
 * Jellyfin Mini Client - Platform Package
 * Platform-specific adapters and interfaces
 */

// Audio engine interface and implementations
export type { AudioEngine } from './audio.interface.js';
export { HTML5AudioEngine } from './web/html5-audio.js';

// Media Session API for background playback
export { MediaSessionManager } from './media-session.js';
export type { MediaMetadata, MediaSessionHandlers } from './media-session.js';
