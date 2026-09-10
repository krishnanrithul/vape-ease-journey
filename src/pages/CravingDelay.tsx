import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, CheckCircle, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const DELAY_OPTIONS = [
  { minutes: 1, label: '1 min', color: 'bg-primary' },
  { minutes: 3, label: '3 min', color: 'bg-secondary' },
  { minutes: 5, label: '5 min', color: 'bg-accent' },
  { minutes: 10, label: '10 min', color: 'bg-primary' }
];

const MOTIVATIONAL_QUOTES = [
  "Every moment of delay is a victory",
  "You're stronger than your cravings",
  "This feeling will pass",
  "Progress, not perfection",
  "You're taking control of your choices",
  "Small delays build lasting change"
];

export default function CravingDelay() {
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [quote, setQuote] = useState('');
  const [breathIn, setBreathIn] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, [selectedMinutes]);

  // Tick down once per second while running. The updater stays pure.
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timeout = setTimeout(() => {
      setTimeLeft(time => Math.max(0, time - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isActive, timeLeft]);

  // Handle completion as its own effect so the "Delay Complete" screen persists.
  useEffect(() => {
    if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsComplete(true);
      toast.success('Great job! You made it through the craving', {
        description: 'Consider if you still want to vape, or if the feeling has passed'
      });
    }
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setBreathIn(b => !b), 4000);
    return () => clearInterval(id);
  }, [isActive]);

  const startTimer = () => {
    setIsComplete(false);
    setTimeLeft(selectedMinutes * 60);
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsComplete(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Delay Technique</h1>
          <p className="text-muted-foreground">Wait it out - cravings are temporary</p>
        </div>

        {!isActive && !isComplete && timeLeft === 0 && (
          <>
            {/* Duration Selection */}
            <Card className="p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Choose delay time</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {DELAY_OPTIONS.map((option) => (
                  <Button
                    key={option.minutes}
                    variant={selectedMinutes === option.minutes ? "default" : "outline"}
                    onClick={() => setSelectedMinutes(option.minutes)}
                    className="h-16 flex-col"
                  >
                    <Clock size={20} className="mb-1" />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={startTimer}
                className="w-full h-12"
              >
                <Play className="mr-2" size={16} />
                Start {selectedMinutes} Minute Delay
              </Button>
            </Card>

            {/* Instructions */}
            <Card className="p-6 shadow-sm">
              <h3 className="font-semibold mb-3">How it works</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Choose a delay time that feels manageable</p>
                <p>• Focus on breathing or do a simple activity</p>
                <p>• Notice how the craving changes over time</p>
                <p>• Celebrate each successful delay</p>
              </div>
            </Card>
          </>
        )}

        <AnimatePresence>
          {(isActive || (timeLeft > 0 && !isComplete)) && (
            <motion.div
              key="focus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-between px-6 py-10"
            >
              {/* top bar */}
              <div className="w-full flex items-center justify-between">
                <span className="label-meta">Focus mode</span>
                <Button variant="ghost" size="icon" onClick={resetTimer} aria-label="Exit">
                  <X size={20} />
                </Button>
              </div>

              {/* breathing ring */}
              <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
                <motion.div
                  className="absolute rounded-full bg-primary/10"
                  style={{ width: 280, height: 280 }}
                  animate={reduce || !isActive ? { scale: 1 } : { scale: [1, 1.18, 1] }}
                  transition={reduce ? { duration: 0 } : { duration: 8, ease: 'easeInOut', repeat: Infinity }}
                />
                <motion.div
                  className="absolute rounded-full border-2 border-primary/60"
                  style={{ width: 200, height: 200 }}
                  animate={reduce || !isActive ? { scale: 1 } : { scale: [1, 1.28, 1] }}
                  transition={reduce ? { duration: 0 } : { duration: 8, ease: 'easeInOut', repeat: Infinity }}
                />
                <div className="relative flex flex-col items-center">
                  <div className="num text-6xl font-bold text-foreground leading-none">
                    {formatTime(timeLeft)}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isActive ? (breathIn ? 'in' : 'out') : 'paused'}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="label-meta mt-3"
                    >
                      {isActive ? (breathIn ? 'Breathe in' : 'Breathe out') : 'Paused'}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* quote + controls */}
              <div className="w-full max-w-sm text-center space-y-6">
                <p className="text-lg font-medium text-muted-foreground italic">"{quote}"</p>
                <div className="flex gap-3 justify-center">
                  {isActive ? (
                    <Button variant="outline" size="lg" onClick={pauseTimer}>
                      <Pause size={16} className="mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button size="lg" onClick={() => setIsActive(true)}>
                      <Play size={16} className="mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button variant="ghost" size="lg" onClick={resetTimer}>
                    <RotateCcw size={16} className="mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isComplete && (
          <Card className="p-8 shadow-sm text-center">
            <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
              <CheckCircle size={32} className="mx-auto mb-2 text-success" />
              <p className="font-semibold text-success">Delay Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                How are you feeling now? The craving may have already passed.
              </p>
            </div>

            <div className="mb-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-medium text-foreground italic">
                "{quote}"
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={startTimer}>
                <Play size={16} className="mr-2" />
                Start another delay
              </Button>
              <Button variant="outline" onClick={resetTimer}>
                <RotateCcw size={16} className="mr-2" />
                Done
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}