/**
 * Streak → XP multiplier tiers. Pure so both the gamification display and the
 * XP-awarding code in useAdvancedGoals use the exact same numbers.
 */
export interface MultiplierTier {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  minStreak: number;
  icon: string;
}

export const MULTIPLIER_TIERS: MultiplierTier[] = [
  { id: 'bronze-streak', name: 'Bronze Dedication', multiplier: 1.2, description: '+20% XP bonus', minStreak: 3, icon: '🥉' },
  { id: 'silver-streak', name: 'Silver Consistency', multiplier: 1.5, description: '+50% XP bonus', minStreak: 7, icon: '🥈' },
  { id: 'gold-streak', name: 'Gold Mastery', multiplier: 2.0, description: '2x XP bonus', minStreak: 14, icon: '🥇' },
  { id: 'diamond-streak', name: 'Diamond Legend', multiplier: 3.0, description: '3x XP bonus', minStreak: 30, icon: '💎' },
];

/** Highest tier unlocked by the given streak, or null below bronze. */
export function tierForStreak(streak: number): MultiplierTier | null {
  let best: MultiplierTier | null = null;
  for (const tier of MULTIPLIER_TIERS) {
    if (streak >= tier.minStreak) best = tier;
  }
  return best;
}

export function multiplierForStreak(streak: number): number {
  return tierForStreak(streak)?.multiplier ?? 1;
}

/** Apply the streak multiplier to a base XP amount, rounded to whole points. */
export function applyMultiplier(basePoints: number, streak: number): number {
  return Math.round(basePoints * multiplierForStreak(streak));
}
