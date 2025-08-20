import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Shield, TrendingDown, CheckCircle } from 'lucide-react';
import onboardingWelcome from '@/assets/onboarding-welcome.jpg';

interface OnboardingFlowProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to Your Safe Space",
    description: "This is a judgment-free zone designed to support your journey with understanding and compassion.",
    icon: Heart,
    content: "We believe in progress, not perfection. Every step forward counts, no matter how small."
  },
  {
    title: "Your Privacy Matters",
    description: "All your data stays private on your device. No accounts, no sharing, no judgment.",
    icon: Shield,
    content: "Track mindfully knowing that your journey is completely private and secure."
  },
  {
    title: "Track to Understand",
    description: "Awareness is the first step toward positive change. Knowledge empowers better choices.",
    icon: TrendingDown,
    content: "By understanding your patterns, you can make gradual, sustainable improvements."
  },
  {
    title: "You're Ready to Begin",
    description: "Start your mindful tracking journey with self-compassion and realistic goals.",
    icon: CheckCircle,
    content: "Remember: This tool is here to support you, not judge you. Be kind to yourself."
  }
];

export function OnboardingFlow({ currentStep, onNext, onPrev, onComplete }: OnboardingFlowProps) {
  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-elevated border-0 bg-card/95 backdrop-blur-sm">
        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            Step {currentStep + 1} of {onboardingSteps.length}
          </p>
        </div>

        {/* Hero Image */}
        {currentStep === 0 && (
          <div className="mb-6">
            <img 
              src={onboardingWelcome} 
              alt="Welcome" 
              className="w-full h-32 object-cover rounded-xl shadow-soft"
            />
          </div>
        )}

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-accent flex items-center justify-center shadow-medium">
            <IconComponent size={32} className="text-accent-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{step.title}</h2>
          <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
          <p className="text-foreground text-sm font-medium leading-relaxed">{step.content}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" onClick={onPrev} className="flex-1">
              Previous
            </Button>
          )}
          {currentStep < onboardingSteps.length - 1 ? (
            <Button onClick={onNext} className="flex-1">
              Continue
            </Button>
          ) : (
            <Button onClick={onComplete} className="flex-1">
              Get Started
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <Button variant="ghost" size="sm" onClick={onComplete}>
            Skip for now
          </Button>
        </div>
      </Card>
    </div>
  );
}