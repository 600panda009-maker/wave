import React from 'react';
import { User } from 'lucide-react';
import { Artist } from '../../types/music';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-surface-hover/80 transition-all duration-200 cursor-pointer"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-800 shadow-md ring-1 ring-white/10 group-hover:ring-wave-500/50 transition-all">
        {artist.artworkUrl ? (
          <img
            src={artist.artworkUrl}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
            <User className="w-10 h-10" />
          </div>
        )}
      </div>
      <h4 className="mt-3 font-semibold text-sm text-zinc-100 group-hover:text-white truncate max-w-full">
        {artist.name}
      </h4>
      <p className="text-xs text-zinc-500 mt-0.5">Artist</p>
    </div>
  );
};

export default ArtistCard;
