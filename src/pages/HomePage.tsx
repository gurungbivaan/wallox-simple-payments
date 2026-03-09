import { Bell, Shield } from "lucide-react";
import BalanceCard from "@/components/BalanceCard";
import QuickActions from "@/components/QuickActions";
import TransactionItem from "@/components/TransactionItem";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTransactions } from "@/hooks/use-wallet";
import { useUnreadCount } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadCount();

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

  const { data: transactions } = useTransactions(4);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const mapTxToDisplay = (tx: any) => {
    const isSender = tx.sender_id === user?.id;
    const type = tx.type === "topup" ? "received"
      : tx.type === "payment" ? "bill"
      : isSender ? "sent" : "received";
    const icon = tx.type === "topup" ? "receive"
      : tx.type === "payment" ? "bill"
      : isSender ? "send" : "receive";
    
    return {
      id: tx.id,
      name: tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      type: type as "sent" | "received" | "bill" | "merchant",
      amount: Number(tx.amount),
      date: formatDistanceToNow(new Date(tx.created_at), { addSuffix: true }),
      icon: icon as "send" | "receive" | "bill" | "merchant",
    };
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center justify-between px-5 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <span className="font-display text-sm font-bold text-primary">W</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{greeting}</p>
            <h1 className="font-display text-base font-semibold text-foreground">{profile?.full_name ?? "Wallox User"}</h1>
            <p className="text-[10px] font-mono text-muted-foreground/70">{profile?.wallox_id ?? ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <Shield className="h-4 w-4 text-primary" />
          </button>
          <button onClick={() => navigate("/notifications")} className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <Bell className="h-4 w-4 text-muted-foreground" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {unreadCount! > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <BalanceCard />
      </div>

      <div className="px-5 py-2">
        <QuickActions />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 px-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Recent Transactions</h3>
          <button onClick={() => navigate("/history")} className="text-xs font-medium text-primary">
            See All
          </button>
        </div>
        <div className="mt-2 divide-y divide-border/50">
          {transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <TransactionItem key={tx.id} tx={mapTxToDisplay(tx)} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet. Add money to get started!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
