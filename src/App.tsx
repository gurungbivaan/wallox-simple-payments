import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import BillsPage from "@/pages/BillsPage";
import QRPage from "@/pages/QRPage";
import NFCPage from "@/pages/NFCPage";
import HistoryPage from "@/pages/HistoryPage";
import SendMoneyPage from "@/pages/SendMoneyPage";
import SettingsPage from "@/pages/SettingsPage";
import HotelPage from "@/pages/HotelPage";
import AuthPage from "@/pages/AuthPage";
import KYCPage from "@/pages/KYCPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">W</span>
          </div>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/nfc" element={<NFCPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/send" element={<SendMoneyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/hotels" element={<HotelPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

const AppRoutes = () => {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
