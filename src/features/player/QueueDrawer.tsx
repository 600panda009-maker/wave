import React from 'react';
import { X, Trash2, Radio, Play, ListPlus, Music2 } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { formatSeconds } from '../../utils/timeFormatter';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQueueToPlaylist?: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  onSaveQueueToPlaylist,
}) => {
  const {
    queue,
    currentIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue,
    autoplay,
    toggleAutoplay,
    isPlaying,
  } = usePlayer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-card/95 backdrop-blur-xl border-l border-surface-border shadow-2xl flex flex-col animate-slide-up sm:animate-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-wave-400" />
          <h3 className="font-bold text-lg text-white">Playing Queue</h3>
          <span className="text-xs text-zinc-400 font-mono ml-1">
            ({queue.length} tracks)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onSaveQueueToPlaylist && (
            <button
              onClick={onSaveQueueToPlaylist}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Save queue to playlist"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={clearQueue}
            className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Autoplay Bar */}
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio className={`w-4 h-4 ${autoplay ? 'text-wave-400' : 'text-zinc-500'}`} />
          <div>
            <p className="text-xs font-semibold text-zinc-200">Infinite Autoplay</p>
            <p className="text-[11px] text-zinc-500">Intelligent radio & mood matching</p>
          </div>
        </div>
        <button
          onClick={toggleAutoplay}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
            autoplay ? 'bg-wave-600' : 'bg-zinc-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              autoplay ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500">
            <Music2 className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Queue is empty</p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center gap-3 p-2 rounded-xl transition-colors ${
                  isCurrent
                    ? 'bg-wave-500/15 border border-wave-500/25'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Status / Index */}
                <div className="w-6 text-center text-xs font-mono text-zinc-500">
                  {isCurrent && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-3.5">
                      <div className="w-0.5 bg-wave-400 animate-pulse h-full" />
                      <div className="w-0.5 bg-wave-400 animate-pulse h-2" />
                      <div className="w-0.5 bg-wave-400 animate-pulse h-3" />
                    </div>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Artwork */}
                <div
                  onClick={() => playTrack(track, queue, idx)}
                  className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                {/* Track details */}
                <div
                  onClick={() => playTrack(track, queue, idx)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <p
                    className={`text-sm font-medium truncate ${
                      isCurrent ? 'text-wave-300' : 'text-zinc-200'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>

                {/* Duration */}
                <span className="text-xs text-zinc-500 tabular-nums">
                  {formatSeconds(track.duration)}
                </span>

                {/* Remove button */}
                <button
                  onClick={() => removeFromQueue(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-rose-400 rounded transition-opacity"
                  title="Remove from queue"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QueueDrawer;
