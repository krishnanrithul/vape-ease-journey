import { describe, it, expect, beforeEach } from 'vitest';
import { exportBackup, importBackup } from './backup';

/** Minimal Storage polyfill — vitest runs in Node, so there's no real localStorage. */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return [...this.store.keys()][index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();
});

describe('exportBackup / importBackup round-trip', () => {
  it('round-trips a realistic set of app keys exactly', () => {
    localStorage.setItem('vape-puffs', JSON.stringify([{ id: '1', timestamp: '2026-09-20T10:00:00.000Z', count: 3 }]));
    localStorage.setItem('daily-goal', '20');
    localStorage.setItem('baseline-puffs', '30');
    localStorage.setItem('achievements', JSON.stringify([{ id: 'first-log', progress: 1, unlockedAt: '2026-09-20T10:00:00.000Z' }]));
    localStorage.setItem('vape-reminder-enabled', 'true');
    localStorage.setItem('vape-onboarding-complete', 'true');

    const backup = exportBackup();

    localStorage.clear();
    expect(localStorage.length).toBe(0);

    const error = importBackup(backup);
    expect(error).toBeNull();

    expect(localStorage.getItem('vape-puffs')).toBe(JSON.stringify([{ id: '1', timestamp: '2026-09-20T10:00:00.000Z', count: 3 }]));
    expect(localStorage.getItem('daily-goal')).toBe('20');
    expect(localStorage.getItem('baseline-puffs')).toBe('30');
    expect(localStorage.getItem('achievements')).toBe(
      JSON.stringify([{ id: 'first-log', progress: 1, unlockedAt: '2026-09-20T10:00:00.000Z' }])
    );
    expect(localStorage.getItem('vape-reminder-enabled')).toBe('true');
    expect(localStorage.getItem('vape-onboarding-complete')).toBe('true');
  });

  it('embeds the app marker and an exportedAt timestamp', () => {
    localStorage.setItem('daily-goal', '20');
    const parsed = JSON.parse(exportBackup());
    expect(parsed.app).toBe('VapeWise');
    expect(typeof parsed.exportedAt).toBe('string');
    expect(new Date(parsed.exportedAt).toString()).not.toBe('Invalid Date');
  });

  it('import replaces existing data rather than merging with it', () => {
    localStorage.setItem('daily-goal', '20');
    const backup = exportBackup();

    localStorage.clear();
    localStorage.setItem('daily-goal', '99');
    localStorage.setItem('stale-key-not-in-backup', 'should be wiped');

    importBackup(backup);

    expect(localStorage.getItem('daily-goal')).toBe('20');
    expect(localStorage.getItem('stale-key-not-in-backup')).toBeNull();
  });

  it('rejects malformed JSON without touching existing storage', () => {
    localStorage.setItem('daily-goal', '20');
    const error = importBackup('{not valid json');
    expect(error).toBe("That file isn't valid JSON.");
    expect(localStorage.getItem('daily-goal')).toBe('20');
  });

  it('rejects a JSON file that is valid but not a VapeWise backup', () => {
    localStorage.setItem('daily-goal', '20');
    const error = importBackup(JSON.stringify({ some: 'other', shape: true }));
    expect(error).toBe("That doesn't look like a VapeWise backup file.");
    expect(localStorage.getItem('daily-goal')).toBe('20');
  });

  it('rejects a backup whose data field is missing or the wrong type', () => {
    expect(importBackup(JSON.stringify({ app: 'VapeWise' }))).toBe("That doesn't look like a VapeWise backup file.");
    expect(importBackup(JSON.stringify({ app: 'VapeWise', data: 'not-an-object' }))).toBe(
      "That doesn't look like a VapeWise backup file."
    );
    expect(importBackup(JSON.stringify({ app: 'VapeWise', data: null }))).toBe(
      "That doesn't look like a VapeWise backup file."
    );
  });

  it('rejects a backup from a different app', () => {
    const error = importBackup(JSON.stringify({ app: 'SomeOtherApp', data: { x: 1 } }));
    expect(error).toBe("That doesn't look like a VapeWise backup file.");
  });

  it('round-trips an empty backup (no keys) cleanly', () => {
    const backup = exportBackup();
    localStorage.setItem('leftover', 'x');
    const error = importBackup(backup);
    expect(error).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
