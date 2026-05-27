import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { QuotationGeneration } from "@/pages/QuotationGeneration";
import { PricelistManagement } from "@/pages/PricelistManagement";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QuotationGeneration} />
      <Route path="/quotation" component={QuotationGeneration} />
      <Route path="/blueprints" component={QuotationGeneration} />
      <Route path="/projects" component={QuotationGeneration} />
      <Route path="/quotations" component={QuotationGeneration} />
      <Route path="/pricelist" component={PricelistManagement} />
      <Route path="/suppliers" component={QuotationGeneration} />
      <Route path="/management" component={QuotationGeneration} />
      <Route path="/settings" component={QuotationGeneration} />
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
