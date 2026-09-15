import React, { useState } from 'react';
import {
  ChevronDown,
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
  Moon,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from './PlayerContext';
import ProgressBar from './ProgressBar';
import VolumeSlider from './VolumeSlider';
import ExplicitBadge from '../../components/common/ExplicitBadge';
import SleepTimerModal from './SleepTimerModal';
import LyricsPanel from '../lyrics/LyricsPanel';
import QueueDrawer from './QueueDrawer';

export const FullScreenPlayer: React.FC = () => {
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
    isFullScreen,
    setFullScreen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'none' | 'lyrics' | 'queue'>('none');
  const [isSleepModalOpen, setSleepModalOpen] = useState(false);

  if (!isFullScreen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col select-none overflow-hidden animate-slide-up">
      {/* Immersive blurred artwork background backdrop */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src={currentTrack.artworkUrl}
          alt=""
          className="w-full h-full object-cover blur-[90px] scale-125 opacity-30 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-[#07090e]/60" />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => setFullScreen(false)}
          className="p-2.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          title="Minimize player (F)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Playing from Wave</p>
          <p className="text-sm font-medium text-zinc-200 truncate max-w-xs">{currentTrack.album || 'Single'}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSleepModalOpen(true)}
            className={`p-2.5 rounded-full hover:bg-white/10 transition-colors ${
              sleepTimerLabel ? 'text-wave-400' : 'text-zinc-300 hover:text-white'
            }`}
            title="Sleep timer"
          >
            <Moon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Artwork & Controls OR Side-by-side with Lyrics/Queue */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 gap-8 lg:gap-16 max-w-6xl mx-auto w-full min-h-0 overflow-y-auto">
        {/* Left/Center: Vinyl / Album Artwork */}
        <div className="flex flex-col items-center justify-center w-full max-w-md lg:max-w-lg aspect-square">
          <div className="relative w-full h-full max-h-[380px] sm:max-h-[440px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 group transition-transform duration-500 hover:scale-[1.01]">
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right/Bottom: Metadata, Scrubber & Controls */}
        <div className="w-full max-w-md flex flex-col justify-center space-y-6">
          {/* Title & Artist & Like */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h1>
                {currentTrack.explicit && <ExplicitBadge className="text-xs px-1.5 py-0.5" />}
              </div>
              <p className="text-base sm:text-lg text-zinc-300 font-medium truncate mt-1">
                {currentTrack.artist}
              </p>
              {currentTrack.language && (
                <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                  {currentTrack.language}
                </span>
              )}
            </div>

            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-3 rounded-full hover:bg-white/10 transition-colors ${
                liked ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-7 h-7 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Scrubber / Progress Bar */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            bufferedPercent={bufferedPercent}
            onSeek={seek}
          />

          {/* Primary Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={toggleShuffle}
              className={`p-3 rounded-full hover:bg-white/10 transition-colors ${
                shuffle ? 'text-wave-400' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={prevTrack}
              className="p-3 rounded-full hover:bg-white/10 text-zinc-200 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black ml-1" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 rounded-full hover:bg-white/10 text-zinc-200 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-3 rounded-full hover:bg-white/10 transition-colors ${
                repeatMode !== 'off' ? 'text-wave-400' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Bottom Row: Volume + Lyrics & Queue buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <VolumeSlider
                volume={volume}
                muted={muted}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'lyrics' ? 'none' : 'lyrics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'lyrics'
                    ? 'bg-wave-500 text-white'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                Lyrics
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'queue' ? 'none' : 'queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === 'queue'
                    ? 'bg-wave-500 text-white'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panels */}
      <LyricsPanel isOpen={activeTab === 'lyrics'} onClose={() => setActiveTab('none')} />
      <QueueDrawer isOpen={activeTab === 'queue'} onClose={() => setActiveTab('none')} />
      <SleepTimerModal isOpen={isSleepModalOpen} onClose={() => setSleepModalOpen(false)} />
    </div>
  );
};

export default FullScreenPlayer;
