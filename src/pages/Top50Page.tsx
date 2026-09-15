import React, { useEffect, useState } from 'react';
import { Trophy, Globe, User, Flame, Play } from 'lucide-react';
import { Track } from '../types/music';
import { GlobalTrackStat } from '../types/user';
import { fetchGlobalTop50 } from '../lib/supabase';
import { fallbackTracks, getFeaturedTracks } from '../services/jamendoService';
import { getStoredHistory } from '../utils/storage';
import { usePlayer } from '../features/player/PlayerContext';
import SongRow from '../components/cards/SongRow';

interface Top50PageProps {
  onAddToPlaylist?: (track: Track) => void;
}

export const Top50Page: React.FC<Top50PageProps> = ({ onAddToPlaylist }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');
  const [globalTracks, setGlobalTracks] = useState<Track[]>([]);
  const [personalTracks, setPersonalTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadTop50 = async () => {
      setLoading(true);
      try {
        // 1. Fetch Global from Supabase or fallback to Jamendo featured
        const stats: GlobalTrackStat[] = await fetchGlobalTop50();
        if (stats.length > 0) {
          const mapped: Track[] = stats.map((s) => ({
            id: s.trackId,
            source: s.trackSource as any,
            title: s.title,
            artist: s.artist,
            artworkUrl: s.artworkUrl,
            duration: 180,
            isStreamable: true,
          }));
          setGlobalTracks(mapped);
        } else {
          const featured = await getFeaturedTracks(50);
          setGlobalTracks(featured.length > 0 ? featured : fallbackTracks);
        }

        // 2. Calculate My Top 50 from local history
        const history = getStoredHistory();
        const counts = new Map<string, { track: Track; count: number }>();

        const now = Date.now();
        const maxAgeMs =
          timeRange === '7d'
            ? 7 * 24 * 60 * 60 * 1000
            : timeRange === '30d'
            ? 30 * 24 * 60 * 60 * 1000
            : Infinity;

        for (const item of history) {
          const itemTime = new Date(item.playedAt).getTime();
          if (now - itemTime > maxAgeMs) continue;

          // Only count valid plays (30s or 50% completed)
          if (item.secondsPlayed >= 30 || item.completionRatio >= 0.5) {
            const existing = counts.get(item.track.id);
            if (existing) {
              existing.count += 1;
            } else {
              counts.set(item.track.id, { track: item.track, count: 1 });
            }
          }
        }

        const sortedPersonal = Array.from(counts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 50)
          .map((c) => c.track);

        setPersonalTracks(sortedPersonal);
      } catch (err) {
        console.warn('Error loading Top 50:', err);
        setGlobalTracks(fallbackTracks);
      } finally {
        setLoading(false);
      }
    };

    loadTop50();
  }, [timeRange]);

  const activeList = activeTab === 'global' ? globalTracks : personalTracks;

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-900/40 via-surface-card to-surface-card border border-amber-500/20 shadow-xl">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Trophy className="w-16 h-16 text-white drop-shadow-md" />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Chart
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Top 50
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            The most played tracks on Wave, ranked by completed and repeated listening.
          </p>
        </div>
      </div>

      {/* Tabs and Time Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-surface-card p-1 rounded-2xl border border-surface-border">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'global'
                ? 'bg-wave-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Wave Global Top 50
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'personal'
                ? 'bg-wave-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            My Top 50
          </button>
        </div>

        {/* Time range switch */}
        <div className="flex items-center gap-1 text-xs">
          {(['all', '30d', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {range === 'all' ? 'All Time' : range === '30d' ? 'Last 30 Days' : 'Last 7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Play Button + Track List */}
      {activeList.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => playTrack(activeList[0], activeList)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-wave-500 hover:bg-wave-400 text-white font-semibold text-sm shadow-lg shadow-wave-500/25 transition-all transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            Play Chart
          </button>
        </div>
      )}

      {activeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-surface-card/40 rounded-3xl border border-surface-border p-8">
          <Flame className="w-12 h-12 text-zinc-600" />
          <h3 className="text-lg font-bold text-zinc-200">No chart data yet</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            {activeTab === 'personal'
              ? 'Play songs for more than 30 seconds to start building your personal Top 50 chart.'
              : 'Community tracks will populate as users stream music.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {activeList.map((track, idx) => (
            <SongRow
              key={`top50-${track.id}-${idx}`}
              track={track}
              index={idx}
              tracks={activeList}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Top50Page;
