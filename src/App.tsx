import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppHeader } from "@/components/AppHeader";
import { OnboardingProvider, useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { usePuffData } from "@/hooks/usePuffData";
import { useReminderScheduler } from "@/hooks/useReminderScheduler";
import Home from "./pages/Home";
import Insights from "./pages/Insights";
import Goals from "./pages/Goals";
import Gamification from "./pages/Gamification";
import CravingDelay from "./pages/CravingDelay";
import Settings from "./pages/Settings";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";

const queryClient = new QueryClient();

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} {...pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/delay" element={<CravingDelay />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Gate the whole shell (header + nav + routes) behind onboarding so a
 * first-time user can't tap into Goals/Insights before finishing the intro.
 */
function AppShell() {
  const { hasSeenOnboarding, completeOnboarding } = useOnboarding();
  const { setBaseline, setDailyGoal, getTodaysPuffs } = usePuffData();
  useReminderScheduler(() => getTodaysPuffs() > 0);

  if (hasSeenOnboarding === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (hasSeenOnboarding === false) {
    return (
      <OnboardingFlow
        onComplete={(baseline) => {
          if (baseline && baseline > 0) {
            setBaseline(baseline);
            setDailyGoal(Math.max(1, Math.round(baseline * 0.9)));
          }
          completeOnboarding();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      {/* Phone-first layout: cap the content column on tablet/desktop */}
      <main className="flex-1 mx-auto w-full max-w-lg">
        <AnimatedRoutes />
      </main>
      <BottomNav />
    </div>
  );
}

const App = () => (
  <MotionConfig reducedMotion="user">
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <OnboardingProvider>
              <AppShell />
            </OnboardingProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </MotionConfig>
);

export default App;
