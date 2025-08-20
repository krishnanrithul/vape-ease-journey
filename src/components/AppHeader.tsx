import { ThemeToggle } from '@/components/ThemeToggle';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <span className="text-lg">🌿</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-gradient">VapeWise</span>
        </div>
        
        <ThemeToggle />
      </div>
    </header>
  );
}