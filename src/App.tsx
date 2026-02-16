import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme";
import Dashboard from "./pages/Dashboard";
import CasesPage from "./pages/CasesPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilesPage from "./pages/ProfilesPage";
import PackagesPage from "./pages/PackagesPage";
import ClientsPage from "./pages/ClientsPage";
import PriceListsPage from "./pages/PriceListsPage";
import NormalRangesPage from "./pages/NormalRangesPage";
import SettingsPage from "./pages/SettingsPage";
import BillingPage from "./pages/BillingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/pricelists" element={<PriceListsPage />} />
            <Route path="/normalranges" element={<NormalRangesPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
