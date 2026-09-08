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

export function usePuffData() {
  const [puffs, setPuffs] = useState<PuffEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({ current: 0, longest: 0 });

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
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('vape-puffs', JSON.stringify(puffs));
    updateStreak();
  }, [puffs]);

  useEffect(() => {
    localStorage.setItem('daily-goal', dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('streak-data', JSON.stringify(streakData));
  }, [streakData]);

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
    if (puffs.length === 0) return;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Get unique days with puffs
    const uniqueDays = [...new Set(puffs.map(p => p.timestamp.toDateString()))].sort();
    
    if (uniqueDays.length === 0) return;

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Calculate streaks
    for (let i = uniqueDays.length - 1; i >= 0; i--) {
      const currentDay = new Date(uniqueDays[i]);
      const nextDay = i < uniqueDays.length - 1 ? new Date(uniqueDays[i + 1]) : new Date();
      
      const dayDiff = Math.floor((nextDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff <= 1 || i === uniqueDays.length - 1) {
        tempStreak++;
        if (uniqueDays[i] === today || uniqueDays[i] === yesterday) {
          currentStreak = tempStreak;
        }
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    maxStreak = Math.max(maxStreak, tempStreak);
    
    setStreakData(prev => ({
      current: currentStreak,
      longest: Math.max(prev.longest, maxStreak),
      lastActiveDate: today
    }));
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

  const getInsight = () => {
    const weekData = getWeeklyData();
    const maxDay = weekData.reduce((max, day) => day.puffs > max.puffs ? day : max);
    const totalWeek = weekData.reduce((sum, day) => sum + day.puffs, 0);
    const avgDaily = Math.round(totalWeek / 7);
    
    if (maxDay.puffs > avgDaily * 1.5) {
      return `You tend to vape more on ${maxDay.date}s`;
    } else if (getTodaysPuffs() < avgDaily) {
      return "You're doing great today! Below your weekly average";
    } else {
      return `Your daily average this week is ${avgDaily} puffs`;
    }
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
    addPuff,
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