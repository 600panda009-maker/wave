import { Track } from '../types/music';
import { UserTasteProfile } from '../types/user';
import { getStoredTasteProfile, saveStoredTasteProfile } from '../utils/storage';

export function calculateCandidateScore(
  track: Track,
  taste: UserTasteProfile,
  likedTrackIds: Set<string>,
  recentTrackIds: Set<string>
): number {
  let score = 0.5; // Base novelty score

  // 1. Liked boost
  if (likedTrackIds.has(track.id)) {
    score += 0.3;
  }

  // 2. Penalty if recently played to encourage diversity
  if (recentTrackIds.has(track.id)) {
    score -= 0.6;
  }

  // 3. Artist affinity
  if (track.artist && taste.artists[track.artist]) {
    score += Math.min(0.4, taste.artists[track.artist] * 0.2);
  }

  // 4. Genre affinity
  if (track.genre && track.genre.length > 0) {
    let genreMatch = 0;
    for (const g of track.genre) {
      const gLower = g.toLowerCase();
      if (taste.genres[gLower]) {
        genreMatch += taste.genres[gLower];
      }
    }
    score += Math.min(0.35, genreMatch * 0.15);
  }

  // 5. Mood affinity
  if (track.mood && track.mood.length > 0) {
    let moodMatch = 0;
    for (const m of track.mood) {
      const mLower = m.toLowerCase();
      if (taste.moods[mLower]) {
        moodMatch += taste.moods[mLower];
      }
    }
    score += Math.min(0.35, moodMatch * 0.15);
  }

  // 6. Language affinity
  if (track.language && taste.languages[track.language]) {
    score += Math.min(0.3, taste.languages[track.language] * 0.2);
  }

  return score;
}

export function updateTasteProfile(
  prevTaste: UserTasteProfile,
  track: Track,
  event: 'completed' | 'skip' | 'like' | 'replay'
): UserTasteProfile {
  const updated: UserTasteProfile = {
    genres: { ...prevTaste.genres },
    moods: { ...prevTaste.moods },
    languages: { ...prevTaste.languages },
    artists: { ...prevTaste.artists },
  };

  const delta = event === 'like' ? 0.4 : event === 'replay' ? 0.3 : event === 'completed' ? 0.2 : -0.25;

  // Update artist
  if (track.artist) {
    const curr = updated.artists[track.artist] || 0;
    updated.artists[track.artist] = Math.max(0, curr + delta);
  }

  // Update genres
  if (track.genre) {
    for (const g of track.genre) {
      const key = g.toLowerCase();
      const curr = updated.genres[key] || 0;
      updated.genres[key] = Math.max(0, curr + delta);
    }
  }

  // Update moods
  if (track.mood) {
    for (const m of track.mood) {
      const key = m.toLowerCase();
      const curr = updated.moods[key] || 0;
      updated.moods[key] = Math.max(0, curr + delta);
    }
  }

  // Update language
  if (track.language) {
    const curr = updated.languages[track.language] || 0;
    updated.languages[track.language] = Math.max(0, curr + delta);
  }

  saveStoredTasteProfile(updated);
  return updated;
}
