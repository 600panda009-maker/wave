import React, { useState } from 'react';
import { Heart, Play, Shuffle, Search, Music2 } from 'lucide-react';
import { usePlayer } from '../features/player/PlayerContext';
import SongRow from '../components/cards/SongRow';
import { Track } from '../types/music';

interface LikedSongsPageProps {
  onAddToPlaylist?: (track: Track) => void;
}

export const LikedSongsPage: React.FC<LikedSongsPageProps> = ({ onAddToPlaylist }) => {
  const { likedTracks, playTrack, toggleShuffle } = usePlayer();
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = likedTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const handleShuffleAll = () => {
    if (likedTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * likedTracks.length);
      playTrack(likedTracks[randomIndex], likedTracks);
      toggleShuffle();
    }
  };

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-900/40 via-surface-card to-surface-card border border-rose-500/20 shadow-xl">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart className="w-16 h-16 text-white fill-white drop-shadow-md" />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'} saved to your library
          </p>
        </div>
      </div>

      {/* Action Row & Filter */}
      {likedTracks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-wave-500 hover:bg-wave-400 text-white font-semibold text-sm shadow-lg shadow-wave-500/25 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              Play All
            </button>

            <button
              onClick={handleShuffleAll}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-surface-card hover:bg-surface-hover border border-surface-border text-zinc-200 text-sm font-semibold transition-all"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter liked songs..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-surface-card border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-wave-500"
            />
          </div>
        </div>
      )}

      {/* Songs List */}
      {likedTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-surface-card/40 rounded-3xl border border-surface-border p-8">
          <Heart className="w-12 h-12 text-zinc-600" />
          <h3 className="text-lg font-bold text-zinc-200">No liked songs yet</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            Songs you like by tapping the heart icon will be collected here and will help tailor your personalized Wave recommendations.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-zinc-500">No songs match your filter</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((track, idx) => (
            <SongRow
              key={`liked-${track.id}`}
              track={track}
              index={idx}
              tracks={filtered}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;
