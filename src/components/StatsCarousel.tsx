import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { cn } from '@/lib/utils';

export interface StatItem {
  key: string;
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  hint?: string;
}

const toneClass: Record<NonNullable<StatItem['tone']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

export function StatsCarousel({ items, className }: { items: StatItem[]; className?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false,
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn('-mx-6', className)}>
      {/* viewport: overflow hidden, peek via slide basis + padding */}
      <div ref={emblaRef} className="overflow-hidden px-6">
        <div className="flex gap-3">
          {items.map(({ key, label, value, unit, icon: Icon, tone = 'default', hint }) => (
            <div
              key={key}
              className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_46%] rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="label-meta">{label}</span>
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-1">
                <AnimatedNumber
                  value={value}
                  className={cn('num text-4xl font-bold leading-none', toneClass[tone])}
                  springOptions={{ bounce: 0, duration: 600 }}
                />
                {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
              </div>
              {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((it, i) => (
          <button
            key={it.key}
            aria-label={`Go to ${it.label}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === selected ? 'w-5 bg-primary' : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>
    </div>
  );
}
