import { ArrowLeft, ChevronRight, User, Shield, Bell, CreditCard, HelpCircle, LogOut, ArrowRightLeft, RefreshCw, Edit, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const exchangeRates = [
  { from: "NPR", to: "USD", rate: 0.0075, flag: "🇺🇸" },
  { from: "NPR", to: "EUR", rate: 0.0069, flag: "🇪🇺" },
  { from: "NPR", to: "GBP", rate: 0.0059, flag: "🇬🇧" },
  { from: "NPR", to: "INR", rate: 0.625, flag: "🇮🇳" },
  { from: "NPR", to: "AUD", rate: 0.0116, flag: "🇦🇺" },
  { from: "NPR", to: "JPY", rate: 1.12, flag: "🇯🇵" },
];

const settingsItems = [
  { icon: User, label: "Profile & KYC", desc: "Verify your identity", color: "text-primary", path: "/kyc" },
  { icon: Shield, label: "Security", desc: "PIN, biometrics, 2FA", color: "text-success", path: "/security" },
  { icon: CreditCard, label: "Linked Accounts", desc: "Bank accounts & cards", color: "text-accent", path: "/linked-accounts" },
  { icon: Bell, label: "Notifications", desc: "Manage alerts", color: "text-warning", path: "/notifications" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact", color: "text-info", path: "/help" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [showExchange, setShowExchange] = useState(false);
  const [convertAmount, setConvertAmount] = useState("1000");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, wallox_id, phone, kyc_verified, avatar_url")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const selectedRate = exchangeRates.find((r) => r.to === selectedCurrency);
  const converted = selectedRate ? (Number(convertAmount) * selectedRate.rate).toFixed(2) : "0";
  const avatarInitial = profile?.full_name?.[0]?.toUpperCase() ?? "W";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Settings</h1>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-5">
        <button onClick={() => navigate("/profile")} className="wallox-card flex w-full items-center gap-3 p-4 text-left">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <span className="font-display text-lg font-bold text-primary">{avatarInitial}</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-display text-base font-semibold">{profile?.full_name ?? "Wallox User"}</h3>
            <p className="text-[10px] font-mono text-muted-foreground/70">{profile?.wallox_id ?? ""}</p>
            <p className="text-xs text-muted-foreground">{profile?.phone ?? ""} {profile?.kyc_verified ? "• KYC Verified ✓" : ""}</p>
          </div>
          <Edit className="h-4 w-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Currency Exchange */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-5 mt-4">
        <button
          onClick={() => setShowExchange(!showExchange)}
          className="wallox-card flex w-full items-center gap-3 p-4 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Currency Exchange</p>
            <p className="text-xs text-muted-foreground">Live rates & converter</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showExchange ? "rotate-90" : ""}`} />
        </button>

        {showExchange && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 overflow-hidden">
            <div className="wallox-card p-4 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Currency Converter</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">NPR</label>
                  <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full bg-transparent font-display text-xl font-bold text-foreground outline-none" />
                </div>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 text-right">
                  <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="bg-transparent text-[10px] text-muted-foreground outline-none">
                    {exchangeRates.map((r) => (
                      <option key={r.to} value={r.to} className="bg-card text-foreground">{r.to}</option>
                    ))}
                  </select>
                  <p className="font-display text-xl font-bold text-primary">{converted}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {exchangeRates.map((rate) => (
                <div key={rate.to} className="wallox-card flex items-center gap-2 p-3">
                  <span className="text-lg">{rate.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">NPR → {rate.to}</p>
                    <p className="text-[11px] text-muted-foreground">{rate.rate}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings items */}
      <div className="mx-5 mt-4 space-y-2">
        {settingsItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            onClick={() => navigate(item.path)}
            className="wallox-card flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-card-elevated"
          >
            <item.icon className={`h-5 w-5 ${item.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <div className="mx-5 mt-6">
        <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm font-medium text-destructive">
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
