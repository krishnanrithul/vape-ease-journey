import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { Badge as BadgeType } from '@/hooks/useAdvancedGamification';
import { AppIcon } from '@/lib/iconMap';

interface BadgeShowcaseProps {
  badges: BadgeType[];
  title: string;
  emptyMessage?: string;
}

export function BadgeShowcase({ badges, title, emptyMessage }: BadgeShowcaseProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-700 border-gray-300';
      case 'rare': return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-500/20 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  if (badges.length === 0 && emptyMessage) {
    return (
      <Card className="p-6 shadow-sm border border-border bg-card">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <Trophy size={24} className="text-muted-foreground opacity-70" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm border border-border bg-card">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <Trophy size={20} className="mr-2 text-primary" />
        {title}
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {badges.map((badge) => {
          const isUnlocked = badge.unlockedAt !== undefined;
          const progressPercent = (badge.progress / badge.maxProgress) * 100;
          
          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-lg border transition-colors duration-300 ${
                isUnlocked
                  ? 'bg-card border-border shadow-sm'
                  : 'bg-muted/20 border-muted/30'
              }`}
            >
              {/* Rarity indicator */}
              {isUnlocked && (
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${getRarityColor(badge.rarity)}`}
                  >
                    {badge.rarity}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isUnlocked ? 'bg-primary shadow-sm' : 'bg-muted/40'
                } ${isUnlocked && badge.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                  <AppIcon
                    name={badge.icon}
                    size={22}
                    className={isUnlocked ? 'text-primary-foreground' : 'text-muted-foreground opacity-50'}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.title}
                    </h4>
                  </div>
                  
                  <p className={`text-xs mb-2 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.description}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {badge.criteria}
                  </p>
                  
                  {!isUnlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {badge.progress} / {badge.maxProgress}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}
                  
                  {isUnlocked && badge.unlockedAt && (
                    <div className="text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1 mt-2">
                      Unlocked on {badge.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}