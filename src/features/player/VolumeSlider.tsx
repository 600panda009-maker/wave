import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeSliderProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
  className = '',
}) => {
  const effectiveVolume = muted ? 0 : volume;

  const getIcon = () => {
    if (effectiveVolume === 0) return <VolumeX className="w-4 h-4 text-zinc-400" />;
    if (effectiveVolume < 0.5) return <Volume1 className="w-4 h-4 text-zinc-300" />;
    return <Volume2 className="w-4 h-4 text-zinc-300" />;
  };

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <button
        onClick={onToggleMute}
        className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors focus:outline-none"
        title={muted ? 'Unmute (M)' : 'Mute (M)'}
        aria-label="Toggle mute"
      >
        {getIcon()}
      </button>

      <div className="relative w-20 sm:w-24 h-5 flex items-center cursor-pointer">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-wave-500 hover:accent-wave-400 focus:outline-none transition-all"
          aria-label="Volume slider"
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
