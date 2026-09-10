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
      <div className="bg-card p-3 rounded-lg shadow-md border border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: isUnderGoal
                ? 'hsl(var(--secondary))'
                : 'hsl(var(--primary))'
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
                  fill={isUnderGoal ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}