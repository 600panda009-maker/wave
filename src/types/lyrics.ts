export interface LyricLine {
  startMs: number;
  endMs: number;
  text: string;
}

export interface LyricsResult {
  synced: boolean;
  lines: LyricLine[];
  plainLyrics?: string;
  source: string;
  fetchedAt: number;
}
