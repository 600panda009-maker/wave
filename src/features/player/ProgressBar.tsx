import React, { useRef, useState } from 'react';
import { formatSeconds } from '../../utils/timeFormatter';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  bufferedPercent?: number;
  onSeek: (time: number) => void;
  showTime?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  bufferedPercent = 0,
  onSeek,
  showTime = true,
  className = '',
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const movePos = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      onSeek(movePos * duration);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pos = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(pos * duration);
    setHoverX(x);
  };

  return (
    <div className={`flex items-center gap-3 w-full select-none ${className}`}>
      {showTime && (
        <span className="text-xs font-medium text-zinc-400 tabular-nums w-10 text-right">
          {formatSeconds(currentTime)}
        </span>
      )}

      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoverTime(null);
        }}
        onMouseMove={handleMouseMove}
        className="relative flex-1 h-6 flex items-center cursor-pointer group"
      >
        {/* Track background */}
        <div className="w-full h-1 group-hover:h-1.5 bg-zinc-800 rounded-full overflow-hidden transition-all duration-150 relative">
          {/* Buffered bar */}
          <div
            className="absolute top-0 left-0 h-full bg-zinc-700/60 transition-all duration-300 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Played progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-wave-500 group-hover:bg-wave-400 transition-all duration-75 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-black/50 pointer-events-none transition-opacity duration-150 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ left: `calc(${percent}% - 7px)` }}
        />

        {/* Hover Time Tooltip */}
        {isHovered && hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-zinc-900/90 text-white text-[11px] font-mono shadow-lg border border-white/10 pointer-events-none"
            style={{ left: hoverX }}
          >
            {formatSeconds(hoverTime)}
          </div>
        )}
      </div>

      {showTime && (
        <span className="text-xs font-medium text-zinc-500 tabular-nums w-10 text-left">
          {formatSeconds(duration)}
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
