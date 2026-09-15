import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Track, Playlist } from '../types/music';
import { ListeningHistoryItem, UserTasteProfile, GlobalTrackStat } from '../types/user';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper: Ensure profile exists for Auth0 user
export async function ensureProfile(auth0Sub: string, displayName?: string, avatarUrl?: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth0_sub', auth0Sub)
      .maybeSingle();

    if (existing?.id) {
      return existing.id;
    }

    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        auth0_sub: auth0Sub,
        display_name: displayName || 'Wave Listener',
        avatar_url: avatarUrl || null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return created.id;
  } catch (err) {
    console.error('Error ensuring profile:', err);
    return null;
  }
}

// Record track play to history and increment global stats
export async function recordTrackPlay(
  userId: string | null,
  track: Track,
  secondsPlayed: number,
  completionRatio: number,
  skipped: boolean
) {
  if (!supabase) return;

  try {
    // 1. If logged in, record to personal history
    if (userId) {
      await supabase.from('listening_history').insert({
        user_id: userId,
        track_source: track.source,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || null,
        artwork_url: track.artworkUrl,
        seconds_played: Math.round(secondsPlayed),
        completion_ratio: Number(completionRatio.toFixed(2)),
        skipped,
      });
    }

    // 2. Increment global play stats if valid play threshold met (e.g. >= 30s or >= 50%)
    const isValidPlay = secondsPlayed >= 30 || completionRatio >= 0.5;
    if (isValidPlay) {
      const { data: existingStat } = await supabase
        .from('track_play_stats')
        .select('play_count, unique_listeners')
        .eq('track_source', track.source)
        .eq('track_id', track.id)
        .maybeSingle();

      if (existingStat) {
        await supabase
          .from('track_play_stats')
          .update({
            play_count: Number(existingStat.play_count) + 1,
            title: track.title,
            artist: track.artist,
            artwork_url: track.artworkUrl,
            last_played_at: new Date().toISOString(),
          })
          .eq('track_source', track.source)
          .eq('track_id', track.id);
      } else {
        await supabase.from('track_play_stats').insert({
          track_source: track.source,
          track_id: track.id,
          title: track.title,
          artist: track.artist,
          artwork_url: track.artworkUrl,
          play_count: 1,
          unique_listeners: 1,
          last_played_at: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Error recording play to Supabase:', err);
  }
}

// Fetch Global Top 50
export async function fetchGlobalTop50(): Promise<GlobalTrackStat[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('track_play_stats')
      .select('*')
      .order('play_count', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(row => ({
      trackSource: row.track_source,
      trackId: row.track_id,
      title: row.title,
      artist: row.artist,
      artworkUrl: row.artwork_url,
      playCount: Number(row.play_count),
      uniqueListeners: Number(row.unique_listeners),
      lastPlayedAt: row.last_played_at,
    }));
  } catch (err) {
    console.warn('Error fetching Global Top 50 from Supabase:', err);
    return [];
  }
}
