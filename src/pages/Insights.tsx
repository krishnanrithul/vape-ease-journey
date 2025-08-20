import { Card } from '@/components/ui/card';
import { usePuffData } from '@/hooks/usePuffData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingDown, Calendar, Target } from 'lucide-react';

export default function Insights() {
  const { getWeeklyData, getInsight, getTodaysPuffs, dailyGoal } = usePuffData();
  
  const weeklyData = getWeeklyData();
  const insight = getInsight();
  const todaysPuffs = getTodaysPuffs();
  const weekTotal = weeklyData.reduce((sum, day) => sum + day.puffs, 0);
  const weekAvg = Math.round(weekTotal / 7);

  return (
    <div className="min-h-screen bg-gradient-calm pb-20">
      <div className="px-6 pt-8">
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
        <Card className="p-6 mb-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            Last 7 Days
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis hide />
                <Bar 
                  dataKey="puffs" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Insights Card */}
        <Card className="p-6 mb-6 shadow-card">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <TrendingDown className="mr-2" size={20} />
            Personal Insight
          </h2>
          <p className="text-muted-foreground">{insight}</p>
        </Card>

        {/* Progress Summary */}
        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
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