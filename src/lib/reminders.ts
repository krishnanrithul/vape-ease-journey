/**
 * Daily "log today?" reminder.
 *
 * Local-first app, no push server — so this uses the Web Notifications API and
 * only fires while the app (PWA or browser tab) is alive:
 *  - a timer aimed at the next reminder hour while the app is open
 *  - a catch-up check when the app comes to the foreground after the hour
 * Native Capacitor builds should swap this for @capacitor/local-notifications,
 * which can fire with the app closed.
 */

export const REMINDER_ENABLED_KEY = 'vape-reminder-enabled';
export const REMINDER_HOUR_KEY = 'vape-reminder-hour';
const LAST_FIRED_KEY = 'vape-reminder-last-fired';

export const DEFAULT_REMINDER_HOUR = 21;

export function isReminderSupported(): boolean {
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
}

/** Ask for permission (if needed) and persist the toggle. Returns the resulting enabled state. */
export async function setReminderEnabled(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    localStorage.setItem(REMINDER_ENABLED_KEY, 'false');
    return false;
  }
  if (!isReminderSupported()) return false;
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

async function showReminder() {
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
 * Fire the reminder now if it is due today and hasn't fired yet, unless the
 * caller says the user has already logged today.
 */
export function fireIfDue(hasLoggedToday: boolean) {
  if (!isReminderEnabled() || !isReminderSupported()) return;
  if (hasLoggedToday) return;
  if (localStorage.getItem(LAST_FIRED_KEY) === todayKey()) return;
  if (new Date().getHours() >= getReminderHour()) void showReminder();
}

/**
 * Keep a timer aimed at the next reminder hour while the app is open.
 * Returns a cleanup function.
 */
export function scheduleReminder(getHasLoggedToday: () => boolean): () => void {
  if (!isReminderEnabled() || !isReminderSupported()) return () => {};
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
