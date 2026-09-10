import { Card } from '@/components/ui/card';
import { usePuffData } from '@/hooks/usePuffData';
import { AnimatedChart } from '@/components/AnimatedChart';
import { EmptyState } from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, Calendar, Target, Trophy, BarChart3, Flame, Sun, CalendarDays } from 'lucide-react';
import { StatsCarousel, StatItem } from '@/components/StatsCarousel';
import emptyStateInsights from '@/assets/empty-state-insights.jpg';

export default function Insights() {
  const navigate = useNavigate();
  const { getWeeklyData, getInsight, getTodaysPuffs, dailyGoal, achievements, getRecentAchievements, puffs, streakData } = usePuffData();
  
  const weeklyData = getWeeklyData();
  const insight = getInsight();
  const todaysPuffs = getTodaysPuffs();
  const weekTotal = weeklyData.reduce((sum, day) => sum + day.puffs, 0);
  const weekAvg = Math.round(weekTotal / 7);
  const recentAchievements = getRecentAchievements();
  const hasAnyData = puffs.length > 0;

  const trackedDays = weeklyData.filter(d => d.puffs > 0);
  const bestDay = trackedDays.length ? trackedDays.reduce((min, d) => (d.puffs < min.puffs ? d : min)) : null;
  const todayTone: StatItem['tone'] =
    todaysPuffs >= dailyGoal ? 'destructive' : todaysPuffs >= dailyGoal * 0.8 ? 'warning' : 'success';

  const stats: StatItem[] = [
    { key: 'today', label: 'Today', value: todaysPuffs, unit: `/ ${dailyGoal}`, icon: Sun, tone: todayTone, hint: todaysPuffs >= dailyGoal ? 'Over limit' : `${dailyGoal - todaysPuffs} remaining` },
    { key: 'avg', label: 'Week avg', value: weekAvg, unit: '/ day', icon: CalendarDays, tone: weekAvg <= dailyGoal ? 'default' : 'warning', hint: weekAvg <= dailyGoal ? 'On track' : 'Above goal' },
    { key: 'best', label: 'Best day', value: bestDay?.puffs ?? 0, unit: 'puffs', icon: Target, tone: 'success', hint: bestDay ? `${bestDay.date} this week` : 'No data yet' },
    { key: 'streak', label: 'Streak', value: streakData.current, unit: streakData.current === 1 ? 'day' : 'days', icon: Flame, tone: 'primary', hint: `Best: ${streakData.longest}` },
  ];

  // Show empty state when no data exists
  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Your Progress</h1>
            <p className="text-muted-foreground">Understanding your patterns helps reduce gradually</p>
          </div>

          <EmptyState
            image={emptyStateInsights}
            title="No Data Yet"
            description="Start tracking your sessions to see beautiful insights about your patterns, progress, and achievements."
            actionText="Go to Home"
            onAction={() => navigate('/')}
          />

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Card className="p-4 shadow-sm border border-border bg-card text-center">
              <BarChart3 className="mx-auto mb-2 text-primary" size={24} />
              <h3 className="font-semibold text-sm mb-1">Weekly Charts</h3>
              <p className="text-xs text-muted-foreground">Visual progress tracking</p>
            </Card>
            <Card className="p-4 shadow-sm border border-border bg-card text-center">
              <Target className="mx-auto mb-2 text-primary" size={24} />
              <h3 className="font-semibold text-sm mb-1">Personal Insights</h3>
              <p className="text-xs text-muted-foreground">Pattern recognition</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Understanding your patterns helps reduce gradually</p>
        </div>

        {/* Key Stats — swipeable */}
        <div className="mb-6">
          <StatsCarousel items={stats} />
        </div>

        {/* Weekly Chart */}
        <Card className="p-6 mb-6 shadow-sm border border-border bg-card">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            Last 7 Days
          </h2>
          <AnimatedChart data={weeklyData} dailyGoal={dailyGoal} />
        </Card>

        {/* Insights Card */}
        <Card className="p-6 mb-6 shadow-sm border border-border bg-muted/30">
          <h2 className="text-lg font-bold mb-3 flex items-center">
            <TrendingDown className="mr-2" size={20} />
            Personal Insight
          </h2>
          <p className="text-muted-foreground font-medium leading-relaxed">{insight}</p>
        </Card>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card className="p-6 mb-6 shadow-sm border border-border bg-secondary/10">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Trophy className="mr-2" size={20} />
              Recent Achievements
            </h2>
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-sm">
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
        <Card className="p-6 shadow-sm border border-border bg-card">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            This Week's Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total puffs</span>
              <span className="font-medium font-mono">{weekTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily average</span>
              <span className="font-medium font-mono">{weekAvg}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal adherence</span>
              <span className={`font-medium ${weekAvg <= dailyGoal ? 'text-success' : 'text-warning'}`}>
                {weekAvg <= dailyGoal ? 'On track' : 'Above goal'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}