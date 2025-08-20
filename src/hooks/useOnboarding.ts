import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('has-seen-onboarding');
    if (!seen) {
      setHasSeenOnboarding(false);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('has-seen-onboarding', 'true');
    setHasSeenOnboarding(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return {
    hasSeenOnboarding,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding
  };
}