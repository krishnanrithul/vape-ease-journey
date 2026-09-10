import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Pause, Play, Trash2 } from 'lucide-react';
import { Goal } from '@/hooks/useAdvancedGoals';

interface GoalCardProps {
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onToggle, onDelete }: GoalCardProps) {
  const progressPercent = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.completedAt !== undefined;
  const daysRemaining = goal.endDate 
    ? Math.ceil((goal.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-500/20 text-red-700 border-red-200';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reduction': return 'bg-primary/20 text-primary-foreground border-primary/30';
      case 'streak': return 'bg-primary/15 text-primary border-primary/30';
      case 'mindfulness': return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
      case 'milestone': return 'bg-secondary/15 text-green-700 border-green-200';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <Card className={`p-6 shadow-sm border border-border transition-all duration-300 ${
      isCompleted ? 'bg-secondary/10 border-green-200/50' : 
      goal.isActive ? 'bg-card' : 'bg-muted/30'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-secondary' : 'bg-primary'
          } shadow-sm`}>
            {isCompleted ? (
              <CheckCircle2 size={24} className="text-white" />
            ) : (
              <span className="text-2xl">{goal.icon}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{goal.title}</h3>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {goal.isActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          {!isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">
              {goal.current} / {goal.target}
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className={`h-3 ${isCompleted ? 'bg-green-100' : ''}`}
          />
          <div className="text-center mt-2">
            <span className="text-sm font-medium text-foreground">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs capitalize ${getCategoryColor(goal.category)}`}
          >
            {goal.category}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs capitalize ${getDifficultyColor(goal.difficulty)}`}
          >
            {goal.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {goal.period}ly
          </Badge>
        </div>

        {/* Time information */}
        {(daysRemaining !== null || goal.completedAt) && (
          <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
            {isCompleted ? (
              `✅ Completed on ${goal.completedAt!.toLocaleDateString()}`
            ) : daysRemaining !== null ? (
              daysRemaining > 0 ? 
                `⏰ ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining` :
                `⚠️ Goal period ended`
            ) : (
              `🔄 Ongoing goal`
            )}
          </div>
        )}

        {/* Reward */}
        {goal.reward && (
          <div className="text-xs bg-accent/50 border border-accent/20 rounded-lg p-3">
            <span className="font-medium text-accent-foreground">Reward:</span> {goal.reward}
          </div>
        )}
      </div>
    </Card>
  );
}