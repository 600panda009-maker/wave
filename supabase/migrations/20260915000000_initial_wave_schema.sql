-- Wave Music Streaming Initial Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_sub TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Listening history table
CREATE TABLE IF NOT EXISTS public.listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_source TEXT NOT NULL,
  track_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  artwork_url TEXT,
  played_at TIMESTAMPTZ DEFAULT now(),
  seconds_played INTEGER DEFAULT 0,
  completion_ratio NUMERIC DEFAULT 0,
  skipped BOOLEAN DEFAULT false
);

-- Liked tracks table
CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_source TEXT NOT NULL,
  track_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  artwork_url TEXT,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, track_source, track_id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  artwork_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Playlist tracks table
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_source TEXT NOT NULL,
  track_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  artwork_url TEXT,
  duration INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0
);

-- Taste profiles table
CREATE TABLE IF NOT EXISTS public.taste_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  genres JSONB DEFAULT '{}'::jsonb,
  moods JSONB DEFAULT '{}'::jsonb,
  languages JSONB DEFAULT '{}'::jsonb,
  artists JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spotify connections table
CREATE TABLE IF NOT EXISTS public.spotify_connections (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  spotify_user_id TEXT,
  display_name TEXT,
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- Discord connections table
CREATE TABLE IF NOT EXISTS public.discord_connections (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  discord_user_id TEXT,
  username TEXT,
  avatar_url TEXT,
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- Track play stats table (Global aggregation for Top 50)
CREATE TABLE IF NOT EXISTS public.track_play_stats (
  track_source TEXT NOT NULL,
  track_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artwork_url TEXT,
  play_count BIGINT DEFAULT 1,
  unique_listeners BIGINT DEFAULT 1,
  last_played_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (track_source, track_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_play_stats ENABLE ROW LEVEL SECURITY;

-- Allow anon read on global stats
CREATE POLICY "Allow public read on track_play_stats" ON public.track_play_stats FOR SELECT USING (true);
CREATE POLICY "Allow public upsert on track_play_stats" ON public.track_play_stats FOR ALL USING (true);

-- SPA Policies
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to listening_history" ON public.listening_history FOR ALL USING (true);
CREATE POLICY "Allow all access to liked_tracks" ON public.liked_tracks FOR ALL USING (true);
CREATE POLICY "Allow all access to playlists" ON public.playlists FOR ALL USING (true);
CREATE POLICY "Allow all access to playlist_tracks" ON public.playlist_tracks FOR ALL USING (true);
CREATE POLICY "Allow all access to taste_profiles" ON public.taste_profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to spotify_connections" ON public.spotify_connections FOR ALL USING (true);
CREATE POLICY "Allow all access to discord_connections" ON public.discord_connections FOR ALL USING (true);
