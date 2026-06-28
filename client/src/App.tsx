import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import NotFound from "@/pages/not-found";
import { QuotationGeneration } from "@/pages/QuotationGeneration";
import { PricelistManagement } from "@/pages/PricelistManagement";
import { CompanyPreferences } from "@/pages/CompanyPreferences";
import { Projects } from "@/pages/Projects";
import { MarketIntelligence } from "@/pages/MarketIntelligence";
import { Dashboard } from "@/pages/Dashboard";

// Route guard: redirect to appropriate onboarding step if not fully setup
function GuardedRoute({ component: Component, minStep = 2 }: { component: React.ComponentType; minStep?: number }) {
  const { onboardingStep } = useApp();

  if (onboardingStep < minStep) {
    if (onboardingStep === 0) return <Redirect to="/pricelist" />;
    if (onboardingStep === 1) return <Redirect to="/management" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Root + dashboard */}
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />

      {/* Onboarding steps — always accessible */}
      <Route path="/pricelist" component={PricelistManagement} />
      <Route path="/management" component={CompanyPreferences} />

      {/* Full features — guarded until onboarding complete */}
      <Route path="/quotation">
        {() => <GuardedRoute component={QuotationGeneration} />}
      </Route>
      <Route path="/projects">
        {() => <GuardedRoute component={Projects} />}
      </Route>
      <Route path="/analysis">
        {() => <GuardedRoute component={MarketIntelligence} />}
      </Route>
      <Route path="/blueprints">
        {() => <GuardedRoute component={QuotationGeneration} />}
      </Route>
      <Route path="/quotations">
        {() => <GuardedRoute component={Projects} />}
      </Route>
      <Route path="/suppliers">
        {() => <GuardedRoute component={Dashboard} />}
      </Route>
      <Route path="/settings">
        {() => <GuardedRoute component={Dashboard} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Router />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
