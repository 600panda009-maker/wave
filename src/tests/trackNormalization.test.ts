import { describe, it, expect } from 'vitest';
import { normalizeJamendoTrack, JamendoRawTrack } from '../services/jamendoService';

describe('normalizeJamendoTrack', () => {
  it('normalizes raw Jamendo track payload into canonical Wave Track', () => {
    const raw: JamendoRawTrack = {
      id: '123456',
      name: 'Midnight Echoes',
      duration: 215,
      artist_id: 'art_99',
      artist_name: 'Luna Waves',
      album_name: 'Solitude',
      album_id: 'alb_77',
      image: 'https://example.com/cover.jpg',
      audio: 'https://example.com/stream.mp3',
      shareurl: 'https://jamendo.com/track/123456',
      musicinfo: {
        lang: 'English',
        speed: 'medium',
        vocalinstrumental: 'vocal',
        tags: {
          genres: ['chillout', 'electronic'],
          vartags: ['emotional', 'calm'],
        },
      },
    };

    const normalized = normalizeJamendoTrack(raw);

    expect(normalized.id).toBe('jamendo_123456');
    expect(normalized.source).toBe('jamendo');
    expect(normalized.title).toBe('Midnight Echoes');
    expect(normalized.artist).toBe('Luna Waves');
    expect(normalized.duration).toBe(215);
    expect(normalized.artworkUrl).toBe('https://example.com/cover.jpg');
    expect(normalized.streamUrl).toBe('https://example.com/stream.mp3');
    expect(normalized.language).toBe('English');
    expect(normalized.genre).toEqual(['chillout', 'electronic']);
    expect(normalized.mood).toEqual(['emotional', 'calm']);
    expect(normalized.isStreamable).toBe(true);
  });

  it('detects explicit keywords', () => {
    const rawExplicit: JamendoRawTrack = {
      id: '999',
      name: 'Uncensored Explicit Track',
      duration: 180,
      artist_id: '1',
      artist_name: 'Rebel',
      audio: 'https://example.com/audio.mp3',
    };

    const normalized = normalizeJamendoTrack(rawExplicit);
    expect(normalized.explicit).toBe(true);
  });
});
