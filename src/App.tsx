
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Fundraisers from "./pages/Fundraisers";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminLogs from "./pages/AdminLogs";
import FundraiserDetails from "./pages/FundraiserDetails";
import UserDetails from "./pages/UserDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fundraisers" element={<Fundraisers />} />
          <Route path="/fundraisers/:id" element={<FundraiserDetails />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/admin-logs" element={<AdminLogs />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
