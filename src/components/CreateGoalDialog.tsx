import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Goal } from '@/hooks/useAdvancedGoals';
import { AppIcon } from '@/lib/iconMap';

interface CreateGoalDialogProps {
  onCreateGoal: (goalData: Partial<Goal>) => void;
}

export function CreateGoalDialog({ onCreateGoal }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: 1,
    period: 'week' as 'day' | 'week' | 'month' | 'custom',
    category: 'reduction' as 'reduction' | 'streak' | 'mindfulness' | 'milestone',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    icon: 'target',
    reward: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please add both a title and a description.');
      return;
    }
    if (!formData.target || formData.target < 1) {
      setError('Target must be at least 1.');
      return;
    }
    setError(null);

    const goalData: Partial<Goal> = {
      title: formData.title,
      description: formData.description,
      target: formData.target,
      period: formData.period,
      category: formData.category,
      difficulty: formData.difficulty,
      icon: formData.icon,
      reward: formData.reward || undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined
    };

    onCreateGoal(goalData);
    setOpen(false);

    // Reset form
    setFormData({
      title: '',
      description: '',
      target: 1,
      period: 'week',
      category: 'reduction',
      difficulty: 'medium',
      icon: 'target',
      reward: '',
      endDate: ''
    });
  };

  const goalIcons = ['target', 'star', 'rocket', 'dumbbell', 'sparkles', 'trophy', 'medal', 'flame', 'zap', 'gem'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus size={16} className="mr-2" />
          Create Custom Goal
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Weekly Mindful Tracking"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what you want to achieve..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target">Target Number</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="period">Time Period</Label>
              <Select value={formData.period} onValueChange={(value: Goal['period']) => setFormData(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: Goal['category']) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduction">Reduction</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value: Goal['difficulty']) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {goalIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted text-muted-foreground hover:border-primary/50'
                  }`}
                  aria-label={icon}
                >
                  <AppIcon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="reward">Reward (Optional)</Label>
            <Input
              id="reward"
              value={formData.reward}
              onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
              placeholder="e.g., Treat yourself to something special"
            />
          </div>

          {formData.period === 'custom' && (
            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
