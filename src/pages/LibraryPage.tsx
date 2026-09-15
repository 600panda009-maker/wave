import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Plus, Heart, Music, ListMusic, Sparkles } from 'lucide-react';
import { getStoredPlaylists, getStoredLikes } from '../utils/storage';
import { Playlist, Track } from '../types/music';
import PlaylistCard from '../components/cards/PlaylistCard';
import PlaylistModal from '../features/playlists/PlaylistModal';

export const LibraryPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getStoredPlaylists());
  const [likedCount, setLikedCount] = useState(0);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLikedCount(getStoredLikes().length);
    setPlaylists(getStoredPlaylists());
  }, []);

  const handlePlaylistCreated = (newPl: Playlist) => {
    setPlaylists((prev) => [newPl, ...prev]);
  };

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Your Library
            <Library className="w-6 h-6 text-wave-400" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Playlists, collections, and liked songs</p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-wave-500 hover:bg-wave-400 text-white font-semibold text-sm shadow-lg shadow-wave-500/25 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Playlist
        </button>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Liked Songs Special Card */}
        <div
          onClick={() => navigate('/liked')}
          className="group flex flex-col p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-surface-card to-surface-card border border-rose-500/30 hover:border-rose-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.02]"
        >
          <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center shadow-lg">
            <Heart className="w-12 h-12 text-white fill-white drop-shadow-md" />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors">
              Liked Songs
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">{likedCount} tracks</p>
          </div>
        </div>

        {/* User Playlists */}
        {playlists.map((pl) => (
          <PlaylistCard
            key={pl.id}
            playlist={pl}
            onSelect={(selected) => navigate(`/playlist/${selected.id}`)}
          />
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-surface-card/40 rounded-3xl border border-surface-border p-8">
          <ListMusic className="w-12 h-12 text-zinc-600" />
          <h3 className="text-lg font-bold text-zinc-200">Create your first playlist</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            Organize your favorite music into custom playlists. They stay saved locally on your device.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Create Playlist
          </button>
        </div>
      )}

      <PlaylistModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  );
};

export default LibraryPage;
