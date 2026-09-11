import { useState, useEffect, useMemo } from 'react';
import { Minus, Plus, Target, TrendingDown, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePuffData } from '@/hooks/usePuffData';
import { useAdvancedGoals } from '@/hooks/useAdvancedGoals';
import { GoalCard } from '@/components/GoalCard';
import { CreateGoalDialog } from '@/components/CreateGoalDialog';
import { PageSkeleton } from '@/components/PageSkeleton';
import { AppIcon } from '@/lib/iconMap';
import { limitTone, TONE_INDICATOR_CLASS, TONE_TEXT_CLASS } from '@/lib/progressTone';
import { toast } from 'sonner';

/**
 * Built-in goal that just mirrors "Today's Progress" above it (same number,
 * same limit) — shown as its own card in the goals list it's pure duplication,
 * so it's tracked (for XP/streak logic) but not rendered here.
 */
const HIDDEN_BUILTIN_GOAL_IDS = new Set(['daily-reduction']);

export default function Goals() {
  const { dailyGoal, setDailyGoal, getTodaysPuffs, getWeeklyData, streakData, puffs, baseline, hydrated: puffsHydrated } = usePuffData();
  const {
    hydrated,
    goals,
    milestones,
    userLevel,
    experiencePoints,
    createCustomGoal,
    updateGoalProgress,
    setGoalTarget,
    toggleGoal,
    deleteGoal,
    checkMilestones,
    getActiveGoals,
    getCompletedGoals,
    getPendingMilestones,
    getCompletedMilestones,
    getProgressToNextLevel
  } = useAdvancedGoals(streakData.current);
  
  const [newGoal, setNewGoal] = useState(dailyGoal);

  // dailyGoal starts at a hardcoded default and only becomes the real,
  // stored value after usePuffData hydrates — without this, newGoal keeps
  // whatever it captured on that first render and never catches up, so the
  // stepper shows a stale number and "Update Goal" sits enabled, ready to
  // silently overwrite the real goal. Same fix Settings.tsx already uses.
  useEffect(() => setNewGoal(dailyGoal), [dailyGoal]);

  // The built-in "Daily Mindful Limit" goal was created once with a
  // hardcoded target (20) and never updated after that — so if you'd
  // changed your daily goal since, it was quietly scoring "stayed under
  // your limit" XP against the old number. Keep it pinned to the real
  // daily goal instead. (The "Weekly Progress" goal's target isn't a
  // simple function of dailyGoal — its 10%-reduction math needs its own
  // decision — so it's left as-is for now.)
  useEffect(() => {
    setGoalTarget('daily-reduction', dailyGoal);
    // setGoalTarget/updateGoalProgress aren't memoized by useAdvancedGoals
    // (same as the effect below), so they're intentionally left out of the
    // deps — each call closes over the current one and is a no-op when
    // nothing actually changed.
  }, [dailyGoal]);

  const todaysPuffs = getTodaysPuffs();
  // Memoize so the array reference is stable across renders — otherwise the
  // progress-sync effect below fires every render and loops.
  const weeklyData = useMemo(() => getWeeklyData(), [puffs]);
  const weeklyTotal = useMemo(
    () => weeklyData.reduce((sum, day) => sum + day.puffs, 0),
    [weeklyData]
  );
  const trackedDays = weeklyData.filter(d => d.puffs > 0).length;
  const weekAvg = trackedDays > 0 ? Math.round(weeklyTotal / trackedDays) : 0;
  const progressPercent = Math.min((todaysPuffs / dailyGoal) * 100, 100);

  // Sync progress for every active goal (built-in and custom) and check milestones.
  useEffect(() => {
    goals.forEach(goal => {
      if (!goal.isActive || goal.completedAt) return;

      let progress: number;
      if (goal.period === 'day') {
        progress = todaysPuffs;
      } else if (goal.period === 'week') {
        progress = weeklyTotal;
      } else if (goal.category === 'streak') {
        progress = streakData.current;
      } else {
        // month/custom periods have no automatic data source yet — leave as-is.
        progress = goal.current;
      }

      updateGoalProgress(goal.id, progress);
    });

    // Reduction vs. the onboarding baseline (falls back to "today vs week avg" if none was set).
    const reductionPercent = baseline && baseline > 0
      ? (trackedDays >= 3 ? Math.max(0, ((baseline - weekAvg) / baseline) * 100) : 0)
      : (weekAvg > 0 ? Math.max(0, ((weekAvg - todaysPuffs) / weekAvg) * 100) : 0);
    checkMilestones(streakData.current, reductionPercent);
    // updateGoalProgress / checkMilestones are no-ops when nothing changed, so
    // depending on `goals` here is safe (state stays referentially equal).
  }, [todaysPuffs, weeklyTotal, weekAvg, trackedDays, baseline, streakData.current, goals]);

  const activeGoals = getActiveGoals().filter(goal => !HIDDEN_BUILTIN_GOAL_IDS.has(goal.id));
  const completedGoals = getCompletedGoals();
  const todayTone = limitTone(todaysPuffs, dailyGoal);
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

  if (!hydrated || !puffsHydrated) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-background pb-32">
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
            {/* Current Progress Overview — hero stat, so it gets a touch of
                elevation (subtle gradient) instead of a flat bordered box. */}
            <Card className="p-6 shadow-md border border-border bg-gradient-to-b from-elevated to-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Today's Progress
              </h2>

              <div className="text-center mb-4">
                <div className={`text-3xl font-bold mb-1 ${TONE_TEXT_CLASS[todayTone]}`}>{todaysPuffs}</div>
                <div className="text-muted-foreground">of {dailyGoal} puffs</div>
              </div>

              <Progress
                value={progressPercent}
                className="h-3 mb-2"
                indicatorClassName={TONE_INDICATOR_CLASS[todayTone]}
              />

              <div className="text-center">
                {todaysPuffs < dailyGoal ? (
                  <p className="text-sm text-muted-foreground">
                    {dailyGoal - todaysPuffs} puffs remaining
                  </p>
                ) : todaysPuffs === dailyGoal ? (
                  <p className="text-sm text-success font-medium">
                    Right at your limit — nice control
                  </p>
                ) : (
                  <p className="text-sm text-destructive font-medium">
                    Over goal by {todaysPuffs - dailyGoal}
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Goal Setting */}
            <Card className="p-6 shadow-sm border border-border bg-elevated">
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
                  <div className="text-4xl font-bold text-primary">{newGoal}</div>
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
                variant="default"
                onClick={handleSaveGoal}
                className="w-full mb-3"
                disabled={newGoal === dailyGoal}
              >
                Update Goal
              </Button>

              {weekAvg > 0 && (
                <Button
                  variant="outline"
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
              <Card className="p-6 shadow-sm border border-border bg-card">
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
              <Card className="p-6 shadow-sm border border-border bg-card">
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
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Trophy size={18} className="text-secondary" />Achieved Milestones</h3>
                <div className="space-y-3">
                  {completedMilestonesList.map(milestone => (
                    <Card key={milestone.id} className="p-4 shadow-sm border border-border bg-secondary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                          <AppIcon name={milestone.icon} size={22} className="text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-success">{milestone.title}</h4>
                          <p className="text-sm text-success/90 mb-1">{milestone.description}</p>
                          <p className="text-xs text-success/70">{milestone.celebrationMessage}</p>
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
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Target size={18} className="text-primary" />Upcoming Milestones</h3>
              <div className="space-y-3">
                {pendingMilestones.map(milestone => (
                  <Card key={milestone.id} className="p-4 shadow-sm border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <AppIcon name={milestone.icon} size={22} className="text-primary-foreground" />
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
              <Card className="p-6 shadow-sm border border-border bg-card">
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