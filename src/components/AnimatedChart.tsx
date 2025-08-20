import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface AnimatedChartProps {
  data: Array<{ date: string; puffs: number }>;
  dailyGoal: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const isUnderGoal = data.value <= payload[0].payload.goal;
    
    return (
      <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-floating border border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              background: isUnderGoal 
                ? 'linear-gradient(135deg, hsl(150 60% 50%), hsl(150 70% 60%))' 
                : 'linear-gradient(135deg, hsl(180 65% 45%), hsl(180 75% 65%))'
            }}
          />
          <span className="text-sm font-medium">
            {data.value} puff{data.value !== 1 ? 's' : ''}
          </span>
        </div>
        {isUnderGoal ? (
          <p className="text-xs text-secondary mt-1">✓ Under goal</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">Above goal</p>
        )}
      </div>
    );
  }
  return null;
};

export function AnimatedChart({ data, dailyGoal }: AnimatedChartProps) {
  const dataWithGoal = data.map(d => ({ ...d, goal: dailyGoal }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataWithGoal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            className="text-xs font-medium"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="puffs" 
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
            animationBegin={200}
          >
            {dataWithGoal.map((entry, index) => {
              const isUnderGoal = entry.puffs <= dailyGoal;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isUnderGoal 
                    ? 'url(#successGradient)' 
                    : 'url(#primaryGradient)'
                  }
                />
              );
            })}
          </Bar>
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(180 65% 45%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(180 75% 65%)" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(150 60% 50%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(150 70% 60%)" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}