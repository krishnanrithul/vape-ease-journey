import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  image?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  image, 
  actionText, 
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`p-8 shadow-elevated border-0 bg-card/80 backdrop-blur-sm text-center ${className}`}>
      {image && (
        <div className="mb-6">
          <img 
            src={image} 
            alt={title}
            className="w-24 h-24 mx-auto rounded-2xl shadow-soft object-cover"
          />
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" className="shadow-soft">
          {actionText}
        </Button>
      )}
    </Card>
  );
}