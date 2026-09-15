import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, getLuminance, RGB } from '../utils/colorMath';

export interface WavePalette {
  horizonColor: string;
  waveColor: string;
  crestColor: string;
  accentGlow: string;
}

export const DEFAULT_PALETTE: WavePalette = {
  horizonColor: '#0b0f19',
  waveColor: '#1d3e87',
  crestColor: '#38bdf8',
  accentGlow: '#0284c7',
};

// Cache extracted palettes by image URL
const paletteCache = new Map<string, WavePalette>();

export async function extractPaletteFromImage(imageUrl: string): Promise<WavePalette> {
  if (!imageUrl) return DEFAULT_PALETTE;
  if (paletteCache.has(imageUrl)) return paletteCache.get(imageUrl)!;

  return new Promise<WavePalette>((resolve) => {
    // If not in browser environment
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      resolve(DEFAULT_PALETTE);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Timeout safety fallback
    const timer = setTimeout(() => {
      resolve(DEFAULT_PALETTE);
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(DEFAULT_PALETTE);
          return;
        }

        const size = 64; // Downsampled for fast computation
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts = new Map<string, { rgb: RGB; count: number }>();

        // Sample every 4th pixel for speed
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue; // Ignore transparent pixels

          // Quantize to group similar colors
          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;
          const key = `${qr},${qg},${qb}`;

          const existing = colorCounts.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorCounts.set(key, { rgb: { r: qr, g: qg, b: qb }, count: 1 });
          }
        }

        const sorted = Array.from(colorCounts.values()).sort((a, b) => b.count - a.count);
        if (sorted.length === 0) {
          resolve(DEFAULT_PALETTE);
          return;
        }

        // Categorize samples by luminance and saturation
        const candidates = sorted.map(s => {
          const lum = getLuminance(s.rgb);
          const hsl = rgbToHsl(s.rgb);
          return { rgb: s.rgb, lum, hsl, count: s.count };
        });

        // Horizon: Deep dark color (Luminance 0.02 - 0.15)
        let horizonCandidate = candidates.find(c => c.lum >= 0.01 && c.lum <= 0.15);
        if (!horizonCandidate) {
          // Darken the most frequent color
          const primaryHsl = candidates[0].hsl;
          horizonCandidate = {
            rgb: hslToRgb({ h: primaryHsl.h, s: Math.min(primaryHsl.s, 60), l: 8 }),
            lum: 0.08,
            hsl: { h: primaryHsl.h, s: Math.min(primaryHsl.s, 60), l: 8 },
            count: 1,
          };
        }

        // Wave color: Rich midtone saturated accent
        let waveCandidate = candidates.find(c => c.hsl.s > 25 && c.lum > 0.12 && c.lum < 0.6);
        if (!waveCandidate) {
          const baseHsl = candidates[0].hsl;
          waveCandidate = {
            rgb: hslToRgb({ h: (baseHsl.h + 20) % 360, s: 70, l: 35 }),
            lum: 0.3,
            hsl: { h: (baseHsl.h + 20) % 360, s: 70, l: 35 },
            count: 1,
          };
        }

        // Crest color: Luminous, high contrast highlight (Luminance 0.5 - 0.95)
        let crestCandidate = candidates.find(c => c.lum > 0.6 && c.hsl.s > 15);
        if (!crestCandidate) {
          const waveHsl = waveCandidate.hsl;
          crestCandidate = {
            rgb: hslToRgb({ h: waveHsl.h, s: Math.max(waveHsl.s - 10, 30), l: 78 }),
            lum: 0.8,
            hsl: { h: waveHsl.h, s: Math.max(waveHsl.s - 10, 30), l: 78 },
            count: 1,
          };
        }

        const horizonHex = rgbToHex(horizonCandidate.rgb);
        const waveHex = rgbToHex(waveCandidate.rgb);
        const crestHex = rgbToHex(crestCandidate.rgb);

        const palette: WavePalette = {
          horizonColor: horizonHex,
          waveColor: waveHex,
          crestColor: crestHex,
          accentGlow: waveHex,
        };

        paletteCache.set(imageUrl, palette);
        resolve(palette);
      } catch (err) {
        console.warn('Failed to extract palette, using default:', err);
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(DEFAULT_PALETTE);
    };

    img.src = imageUrl;
  });
}
