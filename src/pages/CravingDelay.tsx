import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const DELAY_OPTIONS = [
  { minutes: 1, label: '1 min', color: 'bg-primary' },
  { minutes: 3, label: '3 min', color: 'bg-secondary' },
  { minutes: 5, label: '5 min', color: 'bg-accent' },
  { minutes: 10, label: '10 min', color: 'bg-primary-glow' }
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
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, [selectedMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            toast.success('Great job! You made it through the craving', {
              description: 'Consider if you still want to vape, or if the feeling has passed'
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setTimeLeft(selectedMinutes * 60);
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = timeLeft > 0 ? ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-calm pb-32">
      <div className="px-6 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Delay Technique</h1>
          <p className="text-muted-foreground">Wait it out - cravings are temporary</p>
        </div>

        {!isActive && timeLeft === 0 && (
          <>
            {/* Duration Selection */}
            <Card className="p-6 mb-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Choose delay time</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {DELAY_OPTIONS.map((option) => (
                  <Button
                    key={option.minutes}
                    variant={selectedMinutes === option.minutes ? "accent" : "calm"}
                    onClick={() => setSelectedMinutes(option.minutes)}
                    className="h-16 flex-col"
                  >
                    <Clock size={20} className="mb-1" />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
              
              <Button
                variant="success"
                onClick={startTimer}
                className="w-full"
              >
                <Play className="mr-2" size={16} />
                Start {selectedMinutes} Minute Delay
              </Button>
            </Card>

            {/* Instructions */}
            <Card className="p-6 shadow-card">
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

        {(isActive || timeLeft > 0) && (
          <Card className="p-8 shadow-card text-center">
            {/* Timer Display */}
            <div className="mb-6">
              <div className="text-6xl font-bold text-primary mb-2">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progressPercent} className="h-2 mb-4" />
              <p className="text-muted-foreground">
                {Math.floor(progressPercent)}% complete
              </p>
            </div>

            {/* Motivational Quote */}
            <div className="mb-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-medium text-foreground italic">
                "{quote}"
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-3 justify-center">
              {isActive ? (
                <Button variant="calm" onClick={pauseTimer}>
                  <Pause size={16} className="mr-2" />
                  Pause
                </Button>
              ) : (
                <Button variant="success" onClick={() => setIsActive(true)}>
                  <Play size={16} className="mr-2" />
                  Resume
                </Button>
              )}
              
              <Button variant="outline" onClick={resetTimer}>
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
            </div>

            {timeLeft === 0 && (
              <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
                <CheckCircle size={32} className="mx-auto mb-2 text-secondary" />
                <p className="font-semibold text-secondary">Delay Complete!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  How are you feeling now?
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}