/**
 * Daily "log today?" reminder.
 *
 * Local-first app, no push server. Two delivery paths:
 *  - Native (iOS/Android via Capacitor): @capacitor/local-notifications schedules
 *    a real OS-level notification that fires even with the app closed/killed.
 *  - Web (browser tab / installed PWA): falls back to the Web Notifications API,
 *    which only fires while the app is alive — a timer aimed at the next
 *    reminder hour, plus a catch-up check when the app comes to the foreground.
 */

import { Capacitor } from '@capacitor/core';

export const REMINDER_ENABLED_KEY = 'vape-reminder-enabled';
export const REMINDER_HOUR_KEY = 'vape-reminder-hour';
const LAST_FIRED_KEY = 'vape-reminder-last-fired';
/** Fixed id for the recurring native notification so re-scheduling replaces it instead of stacking. */
const NATIVE_NOTIFICATION_ID = 1001;

export const DEFAULT_REMINDER_HOUR = 21;

const isNative = () => Capacitor.isNativePlatform();

export function isReminderSupported(): boolean {
  if (isNative()) return true;
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isReminderEnabled(): boolean {
  return localStorage.getItem(REMINDER_ENABLED_KEY) === 'true';
}

export function getReminderHour(): number {
  const raw = Number(localStorage.getItem(REMINDER_HOUR_KEY));
  return Number.isInteger(raw) && raw >= 0 && raw <= 23 ? raw : DEFAULT_REMINDER_HOUR;
}

export function setReminderHour(hour: number) {
  localStorage.setItem(REMINDER_HOUR_KEY, String(hour));
  if (isReminderEnabled() && isNative()) void scheduleNativeReminder(hour);
}

/** Ask for permission (if needed) and persist the toggle. Returns the resulting enabled state. */
export async function setReminderEnabled(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    localStorage.setItem(REMINDER_ENABLED_KEY, 'false');
    if (isNative()) await cancelNativeReminder();
    return false;
  }
  if (!isReminderSupported()) return false;

  if (isNative()) {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
    const ok = perm.display === 'granted';
    localStorage.setItem(REMINDER_ENABLED_KEY, ok ? 'true' : 'false');
    if (ok) await scheduleNativeReminder(getReminderHour());
    return ok;
  }

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  const ok = permission === 'granted';
  localStorage.setItem(REMINDER_ENABLED_KEY, ok ? 'true' : 'false');
  return ok;
}

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function nextFireDelayMs(hour: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

/** Schedule (or replace) the recurring native notification at `hour`, every day. */
async function scheduleNativeReminder(hour: number) {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.cancel({ notifications: [{ id: NATIVE_NOTIFICATION_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: NATIVE_NOTIFICATION_ID,
        title: 'VapeWise',
        body: 'Log today? A quick tap keeps your streak honest.',
        schedule: { on: { hour, minute: 0 }, allowWhileIdle: true },
      },
    ],
  });
}

async function cancelNativeReminder() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.cancel({ notifications: [{ id: NATIVE_NOTIFICATION_ID }] });
}

async function showWebReminder() {
  if (Notification.permission !== 'granted') return;
  const title = 'VapeWise';
  const options: NotificationOptions = {
    body: 'Log today? A quick tap keeps your streak honest.',
    icon: '/pwa-192.png',
    tag: 'vapewise-daily-reminder',
  };
  try {
    // Prefer the service worker so the notification survives tab discard on PWA installs.
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
    localStorage.setItem(LAST_FIRED_KEY, todayKey());
  } catch (err) {
    console.warn('Reminder failed', err);
  }
}

/**
 * Fire the web reminder now if it is due today and hasn't fired yet, unless the
 * caller says the user has already logged today. No-op on native — the OS
 * handles firing there, this is only the in-app catch-up path for the web case.
 */
export function fireIfDue(hasLoggedToday: boolean) {
  if (isNative()) return;
  if (!isReminderEnabled() || !isReminderSupported()) return;
  if (hasLoggedToday) return;
  if (localStorage.getItem(LAST_FIRED_KEY) === todayKey()) return;
  if (new Date().getHours() >= getReminderHour()) void showWebReminder();
}

/**
 * Keep a timer aimed at the next reminder hour while the app is open (web only —
 * on native the OS-scheduled notification below covers this). Returns a cleanup
 * function. Also re-arms the native schedule once on mount, in case it was set
 * up before the app last quit and needs to persist across app updates.
 */
export function scheduleReminder(getHasLoggedToday: () => boolean): () => void {
  if (!isReminderEnabled() || !isReminderSupported()) return () => {};

  if (isNative()) {
    void scheduleNativeReminder(getReminderHour());
    return () => {};
  }

  let timer: number | undefined;
  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      fireIfDue(getHasLoggedToday());
      arm();
    }, nextFireDelayMs(getReminderHour()));
  };
  arm();
  return () => window.clearTimeout(timer);
}
