import { useState, useEffect } from 'react';
import { safeParse } from '@/lib/safeStorage';

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  description: string;
  target: number;
  current: number;
  period: 'day' | 'week' | 'month' | 'custom';
  startDate: Date;
  endDate?: Date;
  category: 'reduction' | 'streak' | 'mindfulness' | 'milestone';
  difficulty: 'easy' | 'medium' | 'hard';
  /**
   * 'decrease' = stay at or under the target for the period (recurring limit).
   * 'increase' = reach or exceed the target (one-off achievement).
   */
  direction: 'increase' | 'decrease';
  reward?: string;
  isActive: boolean;
  completedAt?: Date;
  icon: string;
  /** Period bucket the `current` value belongs to (day/week key). */
  periodKey?: string;
  /** Last period bucket already scored for a 'decrease' goal. */
  lastEvaluatedKey?: string;
}

const getDayKey = (d = new Date()) => d.toDateString();

const getWeekKey = (d = new Date()) => {
  const firstOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - firstOfYear.getTime()) / 86400000);
  const week = Math.floor((days + firstOfYear.getDay()) / 7);
  return `${d.getFullYear()}-W${week}`;
};

const periodKeyFor = (period: Goal['period'], existing?: string) => {
  if (period === 'day') return getDayKey();
  if (period === 'week') return getWeekKey();
  return existing ?? getDayKey();
};

const inferDirection = (category?: Goal['category']): Goal['direction'] =>
  category === 'reduction' ? 'decrease' : 'increase';

/**
 * Icon key for each built-in goal, by id — the single source of truth for the
 * default objects below AND for refreshing the `icon` field on anything
 * already sitting in localStorage from before the emoji -> icon-key
 * migration (2026-09-11).
 */
const BUILTIN_GOAL_ICONS: Record<string, string> = {
  'daily-reduction': 'target',
  'weekly-reduction': 'trend-down',
};

export function useAdvancedGoals() {
  const [hydrated, setHydrated] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    type StoredGoal = Omit<Goal, 'startDate' | 'endDate' | 'completedAt' | 'direction'> & {
      startDate: string;
      endDate?: string;
      completedAt?: string;
      direction?: Goal['direction'];
    };
    const storedGoals = safeParse<StoredGoal[] | null>('advanced-goals', null);
    if (storedGoals) {
      setGoals(storedGoals.map(g => ({
        ...g,
        icon: BUILTIN_GOAL_ICONS[g.id] ?? g.icon,
        direction: g.direction ?? inferDirection(g.category),
        startDate: new Date(g.startDate),
        endDate: g.endDate ? new Date(g.endDate) : undefined,
        completedAt: g.completedAt ? new Date(g.completedAt) : undefined
      })));
    } else {
      // Initialize with default goals
      const defaultGoals = [
        {
          id: 'daily-reduction',
          type: 'daily' as const,
          title: 'Daily Mindful Limit',
          description: 'Stay within your daily target',
          target: 20,
          current: 0,
          period: 'day' as const,
          startDate: new Date(),
          category: 'reduction' as const,
          difficulty: 'medium' as const,
          direction: 'decrease' as const,
          isActive: true,
          icon: BUILTIN_GOAL_ICONS['daily-reduction']
        },
        {
          id: 'weekly-reduction',
          type: 'weekly' as const,
          title: 'Weekly Progress',
          description: 'Reduce by 10% this week',
          target: 120,
          current: 0,
          period: 'week' as const,
          startDate: new Date(),
          category: 'reduction' as const,
          difficulty: 'medium' as const,
          direction: 'decrease' as const,
          isActive: true,
          icon: BUILTIN_GOAL_ICONS['weekly-reduction']
        }
      ];
      setGoals(defaultGoals);
    }

    setHydrated(true);
  }, []);

  // Never write before hydration — otherwise the initial empty state clobbers storage.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('advanced-goals', JSON.stringify(goals));
  }, [goals, hydrated]);

  const createCustomGoal = (goalData: Partial<Goal>) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      type: 'custom',
      title: goalData.title || 'Custom Goal',
      description: goalData.description || '',
      target: goalData.target || 1,
      current: 0,
      period: goalData.period || 'week',
      startDate: new Date(),
      endDate: goalData.endDate,
      category: goalData.category || 'mindfulness',
      difficulty: goalData.difficulty || 'medium',
      direction: goalData.direction ?? inferDirection(goalData.category),
      isActive: true,
      icon: goalData.icon || 'star',
      ...goalData
    };

    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => {
      const goal = prev.find(g => g.id === goalId);
      if (!goal) return prev;

      const key = periodKeyFor(goal.period, goal.periodKey);
      const rolledOver = goal.periodKey !== undefined && goal.periodKey !== key;

      // No-op guard: keep the same array reference so effects that read `goals`
      // don't re-run in a loop when nothing actually changed.
      if (!rolledOver && goal.current === progress && goal.periodKey === key) {
        return prev;
      }

      return prev.map(g => {
        if (g.id !== goalId) return g;

        const next: Goal = { ...g, current: progress, periodKey: key };

        // Recurring "stay under the limit" goals: score the finished period once.
        if (rolledOver && g.direction === 'decrease') {
          const succeeded = g.current <= g.target;
          if (succeeded && g.lastEvaluatedKey !== g.periodKey) {
            next.lastEvaluatedKey = g.periodKey;
            import('sonner').then(({ toast }) => {
              toast.success(
                `You stayed under your ${g.period === 'day' ? 'daily' : 'weekly'} limit!`,
                { description: 'Nice work — keep it up.', duration: 4000 }
              );
            });
          }
        }

        // One-off "reach the target" goals complete as soon as they hit it.
        if (g.direction === 'increase' && !g.completedAt && progress >= g.target) {
          next.completedAt = new Date();
          import('sonner').then(({ toast }) => {
            toast.success(`Goal Completed: ${g.title}!`, { duration: 4000 });
          });
        }

        return next;
      });
    });
  };

  /**
   * Keep a "stay under the limit" goal's target in sync with a source of
   * truth outside this hook (the app's daily-goal setting). Without this,
   * a goal created with the default target — e.g. the built-in "Daily
   * Mindful Limit" at 20 — never moves even after the user changes their
   * real daily goal, so its "stayed under the limit" tracking and its
   * `current` ratio quietly track the wrong number forever.
   */
  const setGoalTarget = (goalId: string, target: number) => {
    setGoals(prev => {
      const goal = prev.find(g => g.id === goalId);
      if (!goal || goal.target === target) return prev;
      return prev.map(g => (g.id === goalId ? { ...g, target } : g));
    });
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal =>
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getActiveGoals = () => goals.filter(goal => goal.isActive && !goal.completedAt);
  const getCompletedGoals = () => goals.filter(goal => goal.completedAt);

  return {
    hydrated,
    goals,
    createCustomGoal,
    updateGoalProgress,
    setGoalTarget,
    toggleGoal,
    deleteGoal,
    getActiveGoals,
    getCompletedGoals
  };
}
