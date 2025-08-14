import { Switch, Route } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import FloatingCTA from "@/components/floating-cta";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Contact from "@/pages/contact";

import TruckQuote from "@/pages/truck-quote";
import VanQuote from "@/pages/van-quote";
import ServiceAreasPage from "@/pages/service-areas";
import EmergencyServicePage from "@/pages/emergency-service";
import MobilePreview from "@/pages/MobilePreview";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import BusinessDashboard from "@/pages/business-dashboard-client";
import { ThemeProvider } from "@/components/theme-provider";

import NotFound from "@/pages/not-found";

function Router() {
  // Add scroll-to-top functionality
  useScrollToTop();
  
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/contact" component={Contact} />

      <Route path="/truck-quote" component={TruckQuote} />
      <Route path="/van-quote" component={VanQuote} />
      <Route path="/service-areas" component={ServiceAreasPage} />
      <Route path="/emergency-service" component={EmergencyServicePage} />
      <Route path="/mobile-preview" component={MobilePreview} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="murray-ui-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Switch>
              {/* Business Dashboard - Clean layout without navigation */}
              <Route path="/business" component={BusinessDashboard} />
              
              {/* All other routes with full layout */}
              <Route>
                <Navbar />
                <main>
                  <Router />
                </main>
                <Footer />
                <FloatingCTA />
              </Route>
            </Switch>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
