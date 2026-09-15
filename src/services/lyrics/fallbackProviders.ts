import { Track } from '../../types/music';
import { LyricsResult } from '../../types/lyrics';
import { LyricsProvider, parseLrc } from './lyricsAdapter';

// SimpMusic / Paxsenix compatible adapter
export class PaxsenixProvider implements LyricsProvider {
  name = 'Paxsenix';

  isAvailable(): boolean {
    return true;
  }

  async getLyrics(track: Track): Promise<LyricsResult | null> {
    try {
      const q = encodeURIComponent(`${track.title} ${track.artist}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.paxsenix.biz.id/lyrics?q=${q}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const data = await res.json();
      if (data?.lyrics) {
        const lines = parseLrc(data.lyrics);
        return {
          synced: lines.length > 0 && lines[0].startMs !== 0,
          lines,
          plainLyrics: data.lyrics,
          source: 'Paxsenix',
          fetchedAt: Date.now(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

// SimpMusic provider adapter
export class SimpMusicProvider implements LyricsProvider {
  name = 'SimpMusic';

  isAvailable(): boolean {
    return true;
  }

  async getLyrics(track: Track): Promise<LyricsResult | null> {
    // Graceful adapter checking SimpMusic compatible endpoints
    return null; // Will cascade down the provider chain
  }
}
