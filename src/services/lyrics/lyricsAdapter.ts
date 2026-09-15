import { Track } from '../../types/music';
import { LyricsResult, LyricLine } from '../../types/lyrics';

export interface LyricsProvider {
  name: string;
  isAvailable(): boolean;
  getLyrics(track: Track): Promise<LyricsResult | null>;
}

// Helper to parse standard LRC formatted text [mm:ss.xx] into structured LyricLines
export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;

    timeRegex.lastIndex = 0;
    let match;
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
      const startMs = (minutes * 60 + seconds) * 1000 + ms;
      result.push({
        startMs,
        endMs: 0, // Calculated in pass below
        text,
      });
    }
  }

  // Sort by startMs
  result.sort((a, b) => a.startMs - b.startMs);

  // Calculate endMs
  for (let i = 0; i < result.length; i++) {
    if (i < result.length - 1) {
      result[i].endMs = result[i + 1].startMs;
    } else {
      result[i].endMs = result[i].startMs + 5000;
    }
  }

  return result;
}

// Helper to parse plain text lyrics into non-synced lines
export function parsePlainText(plainText: string): LyricLine[] {
  if (!plainText) return [];
  const lines = plainText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return lines.map((text, idx) => ({
    startMs: idx * 4000,
    endMs: (idx + 1) * 4000,
    text,
  }));
}
