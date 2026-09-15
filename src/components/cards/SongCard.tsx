import React from 'react';
import { Play, Pause, Heart, MoreVertical, Plus } from 'lucide-react';
import { Track } from '../../types/music';
import { usePlayer } from '../../features/player/PlayerContext';
import ExplicitBadge from '../common/ExplicitBadge';
import { formatSeconds } from '../../utils/timeFormatter';

interface SongCardProps {
  track: Track;
  tracks?: Track[];
  onAddToPlaylist?: (track: Track) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ track, tracks, onAddToPlaylist }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLiked } = usePlayer();

  const isCurrent = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group relative flex flex-col p-3 rounded-2xl bg-surface-card/60 hover:bg-surface-hover/80 border border-surface-border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02]"
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 shadow-md">
        <img
          src={track.artworkUrl}
          alt={track.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Play Button Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-wave-500 hover:bg-wave-400 text-white flex items-center justify-center shadow-lg transition-transform transform active:scale-95"
            aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Action icons on top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track);
            }}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-rose-500 transition-colors"
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {onAddToPlaylist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(track);
              }}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white transition-colors"
              title="Add to playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-zinc-300">
          {formatSeconds(track.duration)}
        </span>
      </div>

      {/* Metadata */}
      <div className="mt-3 flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <h4
            className={`font-semibold text-sm truncate ${
              isCurrent ? 'text-wave-300' : 'text-zinc-100 group-hover:text-white'
            }`}
          >
            {track.title}
          </h4>
          {track.explicit && <ExplicitBadge />}
        </div>
        <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
      </div>
    </div>
  );
};

export default SongCard;
