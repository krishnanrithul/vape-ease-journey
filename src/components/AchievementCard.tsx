import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      <Card className="p-6 shadow-sm border border-border bg-card">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <Trophy size={24} className="text-muted-foreground opacity-70" />
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
    <Card className="p-6 shadow-sm border border-border bg-card">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <Trophy size={20} className="mr-2 text-primary" />
        Recent Achievements
      </h3>
      
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {recentAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
              className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border ${
                index === 0 ? 'border-secondary/50 ring-1 ring-secondary/30' : 'border-secondary/20'
              }`}
            >
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} unlocked
        </p>
      </div>
    </Card>
  );
}