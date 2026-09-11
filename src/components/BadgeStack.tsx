import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge as BadgeType } from '@/hooks/useAdvancedGamification';
import { AppIcon } from '@/lib/iconMap';
import { cn } from '@/lib/utils';

const rarityRing: Record<BadgeType['rarity'], string> = {
  common: 'ring-zinc-400/40',
  rare: 'ring-sky-400/60',
  epic: 'ring-violet-400/60',
  legendary: 'ring-amber-400/70',
};

const rarityLabel: Record<BadgeType['rarity'], string> = {
  common: 'text-zinc-400',
  rare: 'text-sky-400',
  epic: 'text-violet-400',
  legendary: 'text-amber-400',
};

const SWIPE_THRESHOLD = 80;
const VISIBLE_BEHIND = 2;

interface BadgeStackProps {
  badges: BadgeType[];
  title: string;
  emptyMessage?: string;
}

/**
 * Swipeable card stack for badges still in progress. The top card is
 * draggable; swiping either way sends it to the back of the deck and the
 * next one slides forward. Arrows cover desktop and keyboard users.
 */
export function BadgeStack({ badges, title, emptyMessage }: BadgeStackProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduceMotion = useReducedMotion();
  const count = badges.length;

  if (count === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
          <Trophy size={24} className="text-muted-foreground opacity-70" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        {emptyMessage && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
      </Card>
    );
  }

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex(i => (i + dir + count) % count);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const flung = Math.abs(velocity.x) > 500;
    if (offset.x < -SWIPE_THRESHOLD || (flung && velocity.x < 0)) go(1);
    else if (offset.x > SWIPE_THRESHOLD || (flung && velocity.x > 0)) go(-1);
  };

  // The card order from top of the deck downward.
  const deck = Array.from({ length: Math.min(count, VISIBLE_BEHIND + 1) }, (_, i) => badges[(index + i) % count]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg flex items-center">
          <Trophy size={20} className="mr-2 text-primary" />
          {title}
        </h3>
        <span className="num text-xs text-muted-foreground">
          {index + 1} / {count}
        </span>
      </div>

      {/* Deck. Height is fixed so the cards behind can peek below the top one. */}
      <div className="relative h-[232px] select-none">
        <AnimatePresence initial={false} custom={direction}>
          {deck.map((badge, depth) => {
            const isTop = depth === 0;
            const pct = Math.min(100, (badge.progress / badge.maxProgress) * 100);
            return (
              <motion.div
                key={badge.id}
                className="absolute inset-x-0 top-0"
                style={{ zIndex: VISIBLE_BEHIND + 1 - depth }}
                custom={direction}
                initial={isTop && !reduceMotion ? { x: direction * 60, opacity: 0, scale: 0.96 } : false}
                animate={{
                  x: 0,
                  y: depth * 12,
                  scale: 1 - depth * 0.04,
                  opacity: 1 - depth * 0.25,
                }}
                exit={reduceMotion ? { opacity: 0 } : { x: -direction * 320, opacity: 0, rotate: -direction * 6, transition: { duration: 0.22 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                drag={isTop ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={isTop ? onDragEnd : undefined}
                whileDrag={{ cursor: 'grabbing' }}
              >
                <Card
                  className={cn(
                    'p-5 h-[208px] flex flex-col ring-1',
                    rarityRing[badge.rarity],
                    isTop ? 'cursor-grab shadow-md' : 'pointer-events-none'
                  )}
                  aria-hidden={!isTop}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-full bg-muted/40 flex items-center justify-center">
                      <AppIcon name={badge.icon} size={26} className="text-muted-foreground opacity-70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('label-meta capitalize', rarityLabel[badge.rarity])}>{badge.rarity}</p>
                      <h4 className="font-display font-semibold text-lg leading-tight truncate">{badge.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{badge.criteria}</span>
                      <span className="num font-medium">
                        {badge.progress} / {badge.maxProgress}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => go(-1)} aria-label="Previous badge" disabled={count < 2}>
          <ChevronLeft size={18} />
        </Button>
        <p className="text-xs text-muted-foreground">Swipe to browse</p>
        <Button variant="ghost" size="icon" onClick={() => go(1)} aria-label="Next badge" disabled={count < 2}>
          <ChevronRight size={18} />
        </Button>
      </div>
    </section>
  );
}
