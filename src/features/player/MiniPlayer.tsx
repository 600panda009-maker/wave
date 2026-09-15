import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
  Moon,
  Loader2,
} from 'lucide-react';
import { usePlayer } from './PlayerContext';
import ProgressBar from './ProgressBar';
import VolumeSlider from './VolumeSlider';
import ExplicitBadge from '../../components/common/ExplicitBadge';
import SleepTimerModal from './SleepTimerModal';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    bufferedPercent,
    volume,
    muted,
    repeatMode,
    shuffle,
    sleepTimerLabel,
    isLoading,
    isQueueOpen,
    isLyricsOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setQueueOpen,
    setLyricsOpen,
    setFullScreen,
    toggleLike,
    isLiked,
  } = usePlayer();

  const [isSleepModalOpen, setSleepModalOpen] = useState(false);

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.id);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/90 backdrop-blur-xl border-t border-surface-border select-none transition-all">
        {/* Mobile Mini Player (< md) */}
        <div className="md:hidden flex flex-col">
          {/* Progress thin line on top */}
          <div className="w-full h-1 bg-zinc-800 relative cursor-pointer" onClick={() => setFullScreen(true)}>
            <div
              className="h-full bg-wave-500 transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between px-3 py-2">
            {/* Clickable Area to open FullScreen Player */}
            <div
              onClick={() => setFullScreen(true)}
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 shadow-md">
                <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                  {currentTrack.explicit && <ExplicitBadge />}
                </div>
                <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={() => toggleLike(currentTrack)}
                className="p-2 text-zinc-400 hover:text-rose-400"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all ml-1 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2 text-zinc-400 hover:text-white"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Player (>= md) */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 gap-6 max-w-7xl mx-auto">
          {/* Left: Track Information */}
          <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
            <div
              onClick={() => setFullScreen(true)}
              className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0 cursor-pointer group"
            >
              <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => setFullScreen(true)}
                  className="font-semibold text-sm text-white hover:text-wave-300 truncate cursor-pointer transition-colors"
                >
                  {currentTrack.title}
                </span>
                {currentTrack.explicit && <ExplicitBadge />}
              </div>
              <p className="text-xs text-zinc-400 hover:text-zinc-200 truncate cursor-pointer transition-colors">
                {currentTrack.artist}
              </p>
            </div>

            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ml-1 ${
                liked ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Center: Controls + Progress */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                  shuffle ? 'text-wave-400' : 'text-zinc-400 hover:text-white'
                }`}
                title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Previous track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Next track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                  repeatMode !== 'off' ? 'text-wave-400' : 'text-zinc-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              bufferedPercent={bufferedPercent}
              onSeek={seek}
            />
          </div>

          {/* Right: Auxiliary Controls */}
          <div className="flex items-center justify-end gap-2 w-1/4 min-w-[200px]">
            <button
              onClick={() => setLyricsOpen(!isLyricsOpen)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isLyricsOpen ? 'text-wave-400 bg-wave-500/10' : 'text-zinc-400 hover:text-white'
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isQueueOpen ? 'text-wave-400 bg-wave-500/10' : 'text-zinc-400 hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSleepModalOpen(true)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors relative ${
                sleepTimerLabel ? 'text-wave-400' : 'text-zinc-400 hover:text-white'
              }`}
              title={sleepTimerLabel ? `Sleep in ${sleepTimerLabel}` : 'Sleep timer'}
            >
              <Moon className="w-4 h-4" />
              {sleepTimerLabel && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-wave-400" />
              )}
            </button>

            <VolumeSlider
              volume={volume}
              muted={muted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />

            <button
              onClick={() => setFullScreen(true)}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ml-1"
              title="Full screen (F)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SleepTimerModal isOpen={isSleepModalOpen} onClose={() => setSleepModalOpen(false)} />
    </>
  );
};

export default MiniPlayer;
