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
    <div className="min-h-screen bg-gradient-calm pb-32 font-inter">
      {/* Hero Section */}
      <div className="px-6 pt-12 pb-8">
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-elevated">
          <img 
            src={heroImage} 
            alt="Mindful tracking" 
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground font-medium">Track mindfully, reduce gradually</p>
          </div>
        </div>

        {/* Today's Progress */}
        <Card className="p-8 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h2 className="text-5xl font-bold text-gradient mb-2 tracking-tighter">{todaysPuffs}</h2>
            <p className="text-muted-foreground font-medium tracking-wide">puffs today</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Daily goal</span>
              <span className="text-foreground">{todaysPuffs}/{dailyGoal}</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="h-3 shadow-soft"
            />
            {progressPercent < 100 ? (
              <p className="text-sm text-center text-muted-foreground font-medium">
                {dailyGoal - todaysPuffs} remaining today
              </p>
            ) : (
              <p className="text-sm text-center text-accent font-semibold">
                🎉 Goal reached! Consider setting a lower target tomorrow
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Log Section */}
      <div className="px-6 space-y-6">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Quick Log</h3>
        
        {/* Puff Counter */}
        <Card className="p-6 shadow-elevated border-0 bg-card/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="text-muted-foreground font-medium">Number of puffs</span>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuickCount(Math.max(1, quickCount - 1))}
                className="h-10 w-10 shadow-soft"
              >
                <Minus size={18} />
              </Button>
              <span className="text-2xl font-bold w-12 text-center tracking-tight">{quickCount}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuickCount(quickCount + 1)}
                className="h-10 w-10 shadow-soft"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
          
          {/* Log Button */}
          <Button 
            variant="puff"
            onClick={handlePuffLog}
            className="w-full h-14 text-lg font-semibold shadow-large hover:shadow-glow"
          >
            Log {quickCount} Puff{quickCount > 1 ? 's' : ''}
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="calm"
            onClick={() => navigate('/insights')}
            className="h-20 flex-col shadow-medium hover:shadow-elevated"
          >
            <TrendingUp size={24} className="mb-2" />
            <span className="text-sm font-semibold">View Insights</span>
          </Button>
          <Button 
            variant="calm"
            onClick={() => navigate('/delay')}
            className="h-20 flex-col shadow-medium hover:shadow-elevated"
          >
            <Clock size={24} className="mb-2" />
            <span className="text-sm font-semibold">Delay Craving</span>
          </Button>
        </div>
      </div>
    </div>
  );
}