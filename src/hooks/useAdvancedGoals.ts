import { useState, useEffect } from 'react';

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
  reward?: string;
  isActive: boolean;
  completedAt?: Date;
  icon: string;
}

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

export function useAdvancedGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);

  useEffect(() => {
    const storedGoals = localStorage.getItem('advanced-goals');
    if (storedGoals) {
      const data = JSON.parse(storedGoals);
      setGoals(data.map((g: any) => ({
        ...g,
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
          isActive: true,
          icon: '📈'
        }
      ];
      setGoals(defaultGoals);
    }

    const storedMilestones = localStorage.getItem('milestones');
    if (storedMilestones) {
      const data = JSON.parse(storedMilestones);
      setMilestones(data.map((m: any) => ({
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

    const storedUserData = localStorage.getItem('user-progress');
    if (storedUserData) {
      const data = JSON.parse(storedUserData);
      setUserLevel(data.level || 1);
      setExperiencePoints(data.experiencePoints || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('advanced-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('user-progress', JSON.stringify({
      level: userLevel,
      experiencePoints
    }));
  }, [userLevel, experiencePoints]);

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
      isActive: true,
      icon: goalData.icon || '⭐',
      ...goalData
    };
    
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, current: progress };
        
        // Check if goal is completed
        if (progress >= goal.target && !goal.completedAt) {
          updatedGoal.completedAt = new Date();
          
          // Award experience points based on difficulty
          const points = goal.difficulty === 'hard' ? 150 : goal.difficulty === 'medium' ? 100 : 50;
          setExperiencePoints(prev => {
            const newTotal = prev + points;
            const newLevel = Math.floor(newTotal / 500) + 1;
            if (newLevel > userLevel) {
              setUserLevel(newLevel);
              // Show level up notification
              import('sonner').then(({ toast }) => {
                toast.success(`Level Up! You're now level ${newLevel}!`, {
                  description: 'Your dedication is paying off!',
                  duration: 5000
                });
              });
            }
            return newTotal;
          });
          
          // Show completion notification
          import('sonner').then(({ toast }) => {
            toast.success(`Goal Completed: ${goal.title}!`, {
              description: `You earned ${points} XP!`,
              duration: 4000
            });
          });
        }
        
        return updatedGoal;
      }
      return goal;
    }));
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
        
        setExperiencePoints(prev => prev + milestone.rewardPoints);
        
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