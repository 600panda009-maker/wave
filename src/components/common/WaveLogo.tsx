import React from 'react';

interface WaveLogoProps {
  size?: number;
  className?: string;
  isSpinning?: boolean;
  showText?: boolean;
}

export const WaveLogo: React.FC<WaveLogoProps> = ({
  size = 36,
  className = '',
  isSpinning = false,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-full overflow-hidden shadow-lg shadow-black/40 ring-1 ring-white/15 ${
          isSpinning ? 'animate-[spin_12s_linear_infinite]' : ''
        }`}
        style={{ width: size, height: size }}
      >
        <img
          src="/wave-logo.jpg"
          alt="Wave"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to SVG if jpg fails to load
            (e.target as HTMLImageElement).src = '/wave-logo.svg';
          }}
        />
      </div>
      {showText && (
        <span className="font-extrabold tracking-tight text-white flex items-center gap-1.5 text-xl">
          Wave
          <span className="w-1.5 h-1.5 rounded-full bg-wave-400 inline-block animate-pulse-subtle" />
        </span>
      )}
    </div>
  );
};

export default WaveLogo;
