import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePuffData } from '@/hooks/usePuffData';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-illustration.jpg';

export default function Home() {
  const navigate = useNavigate();
  const { addPuff, getTodaysPuffs, dailyGoal } = usePuffData();
  const [quickCount, setQuickCount] = useState(1);
  
  const todaysPuffs = getTodaysPuffs();
  const progressPercent = Math.min((todaysPuffs / dailyGoal) * 100, 100);

  const handlePuffLog = () => {
    addPuff(quickCount);
    toast.success(`${quickCount} puff${quickCount > 1 ? 's' : ''} logged`);
    // Navigate to tag screen for optional tagging
    navigate('/tag', { state: { count: quickCount } });
    setQuickCount(1);
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-20">
      {/* Hero Section */}
      <div className="px-6 pt-8 pb-6">
        <div className="relative overflow-hidden rounded-2xl mb-6">
          <img 
            src={heroImage} 
            alt="Mindful tracking" 
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Track mindfully, reduce gradually</p>
          </div>
        </div>

        {/* Today's Progress */}
        <Card className="p-6 shadow-card">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-primary mb-1">{todaysPuffs}</h2>
            <p className="text-muted-foreground">puffs today</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily goal</span>
              <span className="font-medium">{todaysPuffs}/{dailyGoal}</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="h-2"
            />
            {progressPercent < 100 ? (
              <p className="text-xs text-center text-muted-foreground">
                {dailyGoal - todaysPuffs} left for today
              </p>
            ) : (
              <p className="text-xs text-center text-accent font-medium">
                Goal reached! Consider setting a lower target tomorrow
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Log Section */}
      <div className="px-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Log</h3>
        
        {/* Puff Counter */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Number of puffs</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuickCount(Math.max(1, quickCount - 1))}
                className="h-8 w-8"
              >
                <Minus size={16} />
              </Button>
              <span className="text-xl font-bold w-8 text-center">{quickCount}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuickCount(quickCount + 1)}
                className="h-8 w-8"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          {/* Log Button */}
          <Button 
            variant="puff"
            onClick={handlePuffLog}
            className="w-full"
          >
            Log {quickCount} Puff{quickCount > 1 ? 's' : ''}
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="calm"
            onClick={() => navigate('/insights')}
            className="h-16 flex-col"
          >
            <TrendingUp size={20} className="mb-1" />
            <span className="text-sm">View Insights</span>
          </Button>
          <Button 
            variant="calm"
            onClick={() => navigate('/delay')}
            className="h-16 flex-col"
          >
            <Clock size={20} className="mb-1" />
            <span className="text-sm">Delay Craving</span>
          </Button>
        </div>
      </div>
    </div>
  );
}