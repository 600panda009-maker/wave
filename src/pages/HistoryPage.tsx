import React, { useState } from 'react';
import { History, Trash2, Search, Play, Clock, CheckCircle2, SkipForward } from 'lucide-react';
import { getStoredHistory, saveStoredHistory } from '../utils/storage';
import { ListeningHistoryItem } from '../types/user';
import { usePlayer } from '../features/player/PlayerContext';
import { formatTimeAgo, formatSeconds } from '../utils/timeFormatter';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ListeningHistoryItem[]>(() => getStoredHistory());
  const [filter, setFilter] = useState('');
  const { playTrack } = usePlayer();

  const handleClearHistory = () => {
    if (confirm('Clear your entire listening history?')) {
      saveStoredHistory([]);
      setHistory([]);
    }
  };

  const handleRemoveItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveStoredHistory(updated);
    setHistory(updated);
  };

  const filtered = history.filter(
    (h) =>
      h.track.title.toLowerCase().includes(filter.toLowerCase()) ||
      h.track.artist.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-28 pt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Listening History
            <History className="w-6 h-6 text-wave-400" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tracks you've listened to. Used to train your personalized Wave recommendations.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-surface-card border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-wave-500"
              />
            </div>

            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-surface-card/40 rounded-3xl border border-surface-border p-8">
          <Clock className="w-12 h-12 text-zinc-600" />
          <h3 className="text-lg font-bold text-zinc-200">No listening history yet</h3>
          <p className="text-sm text-zinc-400 max-w-sm">
            Songs you play will appear here along with your completion rates and time of play.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between p-3 rounded-2xl bg-surface-card/60 hover:bg-surface-hover border border-surface-border transition-colors"
            >
              <div
                onClick={() => playTrack(item.track)}
                className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 relative">
                  <img src={item.track.artworkUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                    {item.track.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{item.track.artist}</p>
                </div>
              </div>

              {/* Played Info & Stats */}
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <div className="hidden sm:flex items-center gap-1.5 font-mono">
                  {item.skipped ? (
                    <span className="flex items-center gap-1 text-zinc-500 text-[11px]">
                      <SkipForward className="w-3 h-3" />
                      Skipped ({Math.round(item.completionRatio * 100)}%)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>

                <span className="text-zinc-400">{formatTimeAgo(item.playedAt)}</span>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-rose-400 rounded transition-opacity"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
