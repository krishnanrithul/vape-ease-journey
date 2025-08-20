import { useState, useEffect } from 'react';
import { Minus, Plus, Target, TrendingDown, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePuffData } from '@/hooks/usePuffData';
import { useAdvancedGoals } from '@/hooks/useAdvancedGoals';
import { GoalCard } from '@/components/GoalCard';
import { CreateGoalDialog } from '@/components/CreateGoalDialog';
import { toast } from 'sonner';

export default function Goals() {
  const { dailyGoal, setDailyGoal, getTodaysPuffs, getWeeklyData, streakData } = usePuffData();
  const { 
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
    getPendingMilestones,
    getCompletedMilestones,
    getProgressToNextLevel
  } = useAdvancedGoals();
  
  const [newGoal, setNewGoal] = useState(dailyGoal);
  
  const todaysPuffs = getTodaysPuffs();
  const weeklyData = getWeeklyData();
  const weekAvg = Math.round(weeklyData.reduce((sum, day) => sum + day.puffs, 0) / 7);
  const progressPercent = Math.min((todaysPuffs / dailyGoal) * 100, 100);

  // Update goal progress and check milestones
  useEffect(() => {
    // Update daily goal progress
    const dailyGoalId = goals.find(g => g.id === 'daily-reduction')?.id;
    if (dailyGoalId) {
      updateGoalProgress(dailyGoalId, todaysPuffs);
    }

    // Update weekly goal progress
    const weeklyGoalId = goals.find(g => g.id === 'weekly-reduction')?.id;
    if (weeklyGoalId) {
      const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.puffs, 0);
      updateGoalProgress(weeklyGoalId, weeklyTotal);
    }

    // Check milestones
    const reductionPercent = weekAvg > 0 ? Math.max(0, ((weekAvg - todaysPuffs) / weekAvg) * 100) : 0;
    checkMilestones(streakData.current, reductionPercent);
  }, [todaysPuffs, weeklyData, streakData.current]);

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const pendingMilestones = getPendingMilestones();
  const completedMilestonesList = getCompletedMilestones();

  const handleSaveGoal = () => {
    setDailyGoal(newGoal);
    toast.success('Daily goal updated!');
  };

  const handleRecommendation = () => {
    const recommended = Math.max(1, Math.floor(weekAvg * 0.9)); // 10% reduction
    setNewGoal(recommended);
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Your Goals</h1>
              <p className="text-muted-foreground">Small reductions lead to lasting change</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="text-yellow-500" size={16} />
                <span className="text-sm font-semibold">Level {userLevel}</span>
              </div>
              <div className="text-xs text-muted-foreground">{experiencePoints} XP</div>
              <Progress value={getProgressToNextLevel()} className="w-20 h-1 mt-1" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Goals</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {/* Current Progress Overview */}
            <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Today's Progress
              </h2>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gradient mb-1">{todaysPuffs}</div>
                <div className="text-muted-foreground">of {dailyGoal} puffs</div>
              </div>

              <Progress value={progressPercent} className="h-3 mb-2" />
              
              <div className="text-center">
                {progressPercent < 100 ? (
                  <p className="text-sm text-muted-foreground">
                    {dailyGoal - todaysPuffs} puffs remaining
                  </p>
                ) : progressPercent < 120 ? (
                  <p className="text-sm text-accent font-medium">
                    Goal reached! Well done 🎉
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Over goal by {todaysPuffs - dailyGoal}
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Goal Setting */}
            <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4">Set Daily Goal</h2>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNewGoal(Math.max(1, newGoal - 1))}
                >
                  <Minus size={20} />
                </Button>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient">{newGoal}</div>
                  <div className="text-sm text-muted-foreground">puffs per day</div>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNewGoal(newGoal + 1)}
                >
                  <Plus size={20} />
                </Button>
              </div>

              <Button
                variant="success"
                onClick={handleSaveGoal}
                className="w-full mb-3"
                disabled={newGoal === dailyGoal}
              >
                Update Goal
              </Button>

              {weekAvg > 0 && (
                <Button
                  variant="accent"
                  onClick={handleRecommendation}
                  className="w-full"
                >
                  <TrendingDown className="mr-2" size={16} />
                  Try {Math.max(1, Math.floor(weekAvg * 0.9))} (10% reduction)
                </Button>
              )}
            </Card>

            {/* Create Custom Goal */}
            <div className="flex justify-center">
              <CreateGoalDialog onCreateGoal={createCustomGoal} />
            </div>

            {/* Active Goals List */}
            <div className="space-y-4">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={() => toggleGoal(goal.id)}
                  onDelete={() => deleteGoal(goal.id)}
                />
              ))}
            </div>

            {activeGoals.length === 0 && (
              <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                    <Target size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Active Goals</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first custom goal to start your focused journey
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggle={() => toggleGoal(goal.id)}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))}
            
            {completedGoals.length === 0 && (
              <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                    <Trophy size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Completed Goals Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your completed goals will appear here as you achieve them
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            {/* Completed Milestones */}
            {completedMilestonesList.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">🎉 Achieved Milestones</h3>
                <div className="space-y-3">
                  {completedMilestonesList.map(milestone => (
                    <Card key={milestone.id} className="p-4 shadow-elevated border-0 bg-gradient-success/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-success flex items-center justify-center shadow-soft">
                          <span className="text-2xl">{milestone.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-700">{milestone.title}</h4>
                          <p className="text-sm text-green-600 mb-1">{milestone.description}</p>
                          <p className="text-xs text-green-500">{milestone.celebrationMessage}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            Completed on {milestone.completedAt!.toLocaleDateString()} • +{milestone.rewardPoints} XP
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Milestones */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">🎯 Upcoming Milestones</h3>
              <div className="space-y-3">
                {pendingMilestones.map(milestone => (
                  <Card key={milestone.id} className="p-4 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                        <span className="text-2xl">{milestone.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                        <div className="text-xs text-muted-foreground">
                          Reward: {milestone.rewardPoints} XP
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {pendingMilestones.length === 0 && completedMilestonesList.length === 0 && (
              <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                    <Trophy size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Milestones Loading</h3>
                  <p className="text-sm text-muted-foreground">
                    Your milestone progress will appear here as you track
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}