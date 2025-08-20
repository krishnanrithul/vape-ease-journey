import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePuffData } from '@/hooks/usePuffData';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AchievementCard } from '@/components/AchievementCard';
import { StreakCard } from '@/components/StreakCard';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-illustration.jpg';
import emptyStateTracking from '@/assets/empty-state-tracking.jpg';

export default function Home() {
  const navigate = useNavigate();
  const { addPuff, getTodaysPuffs, dailyGoal, achievements, streakData, getStreakIcon, getStreakMessage, puffs } = usePuffData();
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
  const [quickCount, setQuickCount] = useState(1);
  
  const todaysPuffs = getTodaysPuffs();
  const progressPercent = Math.min((todaysPuffs / dailyGoal) * 100, 100);
  const hasAnyData = puffs.length > 0;

  // Show onboarding for first-time users
  if (hasSeenOnboarding === false) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  // Show loading state while checking onboarding status
  if (hasSeenOnboarding === null) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handlePuffLog = () => {
    addPuff(quickCount);
    toast.success(`${quickCount} puff${quickCount > 1 ? 's' : ''} logged`);
    // Navigate to tag screen for optional tagging
    navigate('/tag', { state: { count: quickCount } });
    setQuickCount(1);
  };

  // Show empty state for first-time users with no data
  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-gradient-calm pb-32 font-inter">
        <div className="px-6 pt-6 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Welcome to VapeWise</h1>
            <p className="text-muted-foreground font-medium">Start your mindful tracking journey</p>
          </div>

          <EmptyState
            image={emptyStateTracking}
            title="Ready to Begin?"
            description="Log your first session to start building awareness of your vaping patterns. Every journey starts with a single step."
            actionText="Log First Puff"
            onAction={handlePuffLog}
          />

          <div className="mt-6 p-4 bg-muted/30 rounded-xl">
            <h3 className="font-semibold mb-2 text-sm">Why Track?</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Build awareness of your habits</p>
              <p>• Identify patterns and triggers</p>
              <p>• Make gradual, sustainable changes</p>
              <p>• Celebrate your progress</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm pb-32 font-inter">
      {/* Hero Section */}
      <div className="px-6 pt-6 pb-8">
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

        {/* Streak & Achievement Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <StreakCard 
            streakData={streakData}
            getStreakIcon={getStreakIcon}
            getStreakMessage={getStreakMessage}
          />
          <AchievementCard achievements={achievements} />
        </div>
      </div>
    </div>
  );
}