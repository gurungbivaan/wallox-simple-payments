import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TransactionItem from "@/components/TransactionItem";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTransactions } from "@/hooks/use-wallet";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const filters = ["All", "Sent", "Received", "Bills"];

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const { data: transactions, isLoading } = useTransactions();

  const mapTx = (tx: any) => {
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

  const mapped = transactions?.map(mapTx) ?? [];
  const filtered = activeFilter === "All"
    ? mapped
    : mapped.filter((tx) => {
        if (activeFilter === "Sent") return tx.type === "sent";
        if (activeFilter === "Received") return tx.type === "received";
        if (activeFilter === "Bills") return tx.type === "bill";
        return true;
      });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold flex-1">Transaction History</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-2 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-border/50 px-5 pt-2">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length > 0 ? (
          filtered.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">No transactions found</p>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
