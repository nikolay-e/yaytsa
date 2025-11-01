/**
 * E2E Queue Tests
 * Tests playback queue operations (no server interaction, but tests with real data structures)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PlaybackQueue } from '../../src/player/queue.js';
import type { AudioItem } from '../../src/models/types.js';

describe('E2E: Playback Queue', () => {
  let queue: PlaybackQueue;

  // Mock track data that mimics real Jellyfin response
  const mockTracks: AudioItem[] = [
    {
      Id: 'track-1',
      Name: 'Track 1',
      Type: 'Audio',
      RunTimeTicks: 2400000000,
      AlbumId: 'album-1',
      Album: 'Test Album',
      Artists: ['Test Artist'],
      IndexNumber: 1,
    },
    {
      Id: 'track-2',
      Name: 'Track 2',
      Type: 'Audio',
      RunTimeTicks: 2500000000,
      AlbumId: 'album-1',
      Album: 'Test Album',
      Artists: ['Test Artist'],
      IndexNumber: 2,
    },
    {
      Id: 'track-3',
      Name: 'Track 3',
      Type: 'Audio',
      RunTimeTicks: 2600000000,
      AlbumId: 'album-1',
      Album: 'Test Album',
      Artists: ['Test Artist'],
      IndexNumber: 3,
    },
  ];

  beforeEach(() => {
    queue = new PlaybackQueue();
  });

  describe('Queue Operations', () => {
    it('should initialize with empty queue', () => {
      expect(queue.getAllItems()).toHaveLength(0);
      expect(queue.getCurrentItem()).toBeNull();
      expect(queue.getCurrentIndex()).toBe(-1);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should set queue with tracks', () => {
      queue.setQueue(mockTracks);

      expect(queue.getAllItems()).toHaveLength(3);
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
      expect(queue.getCurrentIndex()).toBe(0);
      expect(queue.isEmpty()).toBe(false);
    });

    it('should add single track to queue', () => {
      queue.addToQueue(mockTracks[0]);

      expect(queue.getAllItems()).toHaveLength(1);
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
    });

    it('should add multiple tracks to queue', () => {
      queue.addToQueue(mockTracks[0]);
      queue.addToQueue(mockTracks[1]);
      queue.addToQueue(mockTracks[2]);

      expect(queue.getAllItems()).toHaveLength(3);
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
    });

    it('should remove track from queue', () => {
      queue.setQueue(mockTracks);
      queue.removeAt(1);

      expect(queue.getAllItems()).toHaveLength(2);
      expect(queue.getAllItems()[1]).toEqual(mockTracks[2]);
    });

    it('should clear queue', () => {
      queue.setQueue(mockTracks);
      queue.clear();

      expect(queue.getAllItems()).toHaveLength(0);
      expect(queue.getCurrentItem()).toBeNull();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      queue.setQueue(mockTracks);
    });

    it('should move to next track', () => {
      const nextTrack = queue.next();

      expect(nextTrack).toEqual(mockTracks[1]);
      expect(queue.getCurrentIndex()).toBe(1);
      expect(queue.getCurrentItem()).toEqual(mockTracks[1]);
    });

    it('should move to previous track', () => {
      queue.next();
      const prevTrack = queue.previous();

      expect(prevTrack).toEqual(mockTracks[0]);
      expect(queue.getCurrentIndex()).toBe(0);
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
    });

    it('should return null when no next track', () => {
      queue.next();
      queue.next();
      const nextTrack = queue.next();

      expect(nextTrack).toBeNull();
      expect(queue.getCurrentIndex()).toBe(2);
    });

    it('should return null when no previous track', () => {
      const prevTrack = queue.previous();

      expect(prevTrack).toBeNull();
      expect(queue.getCurrentIndex()).toBe(0);
    });

    it('should jump to specific index', () => {
      const track = queue.jumpTo(2);

      expect(track).toEqual(mockTracks[2]);
      expect(queue.getCurrentIndex()).toBe(2);
      expect(queue.getCurrentItem()).toEqual(mockTracks[2]);
    });

    it('should check hasNext and hasPrevious', () => {
      expect(queue.hasNext()).toBe(true);
      expect(queue.hasPrevious()).toBe(false);

      queue.next();
      expect(queue.hasNext()).toBe(true);
      expect(queue.hasPrevious()).toBe(true);

      queue.next();
      expect(queue.hasNext()).toBe(false);
      expect(queue.hasPrevious()).toBe(true);
    });
  });

  describe('Shuffle', () => {
    beforeEach(() => {
      queue.setQueue(mockTracks);
    });

    it('should shuffle queue', () => {
      expect(queue.getShuffleMode()).toBe('off');

      queue.toggleShuffleMode();

      const shuffledQueue = queue.getAllItems();
      expect(shuffledQueue).toHaveLength(3);
      expect(shuffledQueue[0]).toEqual(mockTracks[0]); // Current track stays first
      expect(queue.getShuffleMode()).toBe('on');
    });

    it('should restore original order when unshuffle', () => {
      queue.toggleShuffleMode();
      queue.toggleShuffleMode();

      expect(queue.getAllItems()).toEqual(mockTracks);
      expect(queue.getShuffleMode()).toBe('off');
    });
  });

  describe('Repeat Modes', () => {
    beforeEach(() => {
      queue.setQueue(mockTracks);
    });

    it('should cycle through repeat modes', () => {
      expect(queue.getRepeatMode()).toBe('off');

      queue.toggleRepeatMode();
      expect(queue.getRepeatMode()).toBe('all');

      queue.toggleRepeatMode();
      expect(queue.getRepeatMode()).toBe('one');

      queue.toggleRepeatMode();
      expect(queue.getRepeatMode()).toBe('off');
    });

    it('should repeat current track in repeat-one mode', () => {
      queue.setRepeatMode('one');
      const currentTrack = queue.getCurrentItem();
      const nextTrack = queue.next();

      // Should still be on first track
      expect(nextTrack).toEqual(currentTrack);
      expect(queue.getCurrentIndex()).toBe(0);
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
    });

    it('should loop to beginning in repeat-all mode', () => {
      queue.setRepeatMode('all');
      queue.jumpTo(2); // Last track
      const nextTrack = queue.next();

      expect(nextTrack).toEqual(mockTracks[0]);
      expect(queue.getCurrentIndex()).toBe(0);
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
    });
  });

  describe('Queue Management', () => {
    it('should handle empty queue gracefully', () => {
      expect(queue.next()).toBeNull();
      expect(queue.previous()).toBeNull();
      expect(queue.getCurrentItem()).toBeNull();
      expect(queue.hasNext()).toBe(false);
      expect(queue.hasPrevious()).toBe(false);
    });

    it('should handle single track queue', () => {
      queue.addToQueue(mockTracks[0]);

      expect(queue.next()).toBeNull();
      expect(queue.previous()).toBeNull();
      expect(queue.getCurrentItem()).toEqual(mockTracks[0]);
      expect(queue.hasNext()).toBe(false);
      expect(queue.hasPrevious()).toBe(false);
    });

    it('should update current index when removing current track', () => {
      queue.setQueue(mockTracks);
      queue.removeAt(0);

      expect(queue.getCurrentIndex()).toBe(0);
      expect(queue.getCurrentItem()).toEqual(mockTracks[1]);
    });

    it('should get item at specific index', () => {
      queue.setQueue(mockTracks);

      expect(queue.getItemAt(0)).toEqual(mockTracks[0]);
      expect(queue.getItemAt(1)).toEqual(mockTracks[1]);
      expect(queue.getItemAt(2)).toEqual(mockTracks[2]);
      expect(queue.getItemAt(3)).toBeNull();
    });

    it('should move items in queue', () => {
      queue.setQueue(mockTracks);
      const moved = queue.moveItem(2, 0);

      expect(moved).toBe(true);
      expect(queue.getItemAt(0)).toEqual(mockTracks[2]);
      expect(queue.getItemAt(1)).toEqual(mockTracks[0]);
      expect(queue.getItemAt(2)).toEqual(mockTracks[1]);
    });
  });
});
