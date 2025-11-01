/**
 * Time formatting utilities
 */

/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
export function formatDuration(seconds: number): string {
  // Handle invalid or negative values
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  // Handle zero explicitly for clarity
  if (seconds === 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to time string for playback display
 */
export function formatTime(seconds: number): string {
  return formatDuration(seconds);
}

/**
 * Parse time string (MM:SS or HH:MM:SS) to seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}
