import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { AppIcon } from '@/lib/iconMap';

interface StreakCardProps {
  streakData: {
    current: number;
    longest: number;
    lastActiveDate?: string;
  };
  getStreakIcon: () => string;
  getStreakMessage: () => string;
}

export function StreakCard({ streakData, getStreakIcon, getStreakMessage }: StreakCardProps) {
  const progressToNext = Math.min((streakData.current % 7) / 7 * 100, 100);

  // Special empty state for new users
  if (streakData.current === 0 && streakData.longest === 0) {
    return (
      <Card className="p-6 shadow-sm border border-border bg-muted/30">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center shadow-sm mb-4">
            <AppIcon name="seed" size={36} className="text-muted-foreground opacity-70" />
          </div>

          <h3 className="font-bold text-lg text-primary mb-2">
            Plant Your Seed
          </h3>

          <p className="text-sm text-muted-foreground mb-4 font-medium">
            Start tracking to grow your mindfulness habit!
          </p>

          <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
            Track for consecutive days to watch your habit grow from a tiny seed into a beautiful flowering plant
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm border border-border bg-muted/30">
      <div className="text-center">
        <div className="relative mb-4">
          {/* Growth Visual */}
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center shadow-sm">
            <AppIcon name={getStreakIcon()} size={36} className="text-primary animate-bounce" />
          </div>
          
          {/* Streak Counter */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <AnimatedNumber
              value={streakData.current}
              className="num text-sm font-bold text-primary-foreground"
              springOptions={{ bounce: 0, duration: 500 }}
            />
          </div>
        </div>

        <h3 className="font-bold text-lg text-primary mb-2 flex items-center justify-center gap-1">
          <AnimatedNumber value={streakData.current} springOptions={{ bounce: 0, duration: 500 }} />
          <span>Day Streak</span>
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 font-medium">
          {getStreakMessage()}
        </p>

        {/* Progress to next milestone */}
        {streakData.current > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-secondary rounded-full"
                initial={false}
                animate={{ width: `${progressToNext}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {7 - (streakData.current % 7)} days to next growth stage
            </p>
          </div>
        )}

        {/* Best Streak */}
        {streakData.longest > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-center items-center gap-2">
              <Trophy size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Best: {streakData.longest} days
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}