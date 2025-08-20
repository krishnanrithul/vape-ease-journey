import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppHeader } from "@/components/AppHeader";
import Home from "./pages/Home";
import Insights from "./pages/Insights";
import Goals from "./pages/Goals";
import Gamification from "./pages/Gamification";
import CravingDelay from "./pages/CravingDelay";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full">
            <AppHeader />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/gamification" element={<Gamification />} />
                <Route path="/delay" element={<CravingDelay />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
