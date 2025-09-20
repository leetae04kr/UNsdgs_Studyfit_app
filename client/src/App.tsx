import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Camera from "@/pages/camera";
import OcrResult from "@/pages/ocr-result";
import SolutionSearch from "@/pages/solution-search";
import ExerciseSelection from "@/pages/exercise-selection";
import ExerciseTracking from "@/pages/exercise-tracking";
import Profile from "@/pages/profile";
import TokenShop from "@/pages/token-shop";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/camera" component={Camera} />
          <Route path="/ocr-result" component={OcrResult} />
          <Route path="/solution-search" component={SolutionSearch} />
          <Route path="/exercise-selection" component={ExerciseSelection} />
          <Route path="/exercise-tracking/:id" component={ExerciseTracking} />
          <Route path="/profile" component={Profile} />
          <Route path="/token-shop" component={TokenShop} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
