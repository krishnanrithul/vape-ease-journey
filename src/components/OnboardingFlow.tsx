import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import onboardingWelcome from '@/assets/onboarding-welcome.jpg';

interface OnboardingFlowProps {
  /** `baseline` is the user's estimated puffs/day; undefined if skipped. */
  onComplete: (baseline?: number) => void;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to VapeWise',
    subtitle: 'Your mindful tracking companion',
    description: "We're here to support your journey toward mindful vaping habits. No judgment, just gentle guidance and awareness.",
    image: onboardingWelcome,
    cta: 'Get Started'
  },
  {
    id: 'approach',
    title: 'Our Supportive Approach',
    subtitle: 'Progress, not perfection',
    description: "Track your habits to build awareness. Small, gradual changes lead to lasting results. You're in control of your journey.",
    icon: '🌱',
    features: [
      'Non-judgmental tracking',
      'Gradual reduction support',
      'Personal insights',
      'Streak motivation'
    ]
  },
  {
    id: 'privacy',
    title: 'Your Data Stays Private',
    subtitle: 'Complete privacy guaranteed',
    description: "All your data stays on your device. We don't collect, share, or store any of your personal tracking information.",
    icon: '🔒',
    features: [
      'Local data storage only',
      'No account required',
      'No data sharing',
      'Complete anonymity'
    ]
  },
  {
    id: 'baseline',
    title: 'Where are you starting from?',
    subtitle: 'Roughly how many puffs a day right now?',
    description: "A rough guess is fine. We'll set your first daily goal about 10% below this so it feels achievable.",
    icon: '🎯'
  },
  {
    id: 'ready',
    title: "You're All Set!",
    subtitle: 'Start your mindful journey',
    description: "Ready to begin? Remember: every step toward awareness is progress. Be kind to yourself along the way.",
    icon: '✨',
    cta: 'Start Tracking'
  }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [baseline, setBaseline] = useState(20);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const suggestedGoal = Math.max(1, Math.round(baseline * 0.9));

  const handleNext = () => {
    if (isLastStep) {
      onComplete(baseline);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-sm border border-border bg-card">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted scale-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          {/* Image or Icon */}
          {step.image ? (
            <div className="w-32 h-32 mx-auto mb-6 rounded-lg overflow-hidden shadow-md">
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="text-3xl">{step.icon}</span>
            </div>
          )}

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-bold mb-2 tracking-tight">{step.title}</h1>
          <p className="text-primary font-semibold mb-4">{step.subtitle}</p>
          
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Baseline stepper */}
          {step.id === 'baseline' && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-6 py-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setBaseline(b => Math.max(1, b - (b > 30 ? 5 : 1)))}
                  aria-label="Decrease"
                >
                  <Minus size={20} />
                </Button>
                <AnimatedNumber
                  value={baseline}
                  className="num text-6xl font-bold w-28 text-center"
                  springOptions={{ bounce: 0, duration: 300 }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setBaseline(b => Math.min(200, b + (b >= 30 ? 5 : 1)))}
                  aria-label="Increase"
                >
                  <Plus size={20} />
                </Button>
              </div>
              <p className="label-meta mt-1">puffs per day</p>
              <p className="mt-4 text-sm text-muted-foreground">
                First daily goal: <span className="num font-semibold text-foreground">{suggestedGoal}</span>
              </p>
            </div>
          )}

          {/* Features List */}
          {step.features && (
            <div className="space-y-3 mb-6">
              {step.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-secondary-foreground" />
                  </div>
                  <span className="text-muted-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>

          <Button
            variant="default"
            onClick={handleNext}
            className=""
          >
            {step.cta || 'Continue'}
            {!isLastStep && <ArrowRight size={16} className="ml-2" />}
          </Button>
        </div>

        {/* Skip Option */}
        {!isLastStep && (
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={() => onComplete()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}