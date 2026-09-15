import { describe, it, expect } from 'vitest';
import { formatSeconds, formatTimeAgo } from '../utils/timeFormatter';

describe('timeFormatter', () => {
  it('formats zero and negative seconds cleanly', () => {
    expect(formatSeconds(0)).toBe('0:00');
    expect(formatSeconds(-10)).toBe('0:00');
    expect(formatSeconds(NaN)).toBe('0:00');
  });

  it('formats standard minute:second durations', () => {
    expect(formatSeconds(45)).toBe('0:45');
    expect(formatSeconds(65)).toBe('1:05');
    expect(formatSeconds(214)).toBe('3:34');
  });

  it('formats hour:minute:second durations', () => {
    expect(formatSeconds(3665)).toBe('1:01:05');
    expect(formatSeconds(7200)).toBe('2:00:00');
  });

  it('formats relative time ago correctly', () => {
    const now = new Date().toISOString();
    expect(formatTimeAgo(now)).toBe('Just now');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
  });
});
