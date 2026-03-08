import { Bell, Shield } from "lucide-react";
import BalanceCard from "@/components/BalanceCard";
import QuickActions from "@/components/QuickActions";
import TransactionItem from "@/components/TransactionItem";
import { recentTransactions } from "@/data/mockData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, wallox_id")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <span className="font-display text-sm font-bold text-primary">W</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Good Morning</p>
            <h1 className="font-display text-base font-semibold text-foreground">Bivaan Gurung</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <Shield className="h-4 w-4 text-primary" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-5 py-4">
        <BalanceCard />
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-2">
        <QuickActions />
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 px-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Recent Transactions</h3>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-medium text-primary"
          >
            See All
          </button>
        </div>
        <div className="mt-2 divide-y divide-border/50">
          {recentTransactions.slice(0, 4).map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
