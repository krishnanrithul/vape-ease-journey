import { Card } from '@/components/ui/card';
import { usePuffData } from '@/hooks/usePuffData';
import { AnimatedChart } from '@/components/AnimatedChart';
import { TrendingDown, Calendar, Target, Trophy } from 'lucide-react';

export default function Insights() {
  const { getWeeklyData, getInsight, getTodaysPuffs, dailyGoal, achievements, getRecentAchievements } = usePuffData();
  
  const weeklyData = getWeeklyData();
  const insight = getInsight();
  const todaysPuffs = getTodaysPuffs();
  const weekTotal = weeklyData.reduce((sum, day) => sum + day.puffs, 0);
  const weekAvg = Math.round(weekTotal / 7);
  const recentAchievements = getRecentAchievements();

  return (
    <div className="min-h-screen bg-gradient-calm pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Understanding your patterns helps reduce gradually</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center shadow-card">
            <div className="text-2xl font-bold text-primary">{todaysPuffs}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </Card>
          <Card className="p-4 text-center shadow-card">
            <div className="text-2xl font-bold text-accent">{weekAvg}</div>
            <div className="text-xs text-muted-foreground">Week Avg</div>
          </Card>
          <Card className="p-4 text-center shadow-card">
            <div className="text-2xl font-bold text-secondary">{dailyGoal}</div>
            <div className="text-xs text-muted-foreground">Goal</div>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="p-6 mb-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            Last 7 Days
          </h2>
          <AnimatedChart data={weeklyData} dailyGoal={dailyGoal} />
        </Card>

        {/* Insights Card */}
        <Card className="p-6 mb-6 shadow-elevated border-0 bg-gradient-to-br from-accent/5 to-primary/5 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-3 flex items-center">
            <TrendingDown className="mr-2" size={20} />
            Personal Insight
          </h2>
          <p className="text-muted-foreground font-medium leading-relaxed">{insight}</p>
        </Card>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card className="p-6 mb-6 shadow-elevated border-0 bg-gradient-success/5 backdrop-blur-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Trophy className="mr-2" size={20} />
              Recent Achievements
            </h2>
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
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progress Summary */}
        <Card className="p-6 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            This Week's Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total puffs</span>
              <span className="font-medium">{weekTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily average</span>
              <span className="font-medium">{weekAvg}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal adherence</span>
              <span className={`font-medium ${weekAvg <= dailyGoal ? 'text-secondary' : 'text-accent'}`}>
                {weekAvg <= dailyGoal ? 'On track' : 'Above goal'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}