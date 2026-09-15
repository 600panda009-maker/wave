import { Track } from './music';

export interface UserProfile {
  id: string;
  auth0Sub?: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserTasteProfile {
  genres: Record<string, number>;
  moods: Record<string, number>;
  languages: Record<string, number>;
  artists: Record<string, number>;
}

export interface ListeningHistoryItem {
  id: string;
  track: Track;
  playedAt: string;
  secondsPlayed: number;
  completionRatio: number;
  skipped: boolean;
}

export interface AppSettings {
  autoplay: boolean;
  dynamicBackground: boolean;
  backgroundIntensity: number; // 0.1 to 1.0
  reducedMotion: boolean;
  preferredLyricsProvider: string;
  syncedLyricsEnabled: boolean;
  autoScrollLyrics: boolean;
  explicitContentFilter: 'show' | 'hide' | 'warn';
  highQualityAudio: boolean;
}

export interface GlobalTrackStat {
  trackSource: string;
  trackId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  playCount: number;
  uniqueListeners: number;
  lastPlayedAt: string;
}
