export type TrackSource = 'jamendo' | 'spotify' | 'lastfm' | 'local';

export interface Track {
  id: string;
  source: TrackSource;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  artworkUrl: string;
  streamUrl?: string;
  duration: number; // in seconds
  tags?: string[];
  genre?: string[];
  mood?: string[];
  language?: string;
  explicit?: boolean;
  isStreamable: boolean;
  externalUrl?: string;
  licenseUrl?: string;
  providerMetadata?: Record<string, unknown>;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  artworkUrl?: string;
  trackCount: number;
  tracks?: Track[];
  createdAt: string;
  updatedAt?: string;
  isSpotify?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl?: string;
  bio?: string;
  tags?: string[];
  topTracks?: Track[];
  similarArtists?: string[];
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artworkUrl?: string;
  releaseDate?: string;
  tracks?: Track[];
}

export interface PlaybackState {
  currentTrack: Track | null;
  queue: Track[];
  originalQueue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
  sleepTimer: number | null; // unix timestamp in ms or null
  sleepTimerLabel: string | null;
  autoplay: boolean;
  bufferedPercent: number;
  isLoading: boolean;
  error: string | null;
}
