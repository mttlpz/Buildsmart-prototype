import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider, useApp } from "@/context/AppContext";
import NotFound from "@/pages/not-found";
import { QuotationGeneration } from "@/pages/QuotationGeneration";
import { PricelistManagement } from "@/pages/PricelistManagement";
import { CompanyPreferences } from "@/pages/CompanyPreferences";
import { Projects } from "@/pages/Projects";
import { MarketIntelligence } from "@/pages/MarketIntelligence";
import { Dashboard } from "@/pages/Dashboard";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import { SupplierBenchmarking } from "@/pages/SupplierBenchmarking";

// Guard: require completed onboarding for full features
function GuardedRoute({ component: Component, minStep = 2 }: { component: React.ComponentType; minStep?: number }) {
  const { onboardingStep } = useApp();
  if (onboardingStep < minStep) {
    if (onboardingStep === 0) return <Redirect to="/pricelist" />;
    if (onboardingStep === 1) return <Redirect to="/management" />;
  }
  return <Component />;
}

// Guard: require auth session — redirect unauthenticated visitors to /login
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#E07B39]" />
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />

      {/* Root redirect */}
      <Route path="/">
        {() => (
          <RequireAuth>
            <GuardedRoute component={Dashboard} minStep={2} />
          </RequireAuth>
        )}
      </Route>

      {/* Onboarding */}
      <Route path="/pricelist">
        {() => (
          <RequireAuth>
            <PricelistManagement />
          </RequireAuth>
        )}
      </Route>
      <Route path="/management">
        {() => (
          <RequireAuth>
            <CompanyPreferences />
          </RequireAuth>
        )}
      </Route>

      {/* Main app routes — guarded */}
      <Route path="/dashboard">
        {() => (
          <RequireAuth>
            <GuardedRoute component={Dashboard} minStep={2} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/quotation">
        {() => (
          <RequireAuth>
            <GuardedRoute component={QuotationGeneration} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/projects">
        {() => (
          <RequireAuth>
            <GuardedRoute component={Projects} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/analysis">
        {() => (
          <RequireAuth>
            <GuardedRoute component={MarketIntelligence} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/suppliers">
        {() => (
          <RequireAuth>
            <GuardedRoute component={SupplierBenchmarking} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/blueprints">
        {() => (
          <RequireAuth>
            <GuardedRoute component={QuotationGeneration} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/quotations">
        {() => (
          <RequireAuth>
            <GuardedRoute component={Projects} />
          </RequireAuth>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <RequireAuth>
            <GuardedRoute component={Dashboard} />
          </RequireAuth>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Router />
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
