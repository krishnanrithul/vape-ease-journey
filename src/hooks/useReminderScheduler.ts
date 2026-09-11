import { useEffect, useRef } from 'react';
import { fireIfDue, scheduleReminder } from '@/lib/reminders';

/**
 * Arms the daily reminder timer while the app is open and does a catch-up
 * check whenever the app returns to the foreground.
 */
export function useReminderScheduler(getHasLoggedToday: () => boolean) {
  const getter = useRef(getHasLoggedToday);
  getter.current = getHasLoggedToday;

  useEffect(() => {
    let cleanup = scheduleReminder(() => getter.current());
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      fireIfDue(getter.current());
      cleanup();
      cleanup = scheduleReminder(() => getter.current());
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('vape-reminder-changed', onVisible);
    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('vape-reminder-changed', onVisible);
    };
  }, []);
}
