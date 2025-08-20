import { useState } from 'react';
import { Minus, Plus, Target, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePuffData } from '@/hooks/usePuffData';
import { toast } from 'sonner';

export default function Goals() {
  const { dailyGoal, setDailyGoal, getTodaysPuffs, getWeeklyData } = usePuffData();
  const [newGoal, setNewGoal] = useState(dailyGoal);
  
  const todaysPuffs = getTodaysPuffs();
  const weeklyData = getWeeklyData();
  const weekAvg = Math.round(weeklyData.reduce((sum, day) => sum + day.puffs, 0) / 7);
  const progressPercent = Math.min((todaysPuffs / dailyGoal) * 100, 100);

  const handleSaveGoal = () => {
    setDailyGoal(newGoal);
    toast.success('Daily goal updated!');
  };

  const handleRecommendation = () => {
    const recommended = Math.max(1, Math.floor(weekAvg * 0.9)); // 10% reduction
    setNewGoal(recommended);
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-20">
      <div className="px-6 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Goals</h1>
          <p className="text-muted-foreground">Small reductions lead to lasting change</p>
        </div>

        {/* Current Progress */}
        <Card className="p-6 mb-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            Today's Progress
          </h2>
          
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-primary mb-1">{todaysPuffs}</div>
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

        {/* Goal Setting */}
        <Card className="p-6 mb-6 shadow-card">
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

        {/* Motivation Section */}
        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Why Reduce Gradually?</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Small changes are more sustainable than dramatic cuts
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Your brain adapts better to gradual reductions
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
              <p className="text-muted-foreground">
                Tracking awareness naturally reduces usage over time
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}