import React, { useEffect, useState } from 'react';
import GradientWaves from './GradientWaves';
import { extractPaletteFromImage, DEFAULT_PALETTE, WavePalette } from '../../services/colorExtractor';

interface DynamicBackgroundProps {
  artworkUrl?: string;
  enabled?: boolean;
  reducedMotion?: boolean;
  intensity?: number;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  artworkUrl,
  enabled = true,
  reducedMotion = false,
  intensity = 0.85,
}) => {
  const [palette, setPalette] = useState<WavePalette>(DEFAULT_PALETTE);

  useEffect(() => {
    let isCancelled = false;
    if (artworkUrl) {
      extractPaletteFromImage(artworkUrl).then(newPalette => {
        if (!isCancelled) {
          setPalette(newPalette);
        }
      });
    } else {
      setPalette(DEFAULT_PALETTE);
    }
    return () => {
      isCancelled = true;
    };
  }, [artworkUrl]);

  if (!enabled) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-[#0e111a] via-[#090a0e] to-[#07080a]" />
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-1000">
      {/* WebGL Raymarched GradientWaves */}
      <div className="absolute inset-0 opacity-70 transition-opacity duration-1000">
        <GradientWaves
          horizonColor={palette.horizonColor}
          waveColor={palette.waveColor}
          crestColor={palette.crestColor}
          speed={reducedMotion ? 0 : 0.3}
          amplitude={1.8}
          waveScale={0.5}
          waveRatio={0.8}
          tilt={1.2}
          zoom={1.05}
          detail="medium"
          brightness={intensity}
          opacity={0.75}
          mouseInteraction={!reducedMotion}
          parallaxStrength={0.3}
          grain={true}
          grainIntensity={0.03}
        />
      </div>

      {/* Atmospheric Radial Glow matching extracted accent */}
      <div
        className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[140px] opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: palette.accentGlow }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full blur-[160px] opacity-20 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: palette.waveColor }}
      />

      {/* Dark vignette overlay for UI readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/80 to-surface-base/40 backdrop-blur-[1px]" />
    </div>
  );
};

export default DynamicBackground;
