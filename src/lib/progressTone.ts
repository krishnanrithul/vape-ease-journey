export type ProgressTone = 'primary' | 'success' | 'warning' | 'destructive';

/**
 * Color for a "stay under the limit" progress bar (daily/weekly puff caps).
 * Green while comfortably under, amber approaching, red once over — mirrors
 * RingGauge so the same number always reads the same way across the app.
 * Never returns 'primary': that's reserved for brand/action and for
 * "more is better" achievement goals, so it never doubles as a success color.
 */
export function limitTone(current: number, target: number): ProgressTone {
  if (target <= 0) return 'success';
  const pct = current / target;
  if (pct >= 1) return 'destructive';
  if (pct >= 0.8) return 'warning';
  return 'success';
}

export const TONE_INDICATOR_CLASS: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export const TONE_TEXT_CLASS: Record<ProgressTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};
