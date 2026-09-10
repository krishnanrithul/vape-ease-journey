import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Trash2, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePuffData, PuffEntry } from '@/hooks/usePuffData';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';

const dayLabel = (d: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const timeLabel = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function History() {
  const navigate = useNavigate();
  const { puffs, hydrated, updatePuff, removePuff, restorePuff } = usePuffData();

  const groups = useMemo(() => {
    const sorted = [...puffs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const map = new Map<string, { date: Date; entries: PuffEntry[]; total: number }>();
    for (const p of sorted) {
      const key = p.timestamp.toDateString();
      const g = map.get(key) ?? { date: p.timestamp, entries: [], total: 0 };
      g.entries.push(p);
      g.total += p.count;
      map.set(key, g);
    }
    return [...map.values()];
  }, [puffs]);

  const handleDelete = (entry: PuffEntry) => {
    removePuff(entry.id);
    toast('Entry deleted', {
      action: {
        label: 'Undo',
        onClick: () => restorePuff(entry),
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Log history</h1>
        </div>

        {hydrated && groups.length === 0 && (
          <Card className="p-8 text-center">
            <Clock size={28} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">Everything you log will show up here.</p>
          </Card>
        )}

        {groups.map(group => (
          <section key={group.date.toDateString()} className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="label-meta">{dayLabel(group.date)}</h2>
              <span className="num text-sm text-muted-foreground">{group.total} total</span>
            </div>
            <Card className="divide-y divide-border overflow-hidden">
              <AnimatePresence initial={false}>
                {group.entries.map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="num text-sm text-muted-foreground w-20 shrink-0">{timeLabel(entry.timestamp)}</span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updatePuff(entry.id, entry.count - 1)}
                          disabled={entry.count <= 1}
                          aria-label="Decrease count"
                        >
                          <Minus size={14} />
                        </Button>
                        <div className="flex items-baseline gap-1 w-16 justify-center">
                          <AnimatedNumber value={entry.count} className="num text-lg font-semibold" springOptions={{ bounce: 0, duration: 250 }} />
                          <span className="text-xs text-muted-foreground">{entry.count === 1 ? 'puff' : 'puffs'}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updatePuff(entry.id, entry.count + 1)}
                          aria-label="Increase count"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(entry)}
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
