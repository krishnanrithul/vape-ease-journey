import { Card } from '@/components/ui/card';
import streakGrowth from '@/assets/streak-growth.jpg';

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

  return (
    <Card className="p-6 shadow-elevated border-0 bg-gradient-to-br from-secondary/5 to-accent/5 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative mb-4">
          {/* Growth Visual */}
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center shadow-soft">
            <span className="text-4xl animate-bounce">{getStreakIcon()}</span>
          </div>
          
          {/* Streak Counter */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center shadow-medium">
            <span className="text-sm font-bold text-accent-foreground">{streakData.current}</span>
          </div>
        </div>

        <h3 className="font-bold text-lg text-gradient mb-2">
          {streakData.current} Day Streak
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 font-medium">
          {getStreakMessage()}
        </p>

        {/* Progress to next milestone */}
        {streakData.current > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-success rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressToNext}%` }}
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
              <span className="text-lg">🏆</span>
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