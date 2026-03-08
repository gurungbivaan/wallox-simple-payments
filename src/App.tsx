import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import BillsPage from "@/pages/BillsPage";
import QRPage from "@/pages/QRPage";
import NFCPage from "@/pages/NFCPage";
import HistoryPage from "@/pages/HistoryPage";
import SendMoneyPage from "@/pages/SendMoneyPage";
import SettingsPage from "@/pages/SettingsPage";
import HotelPage from "@/pages/HotelPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="mx-auto max-w-md">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/qr" element={<QRPage />} />
            <Route path="/nfc" element={<NFCPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/send" element={<SendMoneyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
