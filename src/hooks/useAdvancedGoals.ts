import { useState, useEffect, useRef } from 'react';
import { applyMultiplier } from '@/lib/streakMultipliers';
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

export interface Milestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  type: 'consecutive_days' | 'total_reduction' | 'weekly_average' | 'custom';
  celebrationMessage: string;
  icon: string;
  rewardPoints: number;
  completedAt?: Date;
}

/**
 * @param currentStreak Used to apply the streak XP multiplier when goals and
 * milestones award points. Pass `streakData.current` from usePuffData.
 */
export function useAdvancedGoals(currentStreak = 0) {
  const streakRef = useRef(currentStreak);
  streakRef.current = currentStreak;
  const [hydrated, setHydrated] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);

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
          icon: '🎯'
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
          icon: '📈'
        }
      ];
      setGoals(defaultGoals);
    }

    type StoredMilestone = Omit<Milestone, 'completedAt'> & { completedAt?: string };
    const storedMilestones = safeParse<StoredMilestone[] | null>('milestones', null);
    if (storedMilestones) {
      setMilestones(storedMilestones.map(m => ({
        ...m,
        completedAt: m.completedAt ? new Date(m.completedAt) : undefined
      })));
    } else {
      // Initialize with default milestones
      const defaultMilestones = [
        {
          id: 'first-week',
          title: 'First Week Champion',
          description: 'Complete your first week of tracking',
          threshold: 7,
          type: 'consecutive_days' as const,
          celebrationMessage: 'Amazing! You\'ve built the foundation of mindful awareness!',
          icon: '🏆',
          rewardPoints: 100
        },
        {
          id: 'reduction-hero',
          title: 'Reduction Hero',
          description: 'Achieve 25% reduction from your baseline',
          threshold: 25,
          type: 'total_reduction' as const,
          celebrationMessage: 'Incredible progress! You\'re mastering mindful consumption!',
          icon: '🌟',
          rewardPoints: 250
        },
        {
          id: 'consistency-master',
          title: 'Consistency Master',
          description: 'Maintain tracking for 30 consecutive days',
          threshold: 30,
          type: 'consecutive_days' as const,
          celebrationMessage: 'Outstanding dedication! You\'ve created a powerful habit!',
          icon: '👑',
          rewardPoints: 500
        }
      ];
      setMilestones(defaultMilestones);
    }

    const storedUserData = safeParse<{ level?: number; experiencePoints?: number } | null>(
      'user-progress',
      null
    );
    if (storedUserData) {
      setUserLevel(storedUserData.level || 1);
      setExperiencePoints(storedUserData.experiencePoints || 0);
    }
    setHydrated(true);
  }, []);

  // Never write before hydration — otherwise the initial empty state clobbers storage.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('advanced-goals', JSON.stringify(goals));
  }, [goals, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('milestones', JSON.stringify(milestones));
  }, [milestones, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('user-progress', JSON.stringify({
      level: userLevel,
      experiencePoints
    }));
  }, [userLevel, experiencePoints, hydrated]);

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
      icon: goalData.icon || '⭐',
      ...goalData
    };
    
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const awardXp = (difficulty: Goal['difficulty']) => {
    const base = difficulty === 'hard' ? 150 : difficulty === 'medium' ? 100 : 50;
    const points = applyMultiplier(base, streakRef.current);
    setExperiencePoints(prev => {
      const newTotal = prev + points;
      const newLevel = Math.floor(newTotal / 500) + 1;
      if (newLevel > userLevel) {
        setUserLevel(newLevel);
        import('sonner').then(({ toast }) => {
          toast.success(`Level Up! You're now level ${newLevel}!`, {
            description: 'Your dedication is paying off!',
            duration: 5000
          });
        });
      }
      return newTotal;
    });
    return points;
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
            const points = awardXp(g.difficulty);
            import('sonner').then(({ toast }) => {
              toast.success(
                `You stayed under your ${g.period === 'day' ? 'daily' : 'weekly'} limit!`,
                { description: `You earned ${points} XP!`, duration: 4000 }
              );
            });
          }
        }

        // One-off "reach the target" goals complete as soon as they hit it.
        if (g.direction === 'increase' && !g.completedAt && progress >= g.target) {
          next.completedAt = new Date();
          const points = awardXp(g.difficulty);
          import('sonner').then(({ toast }) => {
            toast.success(`Goal Completed: ${g.title}!`, {
              description: `You earned ${points} XP!`,
              duration: 4000
            });
          });
        }

        return next;
      });
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

  const checkMilestones = (consecutiveDays: number, reductionPercent: number) => {
    milestones.forEach(milestone => {
      if (milestone.completedAt) return;
      
      let shouldComplete = false;
      
      switch (milestone.type) {
        case 'consecutive_days':
          shouldComplete = consecutiveDays >= milestone.threshold;
          break;
        case 'total_reduction':
          shouldComplete = reductionPercent >= milestone.threshold;
          break;
      }
      
      if (shouldComplete) {
        setMilestones(prev => prev.map(m => 
          m.id === milestone.id 
            ? { ...m, completedAt: new Date() }
            : m
        ));
        
        setExperiencePoints(prev => prev + applyMultiplier(milestone.rewardPoints, streakRef.current));
        
        // Show milestone celebration
        import('sonner').then(({ toast }) => {
          toast.success(`🎉 Milestone Achieved: ${milestone.title}!`, {
            description: milestone.celebrationMessage,
            duration: 6000
          });
        });
      }
    });
  };

  const getActiveGoals = () => goals.filter(goal => goal.isActive && !goal.completedAt);
  const getCompletedGoals = () => goals.filter(goal => goal.completedAt);
  const getCompletedMilestones = () => milestones.filter(m => m.completedAt);
  const getPendingMilestones = () => milestones.filter(m => !m.completedAt);

  const getProgressToNextLevel = () => {
    const currentLevelXP = (userLevel - 1) * 500;
    const nextLevelXP = userLevel * 500;
    const progress = ((experiencePoints - currentLevelXP) / 500) * 100;
    return Math.min(progress, 100);
  };

  return {
    hydrated,
    goals,
    milestones,
    userLevel,
    experiencePoints,
    createCustomGoal,
    updateGoalProgress,
    toggleGoal,
    deleteGoal,
    checkMilestones,
    getActiveGoals,
    getCompletedGoals,
    getCompletedMilestones,
    getPendingMilestones,
    getProgressToNextLevel
  };
}