import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Sun, Moon, Monitor, Download, Trash2, RotateCcw, ChevronLeft, History, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { usePuffData } from '@/hooks/usePuffData';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTheme } from '@/hooks/useTheme';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { Switch } from '@/components/ui/switch';
import {
  getReminderHour,
  isReminderEnabled,
  isReminderSupported,
  setReminderEnabled,
  setReminderHour,
} from '@/lib/reminders';

const MAX_GOAL = 200;

function formatHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = MAX_GOAL,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const step = (v: number) => (v >= 30 ? 5 : 1);
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={() => onChange(Math.max(min, value - step(value)))}
        aria-label="Decrease"
      >
        <Minus size={18} />
      </Button>
      <AnimatedNumber value={value} className="num text-3xl font-bold w-16 text-center" springOptions={{ bounce: 0, duration: 250 }} />
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={() => onChange(Math.min(max, value + step(value)))}
        aria-label="Increase"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="label-meta mb-3">{title}</h2>
      <Card className="divide-y divide-border">{children}</Card>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { dailyGoal, setDailyGoal, baseline, setBaseline, exportData, clearAllData, hydrated, puffs } = usePuffData();
  const { resetOnboarding } = useOnboarding();
  const { theme, setTheme } = useTheme();

  const [goal, setGoal] = useState(dailyGoal);
  const [base, setBase] = useState(baseline ?? 0);
  useEffect(() => setGoal(dailyGoal), [dailyGoal]);
  useEffect(() => setBase(baseline ?? 0), [baseline]);

  const goalDirty = goal !== dailyGoal;
  const baseDirty = base !== (baseline ?? 0);

  const saveGoal = () => {
    setDailyGoal(goal);
    toast.success(`Daily goal set to ${goal}`);
  };

  const saveBaseline = () => {
    setBaseline(base > 0 ? base : null);
    toast.success(base > 0 ? `Baseline set to ${base} puffs/day` : 'Baseline cleared');
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vapewise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  };

  const handleClear = () => {
    clearAllData();
    // Full reload so every hook re-hydrates from empty storage and onboarding runs again.
    window.location.href = '/';
  };

  const handleReonboard = () => {
    resetOnboarding();
    navigate('/');
  };

  const reminderSupported = isReminderSupported();
  const [reminderOn, setReminderOn] = useState(isReminderEnabled());
  const [reminderHour, setReminderHourState] = useState(getReminderHour());

  const notifyReminderChanged = () => window.dispatchEvent(new Event('vape-reminder-changed'));

  const handleReminderToggle = async (next: boolean) => {
    const enabled = await setReminderEnabled(next);
    setReminderOn(enabled);
    notifyReminderChanged();
    if (next && !enabled) {
      toast.error('Notifications are blocked for this site', {
        description: 'Allow them in your browser or phone settings, then try again.',
      });
    } else {
      toast.success(enabled ? `Daily reminder on at ${formatHour(reminderHour)}` : 'Daily reminder off');
    }
  };

  const handleReminderHour = (hour: number) => {
    setReminderHour(hour);
    setReminderHourState(hour);
    notifyReminderChanged();
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <Section title="Goal">
          <Row label="Daily limit" hint="Puffs you're aiming to stay under each day">
            <Stepper value={goal} onChange={setGoal} />
          </Row>
          <Row label="Starting baseline" hint={baseline ? 'Used to measure your reduction' : 'Not set — used to measure your reduction'}>
            <Stepper value={base} onChange={setBase} min={0} />
          </Row>
          {(goalDirty || baseDirty) && (
            <div className="p-4 flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setGoal(dailyGoal);
                  setBase(baseline ?? 0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (goalDirty) saveGoal();
                  if (baseDirty) saveBaseline();
                }}
              >
                Save
              </Button>
            </div>
          )}
        </Section>

        <Section title="Appearance">
          <Row label="Theme">
            <div className="flex rounded-lg border border-border p-1 bg-background">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    theme === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section title="Reminders">
          <Row
            label="Daily reminder"
            hint={
              !reminderSupported
                ? 'Not supported in this browser'
                : 'A nudge to log if you haven’t yet. Fires while the app is open or installed.'
            }
          >
            <Switch
              checked={reminderOn}
              onCheckedChange={handleReminderToggle}
              disabled={!reminderSupported}
              aria-label="Toggle daily reminder"
            />
          </Row>
          {reminderOn && (
            <Row label="Remind me at">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-muted-foreground" />
                <select
                  value={reminderHour}
                  onChange={(e) => handleReminderHour(Number(e.target.value))}
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                  aria-label="Reminder hour"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>
            </Row>
          )}
        </Section>

        <Section title="Data">
          <Row label="Log history" hint={hydrated ? `${puffs.length} entr${puffs.length === 1 ? 'y' : 'ies'}` : undefined}>
            <Button variant="outline" onClick={() => navigate('/history')}>
              <History size={16} className="mr-2" />
              View
            </Button>
          </Row>
          <Row label="Export backup" hint="Download everything as JSON">
            <Button variant="outline" onClick={handleExport} disabled={!hydrated}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </Row>
          <Row label="Re-run onboarding" hint="Revisit the intro and reset your baseline">
            <Button variant="outline" onClick={handleReonboard}>
              <RotateCcw size={16} className="mr-2" />
              Restart
            </Button>
          </Row>
          <Row label="Clear all data" hint="Deletes logs, goals, streaks and achievements on this device">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 size={16} className="mr-2" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all your logs, goals, streaks and achievements from this device. It can't be undone —
                    export a backup first if you want to keep it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my data</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Row>
        </Section>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All data stays on this device. Nothing is sent anywhere.
        </p>
      </div>
    </div>
  );
}
