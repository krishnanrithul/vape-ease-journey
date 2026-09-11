import { Link } from 'react-router-dom';
import { Settings, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto w-full max-w-lg flex h-14 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">VapeWise</span>
        </Link>

        <Button asChild variant="ghost" size="icon" aria-label="Settings">
          <Link to="/settings">
            <Settings size={20} />
          </Link>
        </Button>
      </div>
    </header>
  );
}
