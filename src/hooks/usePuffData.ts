import { useState, useEffect } from 'react';
import { safeParse, safeParseInt } from '@/lib/safeStorage';
import { INSIGHTS_VIEWS_KEY } from '@/lib/storageKeys';

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
  type: 'milestone' | 'streak' | 'goal';
  /** Target value for `progress` — every achievement has one, even binary ones (maxProgress: 1). */
  maxProgress: number;
  progress?: number;
  unlockedAt?: Date;
}

/**
 * Single source of truth for every achievement: definition (title, copy, icon,
 * target) AND, at hydration time, the sole authority that overrides whatever
 * a stale localStorage entry claims. This app used to spread three separate,
 * overlapping reward systems across three hooks (this one's Achievements, a
 * Badges list, and a Goals-hook Milestones list) that tracked nearly
 * identical behaviors ("logged your first puff" / "tracked 7 days" / etc.)
 * under different ids, thresholds, and a meaningless rarity taxonomy. They've
 * been merged into this single list — one entry per distinct accomplishment.
 */
const ACHIEVEMENT_DEFS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  { id: 'first-log', title: 'First Step', description: 'Logged your first puff', icon: 'sprout', type: 'milestone', maxProgress: 1 },
  { id: 'streak-3', title: '3-Day Streak', description: 'Tracked 3 days in a row', icon: 'flame', type: 'streak', maxProgress: 3 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Tracked 7 days in a row', icon: 'calendar-check', type: 'streak', maxProgress: 7 },
  { id: 'streak-30', title: 'Month Master', description: 'Tracked 30 days in a row', icon: 'crown', type: 'streak', maxProgress: 30 },
  { id: 'goal-met', title: 'Goal Getter', description: 'Stayed under your daily limit', icon: 'target', type: 'goal', maxProgress: 1 },
  { id: 'goal-crusher', title: 'Goal Crusher', description: 'Stayed under your limit 10 times', icon: 'dumbbell', type: 'goal', maxProgress: 10 },
  { id: 'reduction-hero', title: 'Reduction Hero', description: 'Reduced 25% below your baseline', icon: 'trend-down', type: 'goal', maxProgress: 25 },
  { id: 'reduction-champion', title: 'Reduction Champion', description: 'Reduced 50% below your baseline', icon: 'trophy', type: 'goal', maxProgress: 50 },
  { id: 'insight-seeker', title: 'Insight Seeker', description: 'Viewed your insights 20 times', icon: 'search', type: 'milestone', maxProgress: 20 },
  { id: 'early-bird', title: 'Early Bird', description: 'Logged before 9am ten times', icon: 'bird', type: 'milestone', maxProgress: 10 },
];

/** Old ids from the pre-consolidation Achievements/Badges/Milestones split, so anyone
 * who already earned progress under an old id doesn't lose it in the merge. */
const OLD_ID_REMAP: Record<string, string> = {
  'week-tracking': 'streak-7',
  'month-tracking': 'streak-30',
};

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

    // Merge stored progress/unlock state onto the current definitions, keyed by id
    // (remapping old pre-consolidation ids first) — title/description/icon/maxProgress
    // always come from ACHIEVEMENT_DEFS so a copy or icon fix here reaches everyone,
    // and only the per-user progress/unlockedAt fields are ever read from storage.
    type StoredAchievement = { id: string; progress?: number; unlockedAt?: string };
    const storedRaw = safeParse<StoredAchievement[]>('achievements', []);
    const storedById = new Map<string, StoredAchievement>();
    storedRaw.forEach(a => {
      const id = OLD_ID_REMAP[a.id] ?? a.id;
      const existing = storedById.get(id);
      if (!existing || (a.unlockedAt && !existing.unlockedAt)) {
        storedById.set(id, { ...a, id });
      }
    });
    setAchievements(ACHIEVEMENT_DEFS.map(def => {
      const stored = storedById.get(def.id);
      return {
        ...def,
        progress: stored?.progress,
        unlockedAt: stored?.unlockedAt ? new Date(stored.unlockedAt) : undefined,
      };
    }));

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

  /**
   * Recompute every achievement's progress from current app state and unlock
   * anything that just crossed its target. Runs reactively (see the effect
   * below) rather than only right after logging a puff, since several of
   * these depend on things that change independently of that (baseline,
   * insight-page views, day rollover).
   */
  const refreshAchievements = () => {
    const totalPuffs = puffs.reduce((sum, p) => sum + p.count, 0);
    const today = new Date().toDateString();
    const puffsByDay = new Map<string, number>();
    puffs.forEach(p => {
      const day = p.timestamp.toDateString();
      puffsByDay.set(day, (puffsByDay.get(day) || 0) + p.count);
    });
    // "Under your limit" only counts finished days, never the still-in-progress today.
    const daysUnderLimit = [...puffsByDay.entries()].filter(
      ([day, count]) => day !== today && count <= dailyGoal
    ).length;
    const earlyMorningSessions = puffs.filter(p => p.timestamp.getHours() < 9).length;
    const insightViews = safeParseInt(INSIGHTS_VIEWS_KEY, 0);

    let reductionPercent = 0;
    if (baseline && baseline > 0) {
      const week = getWeeklyData().filter(d => d.puffs > 0);
      if (week.length > 0) {
        const avg = week.reduce((sum, d) => sum + d.puffs, 0) / week.length;
        reductionPercent = Math.max(0, ((baseline - avg) / baseline) * 100);
      }
    }

    const progressById: Record<string, number> = {
      'first-log': totalPuffs >= 1 ? 1 : 0,
      'streak-3': streakData.current,
      'streak-7': streakData.current,
      'streak-30': streakData.current,
      'goal-met': daysUnderLimit >= 1 ? 1 : 0,
      'goal-crusher': daysUnderLimit,
      'reduction-hero': Math.round(reductionPercent),
      'reduction-champion': Math.round(reductionPercent),
      'insight-seeker': insightViews,
      'early-bird': earlyMorningSessions,
    };

    setAchievements(prev => {
      let changed = false;
      const next = prev.map(a => {
        const progress = Math.min(progressById[a.id] ?? 0, a.maxProgress);
        const nowUnlocked = !a.unlockedAt && progress >= a.maxProgress;
        if (progress === a.progress && !nowUnlocked) return a;
        changed = true;
        const updated: Achievement = { ...a, progress };
        if (nowUnlocked) {
          updated.unlockedAt = new Date();
          import('sonner').then(({ toast }) => {
            toast.success(`Achievement Unlocked: ${a.title}!`, {
              description: a.description,
              duration: 4000
            });
          });
        }
        return updated;
      });
      return changed ? next : prev;
    });
  };

  useEffect(() => {
    if (!hydrated) return;
    refreshAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, puffs, streakData, dailyGoal, baseline]);

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

  /** Growth-stage icon key (rendered via AppIcon) — same plant metaphor, outline icon set. */
  const getStreakIcon = () => {
    const streak = streakData.current;
    if (streak === 0) return 'seed';
    if (streak <= 2) return 'sprout';
    if (streak <= 6) return 'sapling';
    if (streak <= 13) return 'tree';
    if (streak <= 29) return 'flower';
    return 'bloom';
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

  const getUnlockedAchievements = () =>
    achievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0));

  const getPendingAchievements = () => achievements.filter(a => !a.unlockedAt);

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
    getRecentAchievements,
    getUnlockedAchievements,
    getPendingAchievements
  };
}
