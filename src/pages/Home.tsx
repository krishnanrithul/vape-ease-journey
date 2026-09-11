import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePuffData } from '@/hooks/usePuffData';
import { AchievementCard } from '@/components/AchievementCard';
import { StreakCard } from '@/components/StreakCard';
import { EmptyState } from '@/components/EmptyState';
import { PageSkeleton } from '@/components/PageSkeleton';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { RingGauge } from '@/components/RingGauge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { toast } from 'sonner';
import emptyStateTracking from '@/assets/empty-state-tracking.jpg';

export default function Home() {
  const navigate = useNavigate();
  const { addPuff, removePuff, getTodaysPuffs, dailyGoal, achievements, streakData, getStreakIcon, getStreakMessage, puffs, hydrated } = usePuffData();
  const MAX_QUICK_COUNT = 20;
  const [quickCount, setQuickCount] = useState(1);
  const [logOpen, setLogOpen] = useState(false);
  
  const todaysPuffs = getTodaysPuffs();
  const progressPercent = Math.min((todaysPuffs / dailyGoal) * 100, 100);
  const hasAnyData = puffs.length > 0;

  if (!hydrated) return <PageSkeleton cards={2} />;

  const handlePuffLog = () => {
    const logged = quickCount;
    const id = addPuff(logged);
    toast.success(`${logged} puff${logged > 1 ? 's' : ''} logged`, {
      action: {
        label: 'Undo',
        onClick: () => {
          removePuff(id);
          toast.message('Log removed');
        },
      },
    });
    setQuickCount(1);
    setLogOpen(false);
  };

  // Show empty state for first-time users with no data
  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-background pb-32 font-inter">
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

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
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
    <div className="min-h-screen bg-background pb-32 font-inter">
      {/* Hero Section */}
      <div className="px-6 pt-6 pb-8">
        <div className="mb-8">
          <TextEffect
            as="h1"
            per="char"
            preset="fade-in-blur"
            speedReveal={2.5}
            className="text-3xl font-bold text-foreground mb-1 tracking-tight"
          >
            Welcome back
          </TextEffect>
          <p className="text-muted-foreground font-medium">Track mindfully, reduce gradually</p>
        </div>

        {/* Today's Progress — ring gauge is the focal element, so it gets a
            touch of elevation (gradient + glow) instead of a flat bordered box. */}
        <Card className="relative overflow-hidden p-6 shadow-md border border-border bg-gradient-to-b from-elevated to-card flex flex-col items-center">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col items-center">
          <RingGauge value={todaysPuffs} max={dailyGoal} />
          <p
            className={`mt-4 text-sm font-medium text-center ${
              progressPercent >= 100
                ? 'text-destructive'
                : progressPercent >= 80
                ? 'text-warning'
                : 'text-muted-foreground'
            }`}
          >
            {progressPercent >= 100
              ? 'Over your limit for today — that’s okay, tomorrow is a fresh start'
              : progressPercent >= 80
              ? `${dailyGoal - todaysPuffs} left — you’re close to your limit`
              : `${dailyGoal - todaysPuffs} remaining today`}
          </p>
          </div>
        </Card>
      </div>

      {/* Primary action: opens the log drawer */}
      <div className="px-6 space-y-6">
        <Button
          size="lg"
          onClick={() => setLogOpen(true)}
          className="w-full h-14 text-base font-semibold"
        >
          <Plus size={18} className="mr-2" />
          Log puffs
        </Button>
        <button
          onClick={() => navigate('/history')}
          className="w-full -mt-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View log history →
        </button>

        <Drawer open={logOpen} onOpenChange={setLogOpen}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md px-6 pb-8">
              <DrawerHeader className="px-0">
                <DrawerTitle className="font-display">Log puffs</DrawerTitle>
                <DrawerDescription>How many this session?</DrawerDescription>
              </DrawerHeader>

              <div className="flex items-center justify-center gap-8 py-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuickCount(Math.max(1, quickCount - 1))}
                  className="h-14 w-14 rounded-full"
                  aria-label="Decrease"
                >
                  <Minus size={22} />
                </Button>
                <AnimatedNumber
                  value={quickCount}
                  className="num text-6xl font-bold w-24 text-center"
                  springOptions={{ bounce: 0, duration: 300 }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuickCount(Math.min(MAX_QUICK_COUNT, quickCount + 1))}
                  disabled={quickCount >= MAX_QUICK_COUNT}
                  className="h-14 w-14 rounded-full"
                  aria-label="Increase"
                >
                  <Plus size={22} />
                </Button>
              </div>

              <Button
                onClick={handlePuffLog}
                className="w-full h-14 text-base font-semibold"
              >
                Log {quickCount} Puff{quickCount > 1 ? 's' : ''}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/insights')}
            className="h-20 flex-col"
          >
            <TrendingUp size={24} className="mb-2" />
            <span className="text-sm font-semibold">View Insights</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/delay')}
            className="h-20 flex-col"
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