import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { AppIcon } from '@/lib/iconMap';
import { usePuffData } from '@/hooks/usePuffData';
import { AchievementStack } from '@/components/AchievementStack';
import { PageSkeleton } from '@/components/PageSkeleton';

export default function Gamification() {
  const { hydrated, achievements, getUnlockedAchievements, getPendingAchievements } = usePuffData();

  if (!hydrated) return <PageSkeleton />;

  const unlocked = getUnlockedAchievements();
  const pending = getPendingAchievements();

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Achievements</h1>
          <p className="text-muted-foreground">{unlocked.length} of {achievements.length} unlocked</p>
        </div>

        {unlocked.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-secondary" />
              Unlocked
            </h3>
            <div className="space-y-3">
              {unlocked.map(a => (
                <Card key={a.id} className="p-4 shadow-sm border border-border bg-secondary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-sm shrink-0">
                      <AppIcon name={a.icon} size={22} className="text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{a.title}</h4>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlocked {a.unlockedAt!.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <AchievementStack
          achievements={pending}
          title="In Progress"
          emptyMessage="All achievements unlocked! You're a champion!"
        />
      </div>
    </div>
  );
}
