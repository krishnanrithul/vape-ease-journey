import { useState, useEffect, useRef } from 'react';
import { MULTIPLIER_TIERS, applyMultiplier, tierForStreak } from '@/lib/streakMultipliers';
import { safeParse, safeParseInt } from '@/lib/safeStorage';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'tracking' | 'reduction' | 'consistency' | 'milestone' | 'special';
  criteria: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface StreakMultiplier {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  minStreak: number;
  icon: string;
  isActive: boolean;
}

export interface ProgressNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  prerequisites: string[];
  rewards: string[];
  progressPercent: number;
}

export function useAdvancedGamification() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streakMultipliers, setStreakMultipliers] = useState<StreakMultiplier[]>([]);
  const [progressTree, setProgressTree] = useState<ProgressNode[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const streakRef = useRef(0);

  useEffect(() => {
    // Initialize badges
    const defaultBadges: Badge[] = [
      {
        id: 'first-track',
        title: 'First Step',
        description: 'Begin your mindful journey',
        icon: 'sprout',
        rarity: 'common',
        category: 'tracking',
        criteria: 'Log your first session',
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Track for 7 consecutive days',
        icon: 'calendar-check',
        rarity: 'rare',
        category: 'consistency',
        criteria: 'Maintain 7-day tracking streak',
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'reduction-champion',
        title: 'Reduction Champion',
        description: 'Achieve 50% reduction from baseline',
        icon: 'trophy',
        rarity: 'epic',
        category: 'reduction',
        criteria: 'Reduce usage by 50%',
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'mindful-master',
        title: 'Mindful Master',
        description: 'Complete 30 days of conscious tracking',
        icon: 'flower',
        rarity: 'legendary',
        category: 'milestone',
        criteria: 'Track mindfully for 30 days',
        progress: 0,
        maxProgress: 30
      },
      {
        id: 'goal-crusher',
        title: 'Goal Crusher',
        description: 'Meet your daily goal 10 times',
        icon: 'dumbbell',
        rarity: 'rare',
        category: 'milestone',
        criteria: 'Achieve daily goals 10 times',
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'insight-seeker',
        title: 'Insight Seeker',
        description: 'View insights 20 times',
        icon: 'search',
        rarity: 'common',
        category: 'tracking',
        criteria: 'Check insights regularly',
        progress: 0,
        maxProgress: 20
      },
      {
        id: 'streak-legend',
        title: 'Streak Legend',
        description: 'Maintain a 30-day streak',
        icon: 'flame',
        rarity: 'legendary',
        category: 'consistency',
        criteria: 'Achieve 30-day tracking streak',
        progress: 0,
        maxProgress: 30
      },
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Log sessions before 9 AM ten times',
        icon: 'bird',
        rarity: 'rare',
        category: 'special',
        criteria: 'Track early morning sessions',
        progress: 0,
        maxProgress: 10
      }
    ];

    const defaultMultipliers: StreakMultiplier[] = MULTIPLIER_TIERS.map(t => ({ ...t, isActive: false }));

    // Initialize progress tree
    const defaultProgressTree: ProgressNode[] = [
      {
        id: 'awareness-foundation',
        title: 'Awareness Foundation',
        description: 'Build basic tracking habits',
        icon: 'sprout',
        level: 1,
        isUnlocked: true,
        isCompleted: false,
        prerequisites: [],
        rewards: ['First tracking badge', '50 XP'],
        progressPercent: 0
      },
      {
        id: 'mindful-observer',
        title: 'Mindful Observer',
        description: 'Develop consistent tracking patterns',
        icon: 'eye',
        level: 2,
        isUnlocked: false,
        isCompleted: false,
        prerequisites: ['awareness-foundation'],
        rewards: ['Observer badge', '100 XP', 'New goal types'],
        progressPercent: 0
      },
      {
        id: 'pattern-detective',
        title: 'Pattern Detective',
        description: 'Identify usage patterns and triggers',
        icon: 'search',
        level: 3,
        isUnlocked: false,
        isCompleted: false,
        prerequisites: ['mindful-observer'],
        rewards: ['Detective badge', '150 XP', 'Advanced insights'],
        progressPercent: 0
      },
      {
        id: 'reduction-architect',
        title: 'Reduction Architect',
        description: 'Master gradual reduction techniques',
        icon: 'hammer',
        level: 4,
        isUnlocked: false,
        isCompleted: false,
        prerequisites: ['pattern-detective'],
        rewards: ['Architect badge', '200 XP', 'Custom goal builder'],
        progressPercent: 0
      },
      {
        id: 'mindful-master',
        title: 'Mindful Master',
        description: 'Achieve mastery through sustained practice',
        icon: 'bloom',
        level: 5,
        isUnlocked: false,
        isCompleted: false,
        prerequisites: ['reduction-architect'],
        rewards: ['Master badge', '500 XP', 'Mentor features'],
        progressPercent: 0
      }
    ];

    // Load from localStorage or use defaults
    type StoredBadge = Omit<Badge, 'unlockedAt'> & { unlockedAt?: string };
    const storedBadges = safeParse<StoredBadge[] | null>('gamification-badges', null);
    if (storedBadges) {
      setBadges(storedBadges.map(b => ({
        ...b,
        unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : undefined
      })));
    } else {
      setBadges(defaultBadges);
    }

    const storedMultipliers = safeParse<StreakMultiplier[] | null>('streak-multipliers', null);
    setStreakMultipliers(storedMultipliers ?? defaultMultipliers);

    const storedProgressTree = safeParse<ProgressNode[] | null>('progress-tree', null);
    setProgressTree(storedProgressTree ?? defaultProgressTree);

    setTotalPoints(safeParseInt('total-gamification-points', 0));
    setHydrated(true);
  }, []);

  // Never write before hydration — otherwise the initial empty state clobbers storage.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('gamification-badges', JSON.stringify(badges));
  }, [badges, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('streak-multipliers', JSON.stringify(streakMultipliers));
  }, [streakMultipliers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('progress-tree', JSON.stringify(progressTree));
  }, [progressTree, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('total-gamification-points', totalPoints.toString());
  }, [totalPoints, hydrated]);

  const updateBadgeProgress = (badgeId: string, progress: number) => {
    setBadges(prev => prev.map(badge => {
      if (badge.id === badgeId && !badge.unlockedAt) {
        const newProgress = Math.min(progress, badge.maxProgress);
        const updatedBadge = { ...badge, progress: newProgress };
        
        if (newProgress >= badge.maxProgress) {
          updatedBadge.unlockedAt = new Date();
          
          // Award points based on rarity
          const base = badge.rarity === 'legendary' ? 500 :
                        badge.rarity === 'epic' ? 300 :
                        badge.rarity === 'rare' ? 150 : 50;
          const points = applyMultiplier(base, streakRef.current);
          
          setTotalPoints(prev => prev + points);
          
          // Show notification
          import('sonner').then(({ toast }) => {
            toast.success(`Badge Unlocked: ${badge.title}!`, {
              description: `You earned ${points} points! ${badge.description}`,
              duration: 5000
            });
          });
        }
        
        return updatedBadge;
      }
      return badge;
    }));
  };

  const updateStreakMultipliers = (currentStreak: number) => {
    streakRef.current = currentStreak;
    setStreakMultipliers(prev => {
      const next = prev.map(multiplier => ({
        ...multiplier,
        isActive: currentStreak >= multiplier.minStreak
      }));
      return next.every((m, i) => m.isActive === prev[i]?.isActive) ? prev : next;
    });
  };

  const getActiveMultiplier = () => {
    const tier = tierForStreak(streakRef.current);
    return tier ? streakMultipliers.find(m => m.id === tier.id) ?? { ...tier, isActive: true } : null;
  };

  const updateProgressTree = (nodeId: string, progressPercent: number) => {
    setProgressTree(prev => prev.map(node => {
      if (node.id === nodeId) {
        const updatedNode = { ...node, progressPercent };
        
        if (progressPercent >= 100 && !node.isCompleted) {
          updatedNode.isCompleted = true;
          
          // Unlock dependent nodes
          setProgressTree(current => current.map(n => {
            if (n.prerequisites.includes(nodeId)) {
              return { ...n, isUnlocked: true };
            }
            return n;
          }));
          
          // Show completion notification
          import('sonner').then(({ toast }) => {
            toast.success(`Progress Milestone: ${node.title}!`, {
              description: `Unlocked: ${node.rewards.join(', ')}`,
              duration: 4000
            });
          });
        }
        
        return updatedNode;
      }
      return node;
    }));
  };

  const getUnlockedBadges = () => badges.filter(b => b.unlockedAt);
  const getPendingBadges = () => badges.filter(b => !b.unlockedAt);
  const getCompletedNodes = () => progressTree.filter(n => n.isCompleted);
  const getAvailableNodes = () => progressTree.filter(n => n.isUnlocked && !n.isCompleted);

  const calculateTotalMultiplier = () => {
    const activeMultiplier = getActiveMultiplier();
    return activeMultiplier ? activeMultiplier.multiplier : 1;
  };

  return {
    hydrated,
    badges,
    streakMultipliers,
    progressTree,
    totalPoints,
    updateBadgeProgress,
    updateStreakMultipliers,
    updateProgressTree,
    getUnlockedBadges,
    getPendingBadges,
    getCompletedNodes,
    getAvailableNodes,
    getActiveMultiplier,
    calculateTotalMultiplier
  };
}