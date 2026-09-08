/**
 * Safe wrappers around localStorage JSON access.
 *
 * A corrupted / truncated / schema-mismatched value must never throw during a
 * render or mount effect — with no ErrorBoundary that would white-screen the app.
 */
export function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === '') return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Corrupted localStorage key "${key}", resetting to default.`, err);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
}

/** Parse a plain integer value, returning the fallback for missing/NaN input. */
export function safeParseInt(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
