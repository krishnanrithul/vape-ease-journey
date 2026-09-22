/**
 * Light native haptic feedback for a couple of satisfying moments — logging a
 * puff, unlocking an achievement. No-ops on web/PWA (there's no haptics API
 * to fall back to there, unlike reminders.ts's Web Notifications fallback),
 * and fails silently if the native plugin errors for any reason — haptics
 * are pure delight, never something a tap should be blocked or crash on.
 */

import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

/** A light tap — used when a puff is logged. */
async function tapLight() {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics unavailable on this device/build — silently skip.
  }
}

/** A slightly stronger "success" pulse — used when an achievement unlocks. */
async function celebrate() {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Haptics unavailable on this device/build — silently skip.
  }
}

export const haptics = {
  puffLogged: () => void tapLight(),
  achievementUnlocked: () => void celebrate(),
};
