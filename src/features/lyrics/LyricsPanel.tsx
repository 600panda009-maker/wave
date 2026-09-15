import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowDown, Mic2, Music } from 'lucide-react';
import { usePlayer } from '../player/PlayerContext';
import { fetchLyrics } from '../../services/lyrics';
import { LyricsResult } from '../../types/lyrics';

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const LyricsPanel: React.FC<LyricsPanelProps> = ({ isOpen, onClose, className = '' }) => {
  const { currentTrack, currentTime, seek } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [userScrolled, setUserScrolled] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);

  // Fetch lyrics on track change
  useEffect(() => {
    if (!isOpen || !currentTrack) return;

    let isCancelled = false;
    setLoading(true);
    setLyrics(null);
    setActiveLineIndex(-1);
    setUserScrolled(false);

    fetchLyrics(currentTrack).then((res) => {
      if (!isCancelled) {
        setLyrics(res);
        setLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack, isOpen]);

  // Update active line based on currentTime
  useEffect(() => {
    if (!lyrics || !lyrics.synced || lyrics.lines.length === 0) return;

    const currentMs = currentTime * 1000;
    let index = lyrics.lines.findIndex((line, i) => {
      const nextLine = lyrics.lines[i + 1];
      if (nextLine) {
        return currentMs >= line.startMs && currentMs < nextLine.startMs;
      }
      return currentMs >= line.startMs;
    });

    if (index === -1 && currentMs < lyrics.lines[0].startMs) {
      index = -1;
    }

    setActiveLineIndex(index);

    // Auto-scroll into center if user hasn't scrolled manually
    if (!userScrolled && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime, lyrics, userScrolled]);

  const handleScroll = () => {
    setUserScrolled(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    // After 6 seconds of no user scroll, resume auto-scroll
    scrollTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 6000);
  };

  const resumeAutoScroll = () => {
    setUserScrolled(false);
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleLineClick = (startMs: number) => {
    seek(startMs / 1000);
    setUserScrolled(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-surface-card/95 backdrop-blur-2xl border-l border-surface-border shadow-2xl flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-wave-400" />
          <h3 className="font-bold text-lg text-white">Lyrics</h3>
          {lyrics && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
              {lyrics.synced ? 'Synced' : 'Plain'}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics Body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-12 space-y-6 relative select-none scroll-smooth"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-wave-500 border-t-transparent animate-spin" />
            <p className="text-sm text-zinc-400">Loading synchronized lyrics...</p>
          </div>
        ) : !lyrics || lyrics.lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-zinc-400">
            <Music className="w-10 h-10 opacity-30 text-wave-400" />
            <p className="text-base font-medium text-zinc-300">No lyrics available</p>
            <p className="text-xs max-w-xs text-zinc-500">
              We couldn't locate synchronized lyrics for "{currentTrack?.title}".
            </p>
          </div>
        ) : (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeLineIndex;
            const isPast = idx < activeLineIndex;
            return (
              <div
                key={`${line.startMs}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.startMs)}
                className={`transition-all duration-300 cursor-pointer rounded-xl p-2 -mx-2 ${
                  isActive
                    ? 'text-white text-2xl md:text-3xl font-bold scale-[1.02] origin-left drop-shadow-md text-wave-200'
                    : isPast
                    ? 'text-zinc-500 text-lg md:text-xl font-medium hover:text-zinc-300'
                    : 'text-zinc-400 text-lg md:text-xl font-medium hover:text-zinc-200'
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>

      {/* Resume Auto Scroll Button */}
      {userScrolled && lyrics?.synced && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={resumeAutoScroll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-wave-600/90 text-white text-xs font-semibold shadow-lg backdrop-blur-sm hover:bg-wave-500 transition-all animate-bounce"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Resume auto-scroll
          </button>
        </div>
      )}

      {/* Footer Attribution */}
      {lyrics && (
        <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Source: {lyrics.source}</span>
          <span className="text-zinc-500">Click line to seek</span>
        </div>
      )}
    </div>
  );
};

export default LyricsPanel;
