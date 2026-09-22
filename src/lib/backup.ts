/**
 * Export/import for the app's full localStorage state (the "backup" feature
 * in Settings). Pulled out of usePuffData as plain functions — operating on
 * `localStorage` directly rather than React state — so the round-trip logic
 * is unit-testable without rendering the hook.
 */

const BACKUP_APP_NAME = 'VapeWise';

/** Everything the app stores, as a JSON string (for export/backup). */
export function exportBackup(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const raw = localStorage.getItem(key);
    try {
      data[key] = raw ? JSON.parse(raw) : raw;
    } catch {
      data[key] = raw;
    }
  }
  return JSON.stringify({ app: BACKUP_APP_NAME, exportedAt: new Date().toISOString(), data }, null, 2);
}

/**
 * Restore a JSON backup produced by exportBackup(). Replaces all current
 * localStorage contents with the backup's. Caller should reload afterward
 * so every hook re-hydrates from the restored data. Returns an error message
 * on failure, or null on success.
 */
export function importBackup(json: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return "That file isn't valid JSON.";
  }
  if (
    typeof parsed !== 'object' || parsed === null ||
    (parsed as Record<string, unknown>).app !== BACKUP_APP_NAME ||
    typeof (parsed as Record<string, unknown>).data !== 'object' ||
    (parsed as Record<string, unknown>).data === null
  ) {
    return "That doesn't look like a VapeWise backup file.";
  }
  const data = (parsed as { data: Record<string, unknown> }).data;
  try {
    localStorage.clear();
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  } catch {
    return 'Could not write the backup to storage.';
  }
  return null;
}
