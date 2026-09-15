import { Track } from '../../types/music';
import { LyricsResult } from '../../types/lyrics';
import { LyricsProvider } from './lyricsAdapter';
import { LrclibProvider } from './lrclibProvider';
import { PaxsenixProvider, SimpMusicProvider } from './fallbackProviders';

const providers: LyricsProvider[] = [
  new LrclibProvider(),
  new PaxsenixProvider(),
  new SimpMusicProvider(),
];

const lyricsCache = new Map<string, LyricsResult>();

export async function fetchLyrics(track: Track): Promise<LyricsResult | null> {
  const cacheKey = `${track.artist}-${track.title}`.toLowerCase();
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  for (const provider of providers) {
    if (!provider.isAvailable()) continue;
    try {
      const result = await provider.getLyrics(track);
      if (result && (result.lines.length > 0 || result.plainLyrics)) {
        lyricsCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn(`Provider ${provider.name} failed:`, err);
    }
  }

  return null;
}

export { parseLrc, parsePlainText } from './lyricsAdapter';
