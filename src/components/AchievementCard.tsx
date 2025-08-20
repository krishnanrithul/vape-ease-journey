import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import achievementBadges from '@/assets/achievement-badges.jpg';

interface AchievementCardProps {
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
    type: 'milestone' | 'streak' | 'goal';
  }>;
}

export function AchievementCard({ achievements }: AchievementCardProps) {
  const recentAchievements = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3);

  if (recentAchievements.length === 0) {
    return (
      <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Start Your Journey</h3>
          <p className="text-sm text-muted-foreground">
            Begin tracking to unlock your first achievement!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <span className="text-2xl mr-2">🏆</span>
        Recent Achievements
      </h3>
      
      <div className="space-y-3">
        {recentAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-success/10 border border-secondary/20"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-success flex items-center justify-center shadow-soft">
              <span className="text-lg">{achievement.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{achievement.title}</h4>
                <Badge 
                  variant="secondary" 
                  className="text-xs capitalize bg-secondary/20 text-secondary-foreground"
                >
                  {achievement.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} unlocked
        </p>
      </div>
    </Card>
  );
}