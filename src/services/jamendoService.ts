import { Track } from '../types/music';

const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Jamendo official developer portal client ID or development test ID fallback
const DEFAULT_CLIENT_ID = '709fa152';
export const getJamendoClientId = () => {
  const envId = import.meta.env.VITE_JAMENDO_CLIENT_ID;
  return envId && envId.trim() ? envId.trim() : DEFAULT_CLIENT_ID;
};

// In-memory cache for API calls to prevent repeated queries and handle rate limits
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCache<T>(key: string, data: T): void {
  // Max 100 cache entries
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { timestamp: Date.now(), data });
}

export interface JamendoRawTrack {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  artist_idstr?: string;
  album_name?: string;
  album_id?: string;
  license_ccurl?: string;
  position?: number;
  releasedate?: string;
  album_image?: string;
  image?: string;
  audio: string;
  audiodownload?: string;
  shareurl?: string;
  musicinfo?: {
    vocalinstrumental?: string;
    lang?: string;
    gender?: string;
    acousticelectric?: string;
    speed?: string;
    tags?: {
      genres?: string[];
      instruments?: string[];
      vartags?: string[];
    };
  };
}

export function normalizeJamendoTrack(raw: JamendoRawTrack): Track {
  const tags: string[] = [];
  const genres: string[] = [];
  const moods: string[] = [];

  if (raw.musicinfo?.tags) {
    if (raw.musicinfo.tags.genres) genres.push(...raw.musicinfo.tags.genres);
    if (raw.musicinfo.tags.vartags) moods.push(...raw.musicinfo.tags.vartags);
    tags.push(...genres, ...moods);
  }

  // Artwork resolution
  const artwork = raw.image || raw.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';

  // Detect explicit content heuristics or provider tags
  const isExplicit = (raw.name + ' ' + (raw.musicinfo?.tags?.vartags?.join(' ') || '')).toLowerCase().includes('explicit');

  return {
    id: `jamendo_${raw.id}`,
    source: 'jamendo',
    title: raw.name || 'Untitled',
    artist: raw.artist_name || 'Independent Artist',
    artistId: raw.artist_id,
    album: raw.album_name || 'Single',
    albumId: raw.album_id,
    artworkUrl: artwork,
    streamUrl: raw.audio,
    duration: raw.duration || 180,
    tags,
    genre: genres,
    mood: moods,
    language: raw.musicinfo?.lang || undefined,
    explicit: isExplicit,
    isStreamable: Boolean(raw.audio),
    externalUrl: raw.shareurl,
    licenseUrl: raw.license_ccurl,
    providerMetadata: {
      jamendoId: raw.id,
      vocalinstrumental: raw.musicinfo?.vocalinstrumental,
      speed: raw.musicinfo?.speed,
    }
  };
}

// Fallback high-quality royalty-free tracks for offline or network timeout resilience
export const fallbackTracks: Track[] = [
  {
    id: 'jamendo_fallback_1',
    source: 'jamendo',
    title: 'Neon Horizon',
    artist: 'Aetheric Waves',
    album: 'Cybernetic Dreams',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://prod-1.storage.jamendo.com/download/track/1885440/mp32/',
    duration: 214,
    tags: ['synthwave', 'electronic', 'calm', 'night'],
    genre: ['synthwave', 'electronic'],
    mood: ['calm', 'relaxing', 'night'],
    language: 'Instrumental',
    explicit: false,
    isStreamable: true,
  },
  {
    id: 'jamendo_fallback_2',
    source: 'jamendo',
    title: 'Midnight Reflection',
    artist: 'Serenade Ensemble',
    album: 'Echoes of Calm',
    artworkUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://prod-1.storage.jamendo.com/download/track/1865860/mp32/',
    duration: 185,
    tags: ['ambient', 'chillout', 'peaceful'],
    genre: ['ambient', 'chillout'],
    mood: ['calm', 'emotional', 'peaceful'],
    language: 'Instrumental',
    explicit: false,
    isStreamable: true,
  },
  {
    id: 'jamendo_fallback_3',
    source: 'jamendo',
    title: 'Rhythms of Monsoon',
    artist: 'Sitar & Soul',
    album: 'Eastern Horizons',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://prod-1.storage.jamendo.com/download/track/1825123/mp32/',
    duration: 240,
    tags: ['world', 'indian', 'emotional', 'calm'],
    genre: ['world', 'acoustic'],
    mood: ['emotional', 'peaceful'],
    language: 'Hindi',
    explicit: false,
    isStreamable: true,
  },
  {
    id: 'jamendo_fallback_4',
    source: 'jamendo',
    title: 'Starlight Voyage',
    artist: 'Cosmic Journey',
    album: 'Nebula',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://prod-1.storage.jamendo.com/download/track/1792345/mp32/',
    duration: 198,
    tags: ['electronic', 'dance', 'upbeat'],
    genre: ['electronic', 'dance'],
    mood: ['energy', 'happy'],
    language: 'English',
    explicit: false,
    isStreamable: true,
  },
  {
    id: 'jamendo_fallback_5',
    source: 'jamendo',
    title: 'Autumn Leaves & Coffee',
    artist: 'Lo-Fi Chillbeats',
    album: 'Study Session Vol. 3',
    artworkUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://prod-1.storage.jamendo.com/download/track/1812904/mp32/',
    duration: 162,
    tags: ['lofi', 'chill', 'study', 'focus'],
    genre: ['lo-fi', 'hiphop'],
    mood: ['calm', 'focus'],
    language: 'Instrumental',
    explicit: false,
    isStreamable: true,
  }
];

export async function fetchJamendoTracks(params: Record<string, string | number>): Promise<Track[]> {
  const clientId = getJamendoClientId();
  const searchParams = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    audioformat: 'mp32',
    include: 'musicinfo',
    limit: '20',
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const cacheKey = searchParams.toString();
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  const url = `${JAMENDO_BASE_URL}/tracks/?${searchParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Jamendo API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }

    const tracks = data.results.map((raw: JamendoRawTrack) => normalizeJamendoTrack(raw));
    setCache(cacheKey, tracks);
    return tracks;
  } catch (err) {
    console.warn('Jamendo API fetch failed, falling back gracefully:', err);
    // Return matching fallback tracks if available, or slice of fallback
    return fallbackTracks;
  }
}

export async function searchTracks(query: string, limit = 20): Promise<Track[]> {
  if (!query.trim()) return [];
  return fetchJamendoTracks({
    namesearch: query,
    order: 'popularity_total_desc',
    limit,
  });
}

export async function getFeaturedTracks(limit = 20): Promise<Track[]> {
  return fetchJamendoTracks({
    featured: 1,
    order: 'popularity_week_desc',
    limit,
  });
}

export async function getTracksByMood(mood: string, limit = 15): Promise<Track[]> {
  return fetchJamendoTracks({
    fuzzytags: mood,
    order: 'popularity_total_desc',
    limit,
  });
}

export async function getTracksByGenre(genre: string, limit = 15): Promise<Track[]> {
  return fetchJamendoTracks({
    tags: genre,
    order: 'popularity_week_desc',
    limit,
  });
}

export async function getTracksByLanguage(language: string, limit = 15): Promise<Track[]> {
  return fetchJamendoTracks({
    lang: language.toLowerCase(),
    order: 'popularity_total_desc',
    limit,
  });
}
