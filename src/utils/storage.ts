import { Track, Playlist } from '../types/music';
import { ListeningHistoryItem, UserTasteProfile, AppSettings } from '../types/user';

const STORAGE_KEYS = {
  LIKES: 'wave_likes',
  PLAYLISTS: 'wave_playlists',
  HISTORY: 'wave_history',
  TASTE_PROFILE: 'wave_taste_profile',
  SETTINGS: 'wave_settings',
  ONBOARDING_DONE: 'wave_onboarding_done',
  LAST_PLAYED: 'wave_last_played',
  DISCORD_BRIDGE: 'wave_discord_bridge_config',
};

export const defaultSettings: AppSettings = {
  autoplay: true,
  dynamicBackground: true,
  backgroundIntensity: 0.8,
  reducedMotion: false,
  preferredLyricsProvider: 'lrclib',
  syncedLyricsEnabled: true,
  autoScrollLyrics: true,
  explicitContentFilter: 'show',
  highQualityAudio: true,
};

export const defaultTasteProfile: UserTasteProfile = {
  genres: {},
  moods: {},
  languages: {},
  artists: {},
};

const inMemoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch {
        return inMemoryStorage.get(key) || null;
      }
    }
    return inMemoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        inMemoryStorage.set(key, value);
        return;
      }
    }
    inMemoryStorage.set(key, value);
  },
};

export function getStoredLikes(): Track[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.LIKES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredLikes(tracks: Track[]): void {
  try {
    safeStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(tracks));
  } catch (err) {
    console.warn('Failed to save likes to storage', err);
  }
}

export function getStoredPlaylists(): Playlist[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredPlaylists(playlists: Playlist[]): void {
  try {
    safeStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch (err) {
    console.warn('Failed to save playlists to storage', err);
  }
}

export function getStoredHistory(): ListeningHistoryItem[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: ListeningHistoryItem[]): void {
  try {
    const trimmed = history.slice(0, 200);
    safeStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to save history to storage', err);
  }
}

export function getStoredTasteProfile(): UserTasteProfile {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.TASTE_PROFILE);
    return raw ? JSON.parse(raw) : defaultTasteProfile;
  } catch {
    return defaultTasteProfile;
  }
}

export function saveStoredTasteProfile(profile: UserTasteProfile): void {
  try {
    safeStorage.setItem(STORAGE_KEYS.TASTE_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save taste profile to storage', err);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to storage', err);
  }
}

export function isOnboardingCompleted(): boolean {
  return safeStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
}

export function setOnboardingCompleted(completed = true): void {
  safeStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, completed ? 'true' : 'false');
}

export function getStoredLastPlayed(): { track: Track; queue: Track[]; index: number } | null {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredLastPlayed(data: { track: Track; queue: Track[]; index: number }): void {
  try {
    safeStorage.setItem(STORAGE_KEYS.LAST_PLAYED, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save last played to storage', err);
  }
}
