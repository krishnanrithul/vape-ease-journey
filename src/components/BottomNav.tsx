import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Target, Trophy, Clock } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/insights', icon: TrendingUp, label: 'Insights' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/gamification', icon: Trophy, label: 'Rewards' },
    { to: '/delay', icon: Clock, label: 'Delay' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-md z-50 transition-colors duration-300">
      <div className="flex justify-around py-2 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'text-primary border-t-2 border-primary -mt-[2px]'
                  : 'text-muted-foreground border-t-2 border-transparent -mt-[2px] hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <Icon size={20} className="stroke-[1.5]" />
            <span className="text-xs mt-1 tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}