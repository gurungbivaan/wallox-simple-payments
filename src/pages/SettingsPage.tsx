import { ArrowLeft, ChevronRight, User, Shield, Bell, Globe, CreditCard, HelpCircle, LogOut, ArrowRightLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const exchangeRates = [
  { from: "NPR", to: "USD", rate: 0.0075, flag: "🇺🇸" },
  { from: "NPR", to: "EUR", rate: 0.0069, flag: "🇪🇺" },
  { from: "NPR", to: "GBP", rate: 0.0059, flag: "🇬🇧" },
  { from: "NPR", to: "INR", rate: 0.625, flag: "🇮🇳" },
  { from: "NPR", to: "AUD", rate: 0.0116, flag: "🇦🇺" },
  { from: "NPR", to: "JPY", rate: 1.12, flag: "🇯🇵" },
];

const settingsItems = [
  { icon: User, label: "Profile & KYC", desc: "Verify your identity", color: "text-primary" },
  { icon: Shield, label: "Security", desc: "PIN, biometrics, 2FA", color: "text-success" },
  { icon: CreditCard, label: "Linked Accounts", desc: "Bank accounts & cards", color: "text-accent" },
  { icon: Bell, label: "Notifications", desc: "Manage alerts", color: "text-warning" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact", color: "text-info" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showExchange, setShowExchange] = useState(false);
  const [convertAmount, setConvertAmount] = useState("1000");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const selectedRate = exchangeRates.find((r) => r.to === selectedCurrency);
  const converted = selectedRate ? (Number(convertAmount) * selectedRate.rate).toFixed(2) : "0";

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
        <div className="wallox-card flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <span className="font-display text-lg font-bold text-primary">B</span>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-semibold">Bivaan Gurung</h3>
            <p className="text-xs text-muted-foreground">+977 98XXXXXX91 • KYC Verified ✓</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
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
            {/* Converter */}
            <div className="wallox-card p-4 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Currency Converter</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">NPR</label>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full bg-transparent font-display text-xl font-bold text-foreground outline-none"
                  />
                </div>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 text-right">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="bg-transparent text-[10px] text-muted-foreground outline-none"
                  >
                    {exchangeRates.map((r) => (
                      <option key={r.to} value={r.to} className="bg-card text-foreground">{r.to}</option>
                    ))}
                  </select>
                  <p className="font-display text-xl font-bold text-primary">{converted}</p>
                </div>
              </div>
            </div>

            {/* Rates grid */}
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
