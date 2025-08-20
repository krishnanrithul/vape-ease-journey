import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TRIGGERS = [
  { id: 'stress', label: 'Stress', emoji: '😰' },
  { id: 'boredom', label: 'Boredom', emoji: '😑' },
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'habit', label: 'Habit', emoji: '🔄' },
  { id: 'break', label: 'Break', emoji: '☕' },
  { id: 'other', label: 'Other', emoji: '💭' }
];

const MOODS = [
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'stressed', label: 'Stressed', emoji: '😤' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'focused', label: 'Focused', emoji: '🎯' }
];

export default function TagSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  
  const handleSkip = () => {
    navigate('/');
  };

  const handleSave = () => {
    // In a real app, this would update the last puff entry with tags
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-32">
      <div className="px-6 pt-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="mr-3"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Optional Tags</h1>
            <p className="text-sm text-muted-foreground">
              Help us understand your patterns
            </p>
          </div>
        </div>

        {/* Trigger Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">What triggered this session?</h2>
          <div className="grid grid-cols-2 gap-3">
            {TRIGGERS.map((trigger) => (
              <Button
                key={trigger.id}
                variant={selectedTrigger === trigger.id ? "accent" : "calm"}
                onClick={() => setSelectedTrigger(trigger.id)}
                className="h-16 flex-col justify-center relative"
              >
                {selectedTrigger === trigger.id && (
                  <Check size={16} className="absolute top-2 right-2" />
                )}
                <span className="text-2xl mb-1">{trigger.emoji}</span>
                <span className="text-sm">{trigger.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">How are you feeling?</h2>
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map((mood) => (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? "accent" : "calm"}
                onClick={() => setSelectedMood(mood.id)}
                className="h-16 flex-col justify-center relative"
              >
                {selectedMood === mood.id && (
                  <Check size={16} className="absolute top-1 right-1" />
                )}
                <span className="text-xl mb-1">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="success"
            onClick={handleSave}
            className="w-full"
            disabled={!selectedTrigger && !selectedMood}
          >
            Save Tags
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}