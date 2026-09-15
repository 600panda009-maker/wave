import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, MoreHorizontal, ListPlus } from 'lucide-react';
import { Track } from '../../types/music';
import { usePlayer } from '../../features/player/PlayerContext';
import ExplicitBadge from '../common/ExplicitBadge';
import { formatSeconds } from '../../utils/timeFormatter';

interface SongRowProps {
  track: Track;
  index?: number;
  tracks?: Track[];
  onAddToPlaylist?: (track: Track) => void;
  showAlbum?: boolean;
}

export const SongRow: React.FC<SongRowProps> = ({
  track,
  index,
  tracks,
  onAddToPlaylist,
  showAlbum = true,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked,
    addToQueue,
    playNext,
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracks, index);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors cursor-pointer select-none ${
        isCurrent ? 'bg-wave-500/15 border border-wave-500/20' : 'hover:bg-white/[0.04]'
      }`}
    >
      {/* Left: Index + Artwork + Title/Artist */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Index / Play Indicator */}
        <div className="w-6 text-center text-xs font-mono text-zinc-500 group-hover:hidden">
          {isCurrent && isPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-3.5">
              <div className="w-0.5 bg-wave-400 animate-pulse h-full" />
              <div className="w-0.5 bg-wave-400 animate-pulse h-2" />
              <div className="w-0.5 bg-wave-400 animate-pulse h-3" />
            </div>
          ) : index !== undefined ? (
            <span>{index + 1}</span>
          ) : null}
        </div>

        {/* Hover Play Button */}
        <div className="hidden group-hover:flex w-6 items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick();
            }}
            className="text-white hover:text-wave-300"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
        </div>

        {/* Artwork */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 shadow">
          <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Title + Artist */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-semibold truncate ${
                isCurrent ? 'text-wave-300' : 'text-zinc-100 group-hover:text-white'
              }`}
            >
              {track.title}
            </span>
            {track.explicit && <ExplicitBadge />}
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      {/* Center: Album */}
      {showAlbum && (
        <div className="hidden md:block w-1/3 min-w-0 px-4">
          <p className="text-xs text-zinc-400 truncate">{track.album || 'Single'}</p>
        </div>
      )}

      {/* Right: Actions + Duration */}
      <div className="flex items-center gap-3 ml-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            liked
              ? 'text-rose-500'
              : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        <span className="text-xs font-mono text-zinc-500 tabular-nums">
          {formatSeconds(track.duration)}
        </span>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white rounded transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl bg-surface-card border border-surface-border shadow-xl p-1 text-xs text-zinc-200"
            >
              <button
                onClick={() => {
                  playNext(track);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Play className="w-3.5 h-3.5" />
                Play next
              </button>
              <button
                onClick={() => {
                  addToQueue(track);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <ListPlus className="w-3.5 h-3.5" />
                Add to queue
              </button>
              {onAddToPlaylist && (
                <button
                  onClick={() => {
                    onAddToPlaylist(track);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongRow;
