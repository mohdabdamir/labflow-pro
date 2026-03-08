import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme";
import { RouteGuard } from "@/components/layout/RouteGuard";
import HomePage from "./pages/HomePage";
import UnderConstruction from "./pages/UnderConstruction";
import Dashboard from "./pages/Dashboard";
import RadiologyLayout from "./pages/radiology/RadiologyLayout";
import WorklistPage from "./pages/radiology/WorklistPage";
import StudyViewerPage from "./pages/radiology/StudyViewerPage";
import ComparisonViewerPage from "./pages/radiology/ComparisonViewerPage";
import ReportingPage from "./pages/radiology/ReportingPage";
import ReportsListPage from "./pages/radiology/ReportsListPage";
import AdminPage from "./pages/radiology/AdminPage";
import CasesPage from "./pages/CasesPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilesPage from "./pages/ProfilesPage";
import PackagesPage from "./pages/PackagesPage";
import ClientsPage from "./pages/ClientsPage";
import PriceListsPage from "./pages/PriceListsPage";
import NormalRangesPage from "./pages/NormalRangesPage";
import SettingsPage from "./pages/SettingsPage";
import BillingPage from "./pages/BillingPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function GuardedRoute({ path, element }: { path: string; element: React.ReactNode }) {
  return <RouteGuard path={path}>{element}</RouteGuard>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Medical Center Home — portal entry point */}
            <Route path="/" element={<HomePage />} />

            {/* Lab module — all sub-routes under /lab */}
            <Route path="/lab" element={<GuardedRoute path="/lab" element={<Dashboard />} />} />
            <Route path="/lab/cases" element={<GuardedRoute path="/lab/cases" element={<CasesPage />} />} />
            <Route path="/lab/services" element={<GuardedRoute path="/lab/services" element={<ServicesPage />} />} />
            <Route path="/lab/profiles" element={<GuardedRoute path="/lab/profiles" element={<ProfilesPage />} />} />
            <Route path="/lab/packages" element={<GuardedRoute path="/lab/packages" element={<PackagesPage />} />} />
            <Route path="/lab/clients" element={<GuardedRoute path="/lab/clients" element={<ClientsPage />} />} />
            <Route path="/lab/pricelists" element={<GuardedRoute path="/lab/pricelists" element={<PriceListsPage />} />} />
            <Route path="/lab/normalranges" element={<GuardedRoute path="/lab/normalranges" element={<NormalRangesPage />} />} />
            <Route path="/lab/billing" element={<GuardedRoute path="/lab/billing" element={<BillingPage />} />} />
            <Route path="/lab/settings" element={<GuardedRoute path="/lab/settings" element={<SettingsPage />} />} />
            <Route path="/lab/users" element={<GuardedRoute path="/lab/users" element={<UsersPage />} />} />

            {/* Legacy routes — redirect-friendly aliases (same components, same guard) */}
            <Route path="/cases" element={<GuardedRoute path="/lab/cases" element={<CasesPage />} />} />
            <Route path="/services" element={<GuardedRoute path="/lab/services" element={<ServicesPage />} />} />
            <Route path="/profiles" element={<GuardedRoute path="/lab/profiles" element={<ProfilesPage />} />} />
            <Route path="/packages" element={<GuardedRoute path="/lab/packages" element={<PackagesPage />} />} />
            <Route path="/clients" element={<GuardedRoute path="/lab/clients" element={<ClientsPage />} />} />
            <Route path="/pricelists" element={<GuardedRoute path="/lab/pricelists" element={<PriceListsPage />} />} />
            <Route path="/normalranges" element={<GuardedRoute path="/lab/normalranges" element={<NormalRangesPage />} />} />
            <Route path="/billing" element={<GuardedRoute path="/lab/billing" element={<BillingPage />} />} />
            <Route path="/settings" element={<GuardedRoute path="/lab/settings" element={<SettingsPage />} />} />
            <Route path="/users" element={<GuardedRoute path="/lab/users" element={<UsersPage />} />} />

            {/* Other medical center modules — under construction */}
            <Route path="/anatomic-pathology" element={<UnderConstruction />} />
            <Route path="/radiology" element={<UnderConstruction />} />
            <Route path="/pharmacy" element={<UnderConstruction />} />
            <Route path="/appointments" element={<UnderConstruction />} />
            <Route path="/emergency" element={<UnderConstruction />} />
            <Route path="/outpatient" element={<UnderConstruction />} />
            <Route path="/inpatient" element={<UnderConstruction />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
