import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Pause, Play, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import { Goal } from '@/hooks/useAdvancedGoals';
import { AppIcon } from '@/lib/iconMap';
import { limitTone, TONE_INDICATOR_CLASS } from '@/lib/progressTone';

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

  // "decrease" goals (stay under a limit) get a status color — green/amber/red,
  // same axis as the ring on Home — so orange never doubles as "you're over
  // your limit". "increase" goals (one-off achievements) keep the brand color
  // while in progress and switch to success green only once actually complete.
  const indicatorClass = isCompleted
    ? TONE_INDICATOR_CLASS.success
    : goal.direction === 'decrease'
    ? TONE_INDICATOR_CLASS[limitTone(goal.current, goal.target)]
    : TONE_INDICATOR_CLASS.primary;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'hard': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reduction': return 'bg-primary/20 text-primary-foreground border-primary/30';
      case 'streak': return 'bg-primary/15 text-primary border-primary/30';
      case 'mindfulness': return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
      case 'milestone': return 'bg-secondary/15 text-success border-success/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <Card className={`p-6 shadow-sm border border-border transition-all duration-300 ${
      isCompleted ? 'bg-secondary/10 border-success/30' :
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
              <AppIcon name={goal.icon} size={22} className="text-primary-foreground" />
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
            aria-label={goal.isActive ? 'Pause goal' : 'Resume goal'}
          >
            {goal.isActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          {!isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Delete goal"
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
            className="h-3"
            indicatorClassName={indicatorClass}
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
            {isCompleted ? (
              <>
                <CheckCircle2 size={14} className="shrink-0" />
                Completed on {goal.completedAt!.toLocaleDateString()}
              </>
            ) : daysRemaining !== null ? (
              daysRemaining > 0 ? (
                <>
                  <Clock size={14} className="shrink-0" />
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </>
              ) : (
                <>
                  <TriangleAlert size={14} className="shrink-0" />
                  Goal period ended
                </>
              )
            ) : (
              <>
                <RefreshCw size={14} className="shrink-0" />
                Ongoing goal
              </>
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
