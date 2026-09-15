import { describe, it, expect } from 'vitest';
import { isEmotionalTrack } from '../services/autoplayService';
import { Track } from '../types/music';

describe('autoplayService', () => {
  it('correctly detects emotional tracks based on mood, tags, and title', () => {
    const track1: Track = {
      id: 't1',
      source: 'jamendo',
      title: 'Acoustic Rain',
      artist: 'Singer',
      artworkUrl: '',
      duration: 200,
      isStreamable: true,
      mood: ['emotional', 'sad'],
      language: 'Hindi',
    };

    const track2: Track = {
      id: 't2',
      source: 'jamendo',
      title: 'Club Bangers Vol 1',
      artist: 'DJ Beats',
      artworkUrl: '',
      duration: 180,
      isStreamable: true,
      mood: ['energy', 'party'],
      tags: ['dance', 'edm'],
    };

    expect(isEmotionalTrack(track1)).toBe(true);
    expect(isEmotionalTrack(track2)).toBe(false);
  });
});
