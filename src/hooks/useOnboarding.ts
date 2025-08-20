import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('vape-onboarding-complete');
    const hasData = localStorage.getItem('vape-puffs');
    
    if (!hasOnboarded && !hasData) {
      setIsFirstVisit(true);
      setHasSeenOnboarding(false);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('vape-onboarding-complete', 'true');
    setHasSeenOnboarding(true);
    setIsFirstVisit(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('vape-onboarding-complete');
    setHasSeenOnboarding(false);
    setIsFirstVisit(true);
  };

  return {
    hasSeenOnboarding,
    isFirstVisit,
    completeOnboarding,
    resetOnboarding
  };
}