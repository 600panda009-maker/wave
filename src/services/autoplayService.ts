import { Track } from '../types/music';
import { fetchJamendoTracks, fallbackTracks } from './jamendoService';
import { getSimilarArtists } from './lastfmService';

const EMOTIONAL_MOODS = new Set([
  'emotional', 'romantic', 'sad', 'heartbreak', 'melancholic', 'ballad', 'soulful', 'slow', 'acoustic', 'love'
]);

export function isEmotionalTrack(track: Track): boolean {
  const allTags = [
    ...(track.mood || []),
    ...(track.tags || []),
    ...(track.genre || [])
  ].map(t => t.toLowerCase());

  return allTags.some(t => EMOTIONAL_MOODS.has(t)) ||
    track.title.toLowerCase().includes('acoustic') ||
    track.title.toLowerCase().includes('love') ||
    track.title.toLowerCase().includes('slow');
}

export async function fetchNextAutoplayTrack(
  currentTrack: Track,
  playedTrackIds: Set<string>
): Promise<Track | null> {
  const isEmotional = isEmotionalTrack(currentTrack);
  const language = currentTrack.language;
  const primaryGenre = currentTrack.genre?.[0] || currentTrack.tags?.[0];
  const primaryMood = currentTrack.mood?.[0];

  try {
    // Stage 1: If emotional + language available -> Strict Mood + Language search
    if (isEmotional && language && language !== 'Instrumental') {
      const candidates = await fetchJamendoTracks({
        fuzzytags: 'emotional+acoustic',
        lang: language.toLowerCase(),
        limit: 10,
      });
      const valid = candidates.filter(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
      if (valid.length > 0) return valid[0];
    }

    // Stage 2: Same Mood + Same Language
    if (primaryMood && language && language !== 'Instrumental') {
      const candidates = await fetchJamendoTracks({
        fuzzytags: primaryMood,
        lang: language.toLowerCase(),
        limit: 10,
      });
      const valid = candidates.filter(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
      if (valid.length > 0) return valid[0];
    }

    // Stage 3: Same Genre + Same Language
    if (primaryGenre && language && language !== 'Instrumental') {
      const candidates = await fetchJamendoTracks({
        tags: primaryGenre,
        lang: language.toLowerCase(),
        limit: 10,
      });
      const valid = candidates.filter(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
      if (valid.length > 0) return valid[0];
    }

    // Stage 4: Similar Artist candidate from Last.fm
    if (currentTrack.artist) {
      const similarArtists = await getSimilarArtists(currentTrack.artist);
      if (similarArtists.length > 0) {
        const topSimilar = similarArtists[0];
        const candidates = await fetchJamendoTracks({
          namesearch: topSimilar,
          limit: 5,
        });
        const valid = candidates.filter(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
        if (valid.length > 0) return valid[0];
      }
    }

    // Stage 5: Same Genre or Mood
    if (primaryGenre || primaryMood) {
      const candidates = await fetchJamendoTracks({
        tags: primaryGenre || primaryMood || 'chillout',
        limit: 15,
      });
      const valid = candidates.filter(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
      if (valid.length > 0) return valid[0];
    }

    // Stage 6: Broader discovery fallback
    const discoveryCandidates = await fetchJamendoTracks({
      featured: 1,
      limit: 15,
    });
    const valid = discoveryCandidates.filter(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
    if (valid.length > 0) return valid[0];

    // Fallback array pick
    const fallback = fallbackTracks.find(t => !playedTrackIds.has(t.id) && t.id !== currentTrack.id);
    return fallback || fallbackTracks[0];
  } catch (err) {
    console.warn('Autoplay fetch failed, using fallback:', err);
    return fallbackTracks.find(t => t.id !== currentTrack.id) || fallbackTracks[0];
  }
}
