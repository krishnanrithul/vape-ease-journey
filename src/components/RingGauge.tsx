import { motion, useReducedMotion } from 'motion/react';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { cn } from '@/lib/utils';

interface RingGaugeProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

/**
 * Radial gauge: fills toward `max`. Green under 80%, amber 80–100%, red over.
 * Ring keeps going past 100% (clamped visually) so an over-limit day still reads as "full".
 */
export function RingGauge({
  value,
  max,
  size = 220,
  strokeWidth = 14,
  label = 'puffs today',
  className,
}: RingGaugeProps) {
  const reduce = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? value / max : 0;
  const clamped = Math.min(pct, 1);
  const offset = circumference * (1 - clamped);

  const tone =
    pct >= 1 ? 'destructive' : pct >= 0.8 ? 'warning' : 'success';
  const stroke = `hsl(var(--${tone}))`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset, stroke }}
          transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.9 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber
          value={value}
          className="num text-6xl font-bold text-foreground leading-none"
          springOptions={{ bounce: 0, duration: 700 }}
        />
        <span className="label-meta mt-2">{label}</span>
        <span className="num text-sm text-muted-foreground mt-1">
          {value}/{max}
        </span>
      </div>
    </div>
  );
}
