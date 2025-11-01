/**
 * Image URL utilities
 */

import { get } from 'svelte/store';
import { client } from '../stores/auth.js';

/**
 * Shared image size configuration
 */
const IMAGE_SIZES = {
  small: 150,
  medium: 300,
  large: 600,
} as const;

const DEFAULT_IMAGE_QUALITY = 90;

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Get image URL for an item
 */
export function getImageUrl(
  itemId: string,
  imageType: string = 'Primary',
  options?: {
    tag?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): string {
  const $client = get(client);

  if (!$client) {
    return '';
  }

  return $client.getImageUrl(itemId, imageType, options);
}

/**
 * Get album art URL with default sizing
 */
export function getAlbumArtUrl(albumId: string, size: ImageSize = 'medium'): string {
  return getImageUrl(albumId, 'Primary', {
    maxWidth: IMAGE_SIZES[size],
    maxHeight: IMAGE_SIZES[size],
    quality: DEFAULT_IMAGE_QUALITY,
  });
}

/**
 * Get artist image URL
 */
export function getArtistImageUrl(artistId: string, size: ImageSize = 'medium'): string {
  return getImageUrl(artistId, 'Primary', {
    maxWidth: IMAGE_SIZES[size],
    maxHeight: IMAGE_SIZES[size],
    quality: DEFAULT_IMAGE_QUALITY,
  });
}
