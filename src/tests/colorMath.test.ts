import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, getLuminance } from '../utils/colorMath';

describe('colorMath', () => {
  it('converts hex to RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#0c87eb')).toEqual({ r: 12, g: 135, b: 235 });
  });

  it('converts RGB to Hex', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('calculates luminance correctly', () => {
    const whiteLum = getLuminance({ r: 255, g: 255, b: 255 });
    const blackLum = getLuminance({ r: 0, g: 0, b: 0 });
    expect(whiteLum).toBe(1);
    expect(blackLum).toBe(0);
  });

  it('round-trips RGB -> HSL -> RGB cleanly', () => {
    const original = { r: 50, g: 120, b: 220 };
    const hsl = rgbToHsl(original);
    const convertedBack = hslToRgb(hsl);
    expect(Math.abs(convertedBack.r - original.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(convertedBack.g - original.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(convertedBack.b - original.b)).toBeLessThanOrEqual(2);
  });
});
