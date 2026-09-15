import { Track } from '../../types/music';
import { LyricsResult } from '../../types/lyrics';
import { LyricsProvider, parseLrc, parsePlainText } from './lyricsAdapter';

export class LrclibProvider implements LyricsProvider {
  name = 'LRCLIB';

  isAvailable(): boolean {
    return true;
  }

  async getLyrics(track: Track): Promise<LyricsResult | null> {
    try {
      const cleanTitle = track.title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
      const params = new URLSearchParams({
        track_name: cleanTitle,
        artist_name: track.artist,
      });

      if (track.duration) {
        params.append('duration', String(Math.round(track.duration)));
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
        headers: {
          'L-User-Agent': 'WaveMusicPlayer/1.0 (https://github.com/wave/player)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        // Try fuzzy search fallback on lrclib
        return this.searchFallback(cleanTitle, track.artist);
      }

      const data = await res.json();
      if (data.syncedLyrics) {
        const lines = parseLrc(data.syncedLyrics);
        return {
          synced: true,
          lines,
          plainLyrics: data.plainLyrics,
          source: 'LRCLIB',
          fetchedAt: Date.now(),
        };
      }

      if (data.plainLyrics) {
        return {
          synced: false,
          lines: parsePlainText(data.plainLyrics),
          plainLyrics: data.plainLyrics,
          source: 'LRCLIB (Plain)',
          fetchedAt: Date.now(),
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  private async searchFallback(trackName: string, artistName: string): Promise<LyricsResult | null> {
    try {
      const query = encodeURIComponent(`${trackName} ${artistName}`);
      const res = await fetch(`https://lrclib.net/api/search?q=${query}`, {
        headers: {
          'L-User-Agent': 'WaveMusicPlayer/1.0 (https://github.com/wave/player)',
        },
      });
      if (!res.ok) return null;
      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) return null;

      const firstMatch = results[0];
      if (firstMatch.syncedLyrics) {
        return {
          synced: true,
          lines: parseLrc(firstMatch.syncedLyrics),
          plainLyrics: firstMatch.plainLyrics,
          source: 'LRCLIB',
          fetchedAt: Date.now(),
        };
      }

      if (firstMatch.plainLyrics) {
        return {
          synced: false,
          lines: parsePlainText(firstMatch.plainLyrics),
          plainLyrics: firstMatch.plainLyrics,
          source: 'LRCLIB (Plain)',
          fetchedAt: Date.now(),
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
