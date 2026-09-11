import { useState, useEffect } from 'react';
import { safeParse, safeParseInt } from '@/lib/safeStorage';

export interface PuffEntry {
  id: string;
  timestamp: Date;
  count: number;
  trigger?: string;
  mood?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  type: 'milestone' | 'streak' | 'goal';
}

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate?: string;
}

export interface DailyStats {
  date: string;
  puffs: number;
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

/** Current streak (ending today or yesterday) and longest-ever run of consecutive tracked days. */
export function computeStreaks(entries: PuffEntry[]): { current: number; longest: number } {
  const days = new Set(entries.map(p => dayKey(p.timestamp)));
  if (days.size === 0) return { current: 0, longest: 0 };

  const sorted = [...days].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = new Date();
  let cursor = days.has(dayKey(today)) ? today : days.has(dayKey(addDays(today, -1))) ? addDays(today, -1) : null;
  let current = 0;
  while (cursor && days.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

export function usePuffData() {
  const [puffs, setPuffs] = useState<PuffEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({ current: 0, longest: 0 });
  const [baseline, setBaselineState] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // bumped when the tab becomes visible again so "today" derived values refresh after midnight
  const [, setTick] = useState(0);

  // Load data from localStorage on mount
  useEffect(() => {
    type StoredPuff = Omit<PuffEntry, 'timestamp'> & { timestamp: string };
    const storedPuffs = safeParse<StoredPuff[]>('vape-puffs', []);
    if (storedPuffs.length) {
      setPuffs(storedPuffs.map(p => ({ ...p, timestamp: new Date(p.timestamp) })));
    }

    setDailyGoal(safeParseInt('daily-goal', 20));

    type StoredAchievement = Omit<Achievement, 'unlockedAt'> & { unlockedAt?: string };
    const storedAchievements = safeParse<StoredAchievement[]>('achievements', []);
    if (storedAchievements.length) {
      setAchievements(storedAchievements.map(a => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
      })));
    }

    const storedStreak = safeParse<StreakData | null>('streak-data', null);
    if (storedStreak) {
      setStreakData(storedStreak);
    }

    const storedBaseline = safeParseInt('baseline-puffs', 0);
    if (storedBaseline > 0) setBaselineState(storedBaseline);

    setHydrated(true);
  }, []);

  // Recompute streak / today when the app comes back to the foreground (day rollover).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setTick(t => t + 1);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('vape-puffs', JSON.stringify(puffs));
    updateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puffs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('daily-goal', dailyGoal.toString());
  }, [dailyGoal, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('streak-data', JSON.stringify(streakData));
  }, [streakData, hydrated]);

  const setBaseline = (value: number | null) => {
    setBaselineState(value);
    if (value && value > 0) localStorage.setItem('baseline-puffs', String(value));
    else localStorage.removeItem('baseline-puffs');
  };

  const checkAchievements = (newPuffCount: number) => {
    const today = new Date().toDateString();
    const totalPuffs = puffs.reduce((sum, p) => sum + p.count, 0) + newPuffCount;
    const daysTracked = new Set(puffs.map(p => p.timestamp.toDateString())).size;

    const possibleAchievements = [
      { id: 'first-log', title: 'First Step', description: 'Logged your first puff', icon: '🌱', type: 'milestone' as const },
      { id: 'week-tracking', title: 'Week Warrior', description: '7 days of tracking', icon: '🌿', type: 'milestone' as const },
      { id: 'month-tracking', title: 'Monthly Master', description: '30 days of tracking', icon: '🌸', type: 'milestone' as const },
      { id: 'goal-met', title: 'Goal Getter', description: 'Met your daily goal', icon: '🎯', type: 'goal' as const },
      { id: 'streak-3', title: 'Consistency King', description: '3 day streak of tracking', icon: '🔥', type: 'streak' as const },
      { id: 'streak-7', title: 'Week Streak', description: '7 day tracking streak', icon: '⚡', type: 'streak' as const },
    ];

    possibleAchievements.forEach(achievement => {
      const alreadyUnlocked = achievements.some(a => a.id === achievement.id);
      if (alreadyUnlocked) return;

      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-log':
          shouldUnlock = totalPuffs >= 1;
          break;
        case 'week-tracking':
          shouldUnlock = daysTracked >= 7;
          break;
        case 'month-tracking':
          shouldUnlock = daysTracked >= 30;
          break;
        case 'goal-met': {
          // "Met your daily goal" = completed a full past day at or under the limit.
          // Evaluated end-of-day, never on the current (still in-progress) day.
          const today = new Date().toDateString();
          const puffsByDay = new Map<string, number>();
          puffs.forEach(p => {
            const day = p.timestamp.toDateString();
            puffsByDay.set(day, (puffsByDay.get(day) || 0) + p.count);
          });
          shouldUnlock = [...puffsByDay.entries()].some(
            ([day, count]) => day !== today && count <= dailyGoal
          );
          break;
        }
        case 'streak-3':
          shouldUnlock = streakData.current >= 3;
          break;
        case 'streak-7':
          shouldUnlock = streakData.current >= 7;
          break;
      }

      if (shouldUnlock) {
        const newAchievement = { ...achievement, unlockedAt: new Date() };
        setAchievements(prev => [...prev, newAchievement]);
        
        // Show toast notification
        import('sonner').then(({ toast }) => {
          toast.success(`Achievement Unlocked: ${achievement.title}!`, {
            description: achievement.description,
            duration: 4000
          });
        });
      }
    });
  };

  const updateStreak = () => {
    const { current, longest } = computeStreaks(puffs);
    setStreakData(prev => {
      const next = {
        current,
        longest: Math.max(prev.longest, longest),
        lastActiveDate: new Date().toDateString(),
      };
      return prev.current === next.current && prev.longest === next.longest ? prev : next;
    });
  };

  const addPuff = (count: number = 1, trigger?: string, mood?: string) => {
    const newPuff: PuffEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      count,
      trigger,
      mood
    };
    setPuffs(prev => [newPuff, ...prev]);
    checkAchievements(count);
    return newPuff.id;
  };

  const removePuff = (id: string) => {
    setPuffs(prev => prev.filter(p => p.id !== id));
  };

  /** Re-insert a previously deleted entry with its original timestamp (undo). */
  const restorePuff = (entry: PuffEntry) => {
    setPuffs(prev => (prev.some(p => p.id === entry.id) ? prev : [entry, ...prev]));
  };

  const updatePuff = (id: string, count: number) => {
    const safe = Math.max(1, Math.min(200, Math.round(count)));
    setPuffs(prev => prev.map(p => (p.id === id ? { ...p, count: safe } : p)));
  };

  /** Everything the app stores, as a JSON string (for export/backup). */
  const exportData = () => {
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
    return JSON.stringify({ app: 'VapeWise', exportedAt: new Date().toISOString(), data }, null, 2);
  };

  /** Wipes all app data. Caller should reload so every hook re-hydrates. */
  const clearAllData = () => {
    localStorage.clear();
  };

  const getTodaysPuffs = () => {
    const today = new Date().toDateString();
    return puffs
      .filter(puff => puff.timestamp.toDateString() === today)
      .reduce((total, puff) => total + puff.count, 0);
  };

  const getWeeklyData = (): DailyStats[] => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayPuffs = puffs
        .filter(puff => puff.timestamp.toDateString() === dateStr)
        .reduce((total, puff) => total + puff.count, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        puffs: dayPuffs
      });
    }
    return last7Days;
  };

  const DAY_NAMES: Record<string, string> = {
    Sun: 'Sundays', Mon: 'Mondays', Tue: 'Tuesdays', Wed: 'Wednesdays',
    Thu: 'Thursdays', Fri: 'Fridays', Sat: 'Saturdays',
  };

  /** Minimum tracked days before we claim to see a pattern. */
  const MIN_INSIGHT_DAYS = 3;

  const getInsight = () => {
    const weekData = getWeeklyData();
    const tracked = weekData.filter(d => d.puffs > 0);
    if (tracked.length < MIN_INSIGHT_DAYS) {
      const left = MIN_INSIGHT_DAYS - tracked.length;
      return `Log ${left} more day${left === 1 ? '' : 's'} and patterns will start to show here.`;
    }
    const maxDay = tracked.reduce((max, day) => (day.puffs > max.puffs ? day : max));
    const totalWeek = tracked.reduce((sum, day) => sum + day.puffs, 0);
    const avgDaily = Math.round(totalWeek / tracked.length);

    if (maxDay.puffs > avgDaily * 1.5) {
      return `You tend to vape more on ${DAY_NAMES[maxDay.date] ?? maxDay.date}`;
    } else if (getTodaysPuffs() < avgDaily) {
      return "You're below your average so far this week — nice.";
    }
    return `You're averaging ${avgDaily} puffs on the days you've tracked this week.`;
  };

  const getStreakIcon = () => {
    const streak = streakData.current;
    if (streak === 0) return '🌰'; // seed
    if (streak <= 2) return '🌱'; // sprout
    if (streak <= 6) return '🌿'; // sapling
    if (streak <= 13) return '🌳'; // young tree
    if (streak <= 29) return '🌸'; // flowering
    return '🌺'; // full bloom
  };

  const getStreakMessage = () => {
    const streak = streakData.current;
    if (streak === 0) return 'Plant your tracking seed today!';
    if (streak <= 2) return 'Your tracking habit is sprouting!';
    if (streak <= 6) return 'Growing strong with consistency!';
    if (streak <= 13) return 'Your mindful tracking is flourishing!';
    if (streak <= 29) return 'Beautiful habit in full bloom!';
    return 'Master gardener of mindful tracking!';
  };

  const getRecentAchievements = () => {
    return achievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 3);
  };

  return {
    puffs,
    hydrated,
    addPuff,
    removePuff,
    restorePuff,
    updatePuff,
    baseline,
    setBaseline,
    exportData,
    clearAllData,
    getTodaysPuffs,
    getWeeklyData,
    getInsight,
    dailyGoal,
    setDailyGoal,
    achievements,
    streakData,
    getStreakIcon,
    getStreakMessage,
    getRecentAchievements
  };
}