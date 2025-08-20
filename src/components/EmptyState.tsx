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
    <Card className="p-8 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Visual Element */}
        {image ? (
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-medium">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        ) : icon ? (
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-calm flex items-center justify-center shadow-soft">
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
            variant="accent"
            onClick={onAction}
            className="shadow-medium hover:shadow-large"
          >
            {actionText}
          </Button>
        )}
      </div>
    </Card>
  );
}