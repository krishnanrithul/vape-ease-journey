import { describe, it, expect } from 'vitest';
import { limitTone } from './progressTone';

describe('limitTone', () => {
  it('is success well under the limit', () => {
    expect(limitTone(0, 20)).toBe('success');
    expect(limitTone(10, 20)).toBe('success');
  });

  it('is success just under the 80% warning threshold', () => {
    expect(limitTone(15, 20)).toBe('success'); // 75%
  });

  it('is warning at exactly 80% of target', () => {
    expect(limitTone(16, 20)).toBe('warning'); // 80% exactly
  });

  it('is warning between 80% and 100%', () => {
    expect(limitTone(19, 20)).toBe('warning'); // 95%
  });

  it('is destructive at exactly 100% of target', () => {
    expect(limitTone(20, 20)).toBe('destructive');
  });

  it('is destructive over 100% of target', () => {
    expect(limitTone(25, 20)).toBe('destructive');
  });

  it('treats a target of 0 or less as always success (avoids divide-by-zero)', () => {
    expect(limitTone(0, 0)).toBe('success');
    expect(limitTone(5, 0)).toBe('success');
    expect(limitTone(5, -1)).toBe('success');
  });

  it('never returns primary', () => {
    const results = [limitTone(0, 20), limitTone(16, 20), limitTone(25, 20), limitTone(5, 0)];
    expect(results).not.toContain('primary');
  });
});
