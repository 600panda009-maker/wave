const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export const getLastFmApiKey = () => {
  return import.meta.env.VITE_LASTFM_API_KEY || '';
};

export const isLastFmConfigured = Boolean(
  getLastFmApiKey() && !getLastFmApiKey().includes('YOUR_')
);

// In-memory cache for Last.fm responses
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function callLastFm(method: string, params: Record<string, string>): Promise<any> {
  const apiKey = getLastFmApiKey();
  if (!apiKey) return null;

  const searchParams = new URLSearchParams({
    method,
    api_key: apiKey,
    format: 'json',
    ...params,
  });

  const cacheKey = `${method}:${searchParams.toString()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${LASTFM_BASE_URL}?${searchParams.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) {
      console.warn(`Last.fm API error ${data.error}: ${data.message}`);
      return null;
    }

    cache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  } catch (err) {
    console.warn('Last.fm request failed:', err);
    return null;
  }
}

export async function getSimilarTracks(artist: string, track: string): Promise<string[]> {
  const data = await callLastFm('track.getSimilar', {
    artist: encodeURIComponent(artist),
    track: encodeURIComponent(track),
    limit: '10',
  });

  if (!data?.similartracks?.track) return [];
  const tracks = Array.isArray(data.similartracks.track)
    ? data.similartracks.track
    : [data.similartracks.track];
  return tracks.map((t: any) => `${t.name} ${t.artist?.name || ''}`.trim());
}

export async function getTrackTags(artist: string, track: string): Promise<string[]> {
  const data = await callLastFm('track.getTopTags', {
    artist: encodeURIComponent(artist),
    track: encodeURIComponent(track),
  });

  if (!data?.toptags?.tag) return [];
  const tags = Array.isArray(data.toptags.tag)
    ? data.toptags.tag
    : [data.toptags.tag];
  return tags.map((t: any) => t.name?.toLowerCase()).filter(Boolean);
}

export async function getSimilarArtists(artist: string): Promise<string[]> {
  const data = await callLastFm('artist.getSimilar', {
    artist: encodeURIComponent(artist),
    limit: '10',
  });

  if (!data?.similarartists?.artist) return [];
  const artists = Array.isArray(data.similarartists.artist)
    ? data.similarartists.artist
    : [data.similarartists.artist];
  return artists.map((a: any) => a.name).filter(Boolean);
}

export async function getTopTags(): Promise<string[]> {
  const data = await callLastFm('chart.getTopTags', { limit: '20' });
  if (!data?.tags?.tag) return ['electronic', 'chillout', 'lo-fi', 'ambient', 'acoustic', 'rock', 'pop', 'indie'];
  return data.tags.tag.map((t: any) => t.name);
}
