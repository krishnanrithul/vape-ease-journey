import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Crown, Zap, Trophy } from 'lucide-react';
import { useAdvancedGamification } from '@/hooks/useAdvancedGamification';
import { usePuffData } from '@/hooks/usePuffData';
import { BadgeShowcase } from '@/components/BadgeShowcase';
import { ProgressTree } from '@/components/ProgressTree';

export default function Gamification() {
  const { 
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
  } = useAdvancedGamification();
  
  const { puffs, streakData, getTodaysPuffs, achievements } = usePuffData();

  // Update gamification progress based on app usage
  useEffect(() => {
    const totalSessions = puffs.length;
    const consecutiveDays = streakData.current;
    const todaysPuffs = getTodaysPuffs();
    
    // Update badge progress
    updateBadgeProgress('first-track', totalSessions > 0 ? 1 : 0);
    updateBadgeProgress('week-warrior', consecutiveDays);
    updateBadgeProgress('mindful-master', consecutiveDays);
    updateBadgeProgress('streak-legend', consecutiveDays);
    updateBadgeProgress('goal-crusher', achievements.filter(a => a.type === 'goal').length);
    
    // Count early morning sessions (before 9 AM)
    const earlyMorningSessions = puffs.filter(puff => puff.timestamp.getHours() < 9).length;
    updateBadgeProgress('early-bird', earlyMorningSessions);
    
    // Update streak multipliers
    updateStreakMultipliers(consecutiveDays);
    
    // Update progress tree based on various metrics
    const trackingDays = new Set(puffs.map(p => p.timestamp.toDateString())).size;
    
    // Foundation level - basic tracking
    if (trackingDays >= 1) {
      updateProgressTree('awareness-foundation', Math.min((trackingDays / 7) * 100, 100));
    }
    
    // Observer level - consistent tracking
    if (trackingDays >= 7) {
      updateProgressTree('mindful-observer', Math.min((consecutiveDays / 14) * 100, 100));
    }
    
    // Detective level - pattern recognition
    if (consecutiveDays >= 14) {
      updateProgressTree('pattern-detective', Math.min((trackingDays / 30) * 100, 100));
    }
    
    // Architect level - reduction mastery
    if (trackingDays >= 30) {
      const reductionProgress = achievements.filter(a => a.type === 'goal').length * 25;
      updateProgressTree('reduction-architect', Math.min(reductionProgress, 100));
    }
    
    // Master level - sustained practice
    if (consecutiveDays >= 60) {
      updateProgressTree('mindful-master', Math.min((consecutiveDays / 90) * 100, 100));
    }
  }, [puffs, streakData, achievements]);

  const unlockedBadges = getUnlockedBadges();
  const pendingBadges = getPendingBadges();
  const completedNodes = getCompletedNodes();
  const availableNodes = getAvailableNodes();
  const activeMultiplier = getActiveMultiplier();
  const currentMultiplier = calculateTotalMultiplier();

  return (
    <div className="min-h-screen bg-gradient-calm pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Gamification</h1>
          <p className="text-muted-foreground">Unlock achievements and track your progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 shadow-elevated border-0 bg-gradient-primary/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Star className="text-white" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient">{totalPoints}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-elevated border-0 bg-gradient-accent/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                <Trophy className="text-white" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient">{unlockedBadges.length}</div>
                <div className="text-xs text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Multiplier */}
        {activeMultiplier && (
          <Card className="p-4 mb-6 shadow-elevated border-0 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center shadow-soft animate-pulse">
                <span className="text-2xl">{activeMultiplier.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{activeMultiplier.name} Active!</h3>
                <p className="text-sm text-muted-foreground">
                  {activeMultiplier.description} • {activeMultiplier.minStreak}+ day streak
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{currentMultiplier}x</div>
                <div className="text-xs text-muted-foreground">XP Multiplier</div>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="progress">Progress Tree</TabsTrigger>
            <TabsTrigger value="multipliers">Multipliers</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="space-y-6">
            <BadgeShowcase 
              badges={unlockedBadges}
              title="Unlocked Badges"
              emptyMessage="No badges unlocked yet. Start tracking to earn your first badge!"
            />
            
            <BadgeShowcase 
              badges={pendingBadges}
              title="Available Badges"
              emptyMessage="All badges unlocked! You're a champion!"
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressTree nodes={progressTree} />
            
            {/* Progress Summary */}
            <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Crown className="mr-2 text-yellow-500" size={20} />
                Your Journey Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-muted/20">
                  <div className="text-2xl font-bold text-gradient">{completedNodes.length}</div>
                  <div className="text-xs text-muted-foreground">Levels Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20">
                  <div className="text-2xl font-bold text-gradient">{availableNodes.length}</div>
                  <div className="text-xs text-muted-foreground">Levels Available</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-primary/10 rounded-xl">
                <p className="text-sm text-center text-muted-foreground">
                  {completedNodes.length === 0 
                    ? "Begin your mindful tracking journey to unlock your first level!"
                    : completedNodes.length === progressTree.length
                    ? "🎉 Congratulations! You've mastered all levels!"
                    : `Keep going! ${progressTree.length - completedNodes.length} more levels to master.`
                  }
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="multipliers" className="space-y-4">
            <div className="space-y-3">
              {streakMultipliers.map(multiplier => (
                <Card 
                  key={multiplier.id} 
                  className={`p-4 shadow-elevated border-0 backdrop-blur-sm transition-all duration-300 ${
                    multiplier.isActive 
                      ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-yellow-200/50 shadow-lg' 
                      : 'bg-card/80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      multiplier.isActive 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-soft animate-pulse' 
                        : 'bg-gradient-primary'
                    }`}>
                      <span className="text-2xl">{multiplier.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">{multiplier.name}</h4>
                        {multiplier.isActive && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{multiplier.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requires {multiplier.minStreak}+ day streak
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        multiplier.isActive ? 'text-orange-600' : 'text-muted-foreground'
                      }`}>
                        {multiplier.multiplier}x
                      </div>
                    </div>
                  </div>
                  
                  {!multiplier.isActive && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{Math.min(streakData.current, multiplier.minStreak)} / {multiplier.minStreak}</span>
                      </div>
                      <Progress 
                        value={Math.min((streakData.current / multiplier.minStreak) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            {/* Multiplier Explanation */}
            <Card className="p-4 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
              <h3 className="font-semibold text-foreground mb-2 flex items-center">
                <Zap className="mr-2 text-yellow-500" size={16} />
                How Multipliers Work
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Streak multipliers boost your XP gains automatically</p>
                <p>• Maintain your tracking streak to unlock higher multipliers</p>
                <p>• Only the highest available multiplier is active at a time</p>
                <p>• Multipliers apply to all XP rewards from goals and milestones</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}