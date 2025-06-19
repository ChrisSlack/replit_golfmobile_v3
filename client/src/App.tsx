import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Schedule from "@/pages/Schedule";
import Courses from "@/pages/Courses";
import Scoring from "@/pages/Scoring";
import Matchplay from "@/pages/Matchplay";
import Fines from "@/pages/Fines";
import Activities from "@/pages/Activities";
import Players from "@/pages/Players";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/courses" component={Courses} />
        <Route path="/scoring" component={Scoring} />
        <Route path="/matchplay" component={Matchplay} />
        <Route path="/fines" component={Fines} />
        <Route path="/activities" component={Activities} />
        <Route path="/players" component={Players} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
