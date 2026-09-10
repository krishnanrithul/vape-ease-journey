import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: string;
  image?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export function EmptyState({ 
  icon, 
  image, 
  title, 
  description, 
  actionText = "Get Started", 
  onAction,
  showAction = true 
}: EmptyStateProps) {
  return (
    <Card className="p-8 shadow-sm border border-border bg-card">
      <div className="text-center">
        {/* Visual Element */}
        {image ? (
          <div className="w-32 h-32 mx-auto mb-6 rounded-lg overflow-hidden shadow-md">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        ) : icon ? (
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center shadow-sm">
            <span className="text-4xl opacity-60">{icon}</span>
          </div>
        ) : null}

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm mx-auto">
          {description}
        </p>

        {/* Action Button */}
        {showAction && onAction && (
          <Button
            variant="default"
            onClick={onAction}
            className="shadow-md hover:shadow-md"
          >
            {actionText}
          </Button>
        )}
      </div>
    </Card>
  );
}