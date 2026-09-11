import {
  Award,
  Bird,
  CalendarCheck2,
  Crown,
  Dumbbell,
  Eye,
  Flame,
  Flower,
  Flower2,
  Gem,
  Hammer,
  Leaf,
  Lock,
  Medal,
  Rocket,
  Search,
  Sparkles,
  Sprout,
  Star,
  Target,
  TreeDeciduous,
  TrendingDown,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single icon language for the whole app: every badge / achievement / goal /
 * milestone / onboarding step stores a semantic key here instead of an emoji,
 * so everything renders as the same outline-icon style.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  seed: Sprout,
  sprout: Sprout,
  'calendar-check': CalendarCheck2,
  sapling: Leaf,
  tree: TreeDeciduous,
  flower: Flower2,
  bloom: Flower,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  crown: Crown,
  star: Star,
  target: Target,
  'trend-down': TrendingDown,
  search: Search,
  eye: Eye,
  hammer: Hammer,
  bird: Bird,
  dumbbell: Dumbbell,
  rocket: Rocket,
  sparkles: Sparkles,
  gem: Gem,
  medal: Medal,
  award: Award,
  lock: Lock,
};

interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Renders a semantic icon key from ICON_MAP; falls back to Award for unknown/legacy keys. */
export function AppIcon({ name, size = 24, className }: AppIconProps) {
  const Icon = ICON_MAP[name] ?? Award;
  return <Icon size={size} className={className} />;
}
