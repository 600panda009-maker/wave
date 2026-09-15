import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCandidateScore, updateTasteProfile } from '../services/recommendationService';
import { UserTasteProfile } from '../types/user';
import { Track } from '../types/music';

describe('recommendationService', () => {
  const baseTaste: UserTasteProfile = {
    genres: { chillout: 0.8, electronic: 0.5 },
    moods: { calm: 0.9 },
    languages: { English: 0.7 },
    artists: { 'Aetheric Waves': 0.6 },
  };

  const sampleTrack: Track = {
    id: 't_rec',
    source: 'jamendo',
    title: 'Drifting Clouds',
    artist: 'Aetheric Waves',
    artworkUrl: '',
    duration: 180,
    isStreamable: true,
    genre: ['chillout'],
    mood: ['calm'],
    language: 'English',
  };

  it('awards higher score to matching genre, mood, artist, and liked tracks', () => {
    const scoreNotLiked = calculateCandidateScore(sampleTrack, baseTaste, new Set(), new Set());
    const scoreLiked = calculateCandidateScore(sampleTrack, baseTaste, new Set(['t_rec']), new Set());
    expect(scoreLiked).toBeGreaterThan(scoreNotLiked);
  });

  it('penalizes recently played tracks to encourage discovery', () => {
    const scoreFresh = calculateCandidateScore(sampleTrack, baseTaste, new Set(), new Set());
    const scoreRecent = calculateCandidateScore(sampleTrack, baseTaste, new Set(), new Set(['t_rec']));
    expect(scoreRecent).toBeLessThan(scoreFresh);
  });

  it('updates taste profile positively on like and negatively on skip', () => {
    const updatedLike = updateTasteProfile(baseTaste, sampleTrack, 'like');
    expect(updatedLike.genres.chillout).toBeGreaterThan(baseTaste.genres.chillout);
    expect(updatedLike.artists['Aetheric Waves']).toBeGreaterThan(baseTaste.artists['Aetheric Waves']);

    const updatedSkip = updateTasteProfile(baseTaste, sampleTrack, 'skip');
    expect(updatedSkip.genres.chillout).toBeLessThan(updatedLike.genres.chillout);
  });
});
