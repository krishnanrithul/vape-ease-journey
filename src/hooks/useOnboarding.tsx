import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface OnboardingContextValue {
  /** null while reading storage, then true/false */
  hasSeenOnboarding: boolean | null;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/**
 * Single source of truth for onboarding state. Lives at the app root so the
 * header, bottom nav and every page agree on whether the intro is showing —
 * a per-hook useState here meant Settings could reset onboarding while Home
 * still thought it was complete.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('vape-onboarding-complete');
    const hasData = localStorage.getItem('vape-puffs');
    setHasSeenOnboarding(Boolean(hasOnboarded || hasData));
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('vape-onboarding-complete', 'true');
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('vape-onboarding-complete');
    setHasSeenOnboarding(false);
  };

  return (
    <OnboardingContext.Provider value={{ hasSeenOnboarding, completeOnboarding, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}
