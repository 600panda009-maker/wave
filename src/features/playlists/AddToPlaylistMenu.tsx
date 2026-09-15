import React from 'react';
import { X, Check, ListMusic, Plus } from 'lucide-react';
import { Track, Playlist } from '../../types/music';
import { getStoredPlaylists, saveStoredPlaylists } from '../../utils/storage';

interface AddToPlaylistMenuProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal?: () => void;
}

export const AddToPlaylistMenu: React.FC<AddToPlaylistMenuProps> = ({
  track,
  isOpen,
  onClose,
  onOpenCreateModal,
}) => {
  if (!isOpen || !track) return null;

  const playlists = getStoredPlaylists();

  const handleToggleTrack = (playlist: Playlist) => {
    const existingTracks = playlist.tracks || [];
    const exists = existingTracks.some((t) => t.id === track.id);

    let updatedTracks: Track[];
    if (exists) {
      updatedTracks = existingTracks.filter((t) => t.id !== track.id);
    } else {
      updatedTracks = [...existingTracks, track];
    }

    const updatedPlaylists = playlists.map((p) =>
      p.id === playlist.id
        ? {
            ...p,
            tracks: updatedTracks,
            trackCount: updatedTracks.length,
            artworkUrl: p.artworkUrl || track.artworkUrl,
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    saveStoredPlaylists(updatedPlaylists);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-semibold text-base text-white">Add to Playlist</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          {playlists.length === 0 ? (
            <p className="text-center py-6 text-xs text-zinc-500">No playlists found</p>
          ) : (
            playlists.map((pl) => {
              const inPlaylist = pl.tracks?.some((t) => t.id === track.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleToggleTrack(pl)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ListMusic className="w-4 h-4 text-zinc-400" />
                    <span className="truncate">{pl.name}</span>
                  </div>
                  {inPlaylist && <Check className="w-4 h-4 text-wave-400" />}
                </button>
              );
            })
          )}
        </div>

        {onOpenCreateModal && (
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistMenu;
