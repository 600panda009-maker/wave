import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Track } from '../../types/music';
import { ListeningHistoryItem } from '../../types/user';
import {
  getStoredLikes,
  saveStoredLikes,
  getStoredHistory,
  saveStoredHistory,
  getStoredTasteProfile,
  getStoredSettings,
  saveStoredSettings,
  getStoredLastPlayed,
  saveStoredLastPlayed,
} from '../../utils/storage';
import { recordTrackPlay, supabase } from '../../lib/supabase';
import { updateTasteProfile } from '../../services/recommendationService';
import { fetchNextAutoplayTrack } from '../../services/autoplayService';
import { sendTrackToBridge } from '../../services/discordService';
import { fallbackTracks } from '../../services/jamendoService';

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
  sleepTimer: number | null;
  sleepTimerLabel: string | null;
  autoplay: boolean;
  bufferedPercent: number;
  isLoading: boolean;
  error: string | null;
  isFullScreen: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  likedTracks: Track[];

  playTrack: (track: Track, newQueue?: Track[], index?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setSleepTimer: (minutes: number | null, label?: string) => void;
  toggleAutoplay: () => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setFullScreen: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  setLyricsOpen: (open: boolean) => void;
  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [muted, setMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [sleepTimer, setSleepTimerEnd] = useState<number | null>(null);
  const [sleepTimerLabel, setSleepTimerLabel] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState<boolean>(() => getStoredSettings().autoplay);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const [isQueueOpen, setQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setLyricsOpen] = useState<boolean>(false);

  const [likedTracks, setLikedTracks] = useState<Track[]>(() => getStoredLikes());
  const playedTrackIdsRef = useRef<Set<string>>(new Set());

  // Track play measurement for history & stats
  const playStartTimeRef = useRef<number>(0);
  const secondsPlayedRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Restore last played track if available
    const last = getStoredLastPlayed();
    if (last && last.track) {
      setCurrentTrack(last.track);
      setQueue(last.queue.length > 0 ? last.queue : [last.track]);
      setOriginalQueue(last.queue.length > 0 ? last.queue : [last.track]);
      setCurrentIndex(last.index || 0);
      audio.src = last.track.streamUrl || '';
    } else {
      // Default to first fallback track
      const first = fallbackTracks[0];
      setCurrentTrack(first);
      setQueue(fallbackTracks);
      setOriginalQueue(fallbackTracks);
      setCurrentIndex(0);
      audio.src = first.streamUrl || '';
    }

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Accumulate seconds played
      if (lastTimeRef.current > 0) {
        const delta = cur - lastTimeRef.current;
        if (delta > 0 && delta < 2) {
          secondsPlayedRef.current += delta;
        }
      }
      lastTimeRef.current = cur;

      // Calculate buffer
      if (audio.buffered.length > 0 && audio.duration > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setBufferedPercent((bufferedEnd / audio.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setError(null);
    };

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);

    const onError = (e: Event) => {
      setIsLoading(false);
      setIsPlaying(false);
      console.warn('Audio playback error:', e);
      setError('Playback error. Stream may be temporarily unreachable.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Sync volume and mute to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Sleep timer interval check
  useEffect(() => {
    if (!sleepTimer) return;

    const interval = setInterval(() => {
      if (Date.now() >= sleepTimer) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        setSleepTimerEnd(null);
        setSleepTimerLabel(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  // Record history on track transition
  const finalizeCurrentTrackMetrics = useCallback((skipped: boolean) => {
    if (!currentTrack) return;
    const dur = duration || currentTrack.duration || 180;
    const playedSecs = secondsPlayedRef.current;
    const ratio = dur > 0 ? Math.min(1, playedSecs / dur) : 0;

    // Save to local history
    const historyItem: ListeningHistoryItem = {
      id: `${Date.now()}_${currentTrack.id}`,
      track: currentTrack,
      playedAt: new Date().toISOString(),
      secondsPlayed: Math.round(playedSecs),
      completionRatio: Number(ratio.toFixed(2)),
      skipped,
    };

    const existingHistory = getStoredHistory();
    saveStoredHistory([historyItem, ...existingHistory]);

    // Update taste profile
    const currentTaste = getStoredTasteProfile();
    updateTasteProfile(currentTaste, currentTrack, skipped ? 'skip' : 'completed');

    // Sync to Supabase
    recordTrackPlay(null, currentTrack, playedSecs, ratio, skipped);

    // Reset counters
    secondsPlayedRef.current = 0;
    lastTimeRef.current = 0;
  }, [currentTrack, duration]);

  // Play a specific track
  const playTrack = useCallback((track: Track, newQueue?: Track[], index?: number) => {
    if (!audioRef.current) return;

    finalizeCurrentTrackMetrics(true);

    let nextQueue = newQueue || queue;
    let nextIndex = index ?? nextQueue.findIndex(t => t.id === track.id);

    if (nextIndex === -1) {
      nextQueue = [track, ...nextQueue];
      nextIndex = 0;
    }

    setCurrentTrack(track);
    setQueue(nextQueue);
    setOriginalQueue(nextQueue);
    setCurrentIndex(nextIndex);
    playedTrackIdsRef.current.add(track.id);

    saveStoredLastPlayed({ track, queue: nextQueue, index: nextIndex });

    audioRef.current.src = track.streamUrl || '';
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsLoading(true);
    setError(null);

    audioRef.current.play().catch(err => {
      console.warn('Audio play restricted or failed:', err);
      setIsPlaying(false);
      setIsLoading(false);
    });

    sendTrackToBridge(track, true);
  }, [queue, finalizeCurrentTrackMetrics]);

  // Advance to next track with infinite autoplay support
  const nextTrack = useCallback(async () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    finalizeCurrentTrackMetrics(false);

    if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextSong = queue[nextIdx];
      setCurrentIndex(nextIdx);
      setCurrentTrack(nextSong);
      playedTrackIdsRef.current.add(nextSong.id);

      if (audioRef.current) {
        audioRef.current.src = nextSong.streamUrl || '';
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      sendTrackToBridge(nextSong, true);
    } else if (repeatMode === 'all' && queue.length > 0) {
      // Loop queue
      const nextSong = queue[0];
      setCurrentIndex(0);
      setCurrentTrack(nextSong);
      if (audioRef.current) {
        audioRef.current.src = nextSong.streamUrl || '';
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      sendTrackToBridge(nextSong, true);
    } else if (autoplay && currentTrack) {
      // Infinite autoplay candidate generation (emotional and language preserved)
      setIsLoading(true);
      const autoTrack = await fetchNextAutoplayTrack(currentTrack, playedTrackIdsRef.current);
      if (autoTrack) {
        const updatedQueue = [...queue, autoTrack];
        const nextIdx = updatedQueue.length - 1;
        setQueue(updatedQueue);
        setCurrentIndex(nextIdx);
        setCurrentTrack(autoTrack);
        playedTrackIdsRef.current.add(autoTrack.id);

        if (audioRef.current) {
          audioRef.current.src = autoTrack.streamUrl || '';
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.warn);
        }
        sendTrackToBridge(autoTrack, true);
      }
      setIsLoading(false);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, queue, repeatMode, autoplay, currentTrack, finalizeCurrentTrackMetrics]);

  // Handle onended event on audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [nextTrack]);

  // Previous track
  const prevTrack = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevSong = queue[prevIdx];
      setCurrentIndex(prevIdx);
      setCurrentTrack(prevSong);
      audioRef.current.src = prevSong.streamUrl || '';
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
      sendTrackToBridge(prevSong, true);
    }
  }, [currentIndex, queue]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      sendTrackToBridge(currentTrack, false);
    } else {
      audioRef.current.play().catch(console.warn);
      sendTrackToBridge(currentTrack, true);
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    sendTrackToBridge(currentTrack, false);
  }, [currentTrack]);

  const resume = useCallback(() => {
    if (audioRef.current) audioRef.current.play().catch(console.warn);
    sendTrackToBridge(currentTrack, true);
  }, [currentTrack]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, duration || 0));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && muted) setMuted(false);
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => {
      const next = !prev;
      if (next) {
        // Shuffle queue keeping current track at index 0
        if (!currentTrack) return next;
        const remaining = queue.filter(t => t.id !== currentTrack.id);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        setQueue([currentTrack, ...remaining]);
        setCurrentIndex(0);
      } else {
        // Restore original order
        if (!currentTrack) return next;
        setQueue(originalQueue);
        const origIdx = originalQueue.findIndex(t => t.id === currentTrack.id);
        setCurrentIndex(origIdx !== -1 ? origIdx : 0);
      }
      return next;
    });
  }, [queue, originalQueue, currentTrack]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const setSleepTimer = useCallback((minutes: number | null, label?: string) => {
    if (minutes === null) {
      setSleepTimerEnd(null);
      setSleepTimerLabel(null);
    } else {
      setSleepTimerEnd(Date.now() + minutes * 60 * 1000);
      setSleepTimerLabel(label || `${minutes}m`);
    }
  }, []);

  const toggleAutoplay = useCallback(() => {
    setAutoplay(prev => {
      const next = !prev;
      const settings = getStoredSettings();
      saveStoredSettings({ ...settings, autoplay: next });
      return next;
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
    setOriginalQueue(prev => [...prev, track]);
  }, []);

  const playNext = useCallback((track: Track) => {
    setQueue(prev => {
      const copy = [...prev];
      copy.splice(currentIndex + 1, 0, track);
      return copy;
    });
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    if (!currentTrack) {
      setQueue([]);
      setCurrentIndex(0);
    } else {
      setQueue([currentTrack]);
      setCurrentIndex(0);
    }
  }, [currentTrack]);

  const toggleLike = useCallback((track: Track) => {
    setLikedTracks(prev => {
      const exists = prev.some(t => t.id === track.id);
      let updated: Track[];
      if (exists) {
        updated = prev.filter(t => t.id !== track.id);
      } else {
        updated = [track, ...prev];
        // Boost taste profile
        const taste = getStoredTasteProfile();
        updateTasteProfile(taste, track, 'like');
      }
      saveStoredLikes(updated);
      return updated;
    });
  }, []);

  const isLiked = useCallback((trackId: string) => {
    return likedTracks.some(t => t.id === trackId);
  }, [likedTracks]);

  // Media Session API support
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'Wave',
      artwork: [
        { src: currentTrack.artworkUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.setActionHandler('seekbackward', () => seek(currentTime - 10));
    navigator.mediaSession.setActionHandler('seekforward', () => seek(currentTime + 10));
  }, [currentTrack, currentTime, togglePlay, prevTrack, nextTrack, seek]);

  // Global Keyboard Shortcuts (Space, Left, Right, Up, Down, M, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(currentTime - 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 0.05);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          setFullScreen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, currentTime, setVolume, volume, toggleMute]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        muted,
        repeatMode,
        shuffle,
        sleepTimer,
        sleepTimerLabel,
        autoplay,
        bufferedPercent,
        isLoading,
        error,
        isFullScreen,
        isQueueOpen,
        isLyricsOpen,
        likedTracks,
        playTrack,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        setSleepTimer,
        toggleAutoplay,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        setFullScreen,
        setQueueOpen,
        setLyricsOpen,
        toggleLike,
        isLiked,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
