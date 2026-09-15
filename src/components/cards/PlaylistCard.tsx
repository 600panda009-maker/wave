import React from 'react';
import { Play, ListMusic } from 'lucide-react';
import { Playlist, Track } from '../../types/music';
import { usePlayer } from '../../features/player/PlayerContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onSelect?: (playlist: Playlist) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onSelect }) => {
  const { playTrack } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(playlist)}
      className="group flex flex-col p-3.5 rounded-2xl bg-surface-card/60 hover:bg-surface-hover/80 border border-surface-border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02]"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shadow-md">
        {playlist.artworkUrl ? (
          <img
            src={playlist.artworkUrl}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ListMusic className="w-12 h-12 text-zinc-600 group-hover:text-wave-400 transition-colors" />
        )}

        {/* Play Button Overlay */}
        <button
          onClick={handlePlay}
          className="absolute right-3 bottom-3 w-12 h-12 rounded-full bg-wave-500 hover:bg-wave-400 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
          title="Play playlist"
        >
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </button>
      </div>

      <div className="mt-3 min-w-0">
        <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-white truncate">
          {playlist.name}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-0.5">
          {playlist.trackCount} tracks {playlist.isSpotify ? '• Spotify' : '• Wave'}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
