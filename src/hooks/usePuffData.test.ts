import { describe, it, expect } from 'vitest';
import { computeStreaks, type PuffEntry } from './usePuffData';

/** Build a minimal PuffEntry `n` days before today, at a fixed time of day (avoids midnight-boundary flakiness). */
function entryDaysAgo(n: number, count = 1): PuffEntry {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return { id: `${n}-${Math.random()}`, timestamp: d, count };
}

describe('computeStreaks', () => {
  it('returns zero for no entries', () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it('counts a single entry logged today', () => {
    const result = computeStreaks([entryDaysAgo(0)]);
    expect(result).toEqual({ current: 1, longest: 1 });
  });

  it('still counts current streak if the last log was yesterday (grace day)', () => {
    const result = computeStreaks([entryDaysAgo(1)]);
    expect(result).toEqual({ current: 1, longest: 1 });
  });

  it('resets current streak to 0 if the last log was 2+ days ago, but keeps longest', () => {
    const result = computeStreaks([entryDaysAgo(2)]);
    expect(result).toEqual({ current: 0, longest: 1 });
  });

  it('counts multiple puffs on the same day as a single tracked day', () => {
    const result = computeStreaks([entryDaysAgo(0, 3), entryDaysAgo(0, 1), entryDaysAgo(0, 5)]);
    expect(result).toEqual({ current: 1, longest: 1 });
  });

  it('counts a 5-day consecutive run ending today', () => {
    const entries = [0, 1, 2, 3, 4].map(n => entryDaysAgo(n));
    expect(computeStreaks(entries)).toEqual({ current: 5, longest: 5 });
  });

  it('breaks the streak across a gap and reports the longest historical run separately from the current one', () => {
    // A 10-day streak from 20..11 days ago (broken), then a fresh 2-day streak ending today.
    const oldRun = Array.from({ length: 10 }, (_, i) => entryDaysAgo(20 - i)); // days 20..11 ago
    const currentRun = [entryDaysAgo(1), entryDaysAgo(0)];
    const result = computeStreaks([...oldRun, ...currentRun]);
    expect(result).toEqual({ current: 2, longest: 10 });
  });

  it('current streak of 0 does not clobber a longer historical streak', () => {
    const oldRun = Array.from({ length: 4 }, (_, i) => entryDaysAgo(10 - i)); // days 10..7 ago, well outside the grace window
    const result = computeStreaks(oldRun);
    expect(result).toEqual({ current: 0, longest: 4 });
  });

  it('handles entries given out of chronological order', () => {
    const entries = [entryDaysAgo(2), entryDaysAgo(0), entryDaysAgo(1)];
    expect(computeStreaks(entries)).toEqual({ current: 3, longest: 3 });
  });
});
