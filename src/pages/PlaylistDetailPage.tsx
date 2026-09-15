import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Trash2, ListMusic, ArrowLeft } from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { getStoredPlaylists, saveStoredPlaylists } from '../utils/storage';
import { usePlayer } from '../features/player/PlayerContext';
import SongRow from '../components/cards/SongRow';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, toggleShuffle } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!id) return;
    const playlists = getStoredPlaylists();
    const found = playlists.find((p) => p.id === id);
    if (found) {
      setPlaylist(found);
    } else {
      navigate('/library');
    }
  }, [id, navigate]);

  if (!playlist) return null;

  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const rand = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[rand], tracks);
      toggleShuffle();
    }
  };

  const handleDeletePlaylist = () => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      const playlists = getStoredPlaylists();
      const updated = playlists.filter((p) => p.id !== playlist.id);
      saveStoredPlaylists(updated);
      navigate('/library');
    }
  };

  return (
    <div className="space-y-8 pb-28 pt-2">
      <button
        onClick={() => navigate('/library')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </button>

      {/* Playlist Hero */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-surface-card/70 border border-surface-border shadow-xl">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden">
          {playlist.artworkUrl ? (
            <img src={playlist.artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ListMusic className="w-16 h-16 text-zinc-600" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-wave-400">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-zinc-400">{playlist.description}</p>
          )}
          <p className="text-xs text-zinc-500 font-mono">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>

        <button
          onClick={handleDeletePlaylist}
          className="p-2.5 rounded-full hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors self-start sm:self-auto"
          title="Delete playlist"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Action Row */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-wave-500 hover:bg-wave-400 text-white font-semibold text-sm shadow-lg shadow-wave-500/25 transition-all transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            Play All
          </button>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-surface-card hover:bg-surface-hover border border-surface-border text-zinc-200 text-sm font-semibold transition-all"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
        </div>
      )}

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-surface-card/40 rounded-3xl border border-surface-border p-8">
          <ListMusic className="w-12 h-12 text-zinc-600" />
          <h3 className="text-lg font-bold text-zinc-200">This playlist is empty</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            Search for songs on the Explore or Home page and add them using the "+" button.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track, idx) => (
            <SongRow
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              tracks={tracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailPage;
