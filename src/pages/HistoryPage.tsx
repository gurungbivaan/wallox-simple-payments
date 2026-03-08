import { ArrowLeft, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TransactionItem from "@/components/TransactionItem";
import { recentTransactions } from "@/data/mockData";
import { motion } from "framer-motion";
import { useState } from "react";

const filters = ["All", "Sent", "Received", "Bills", "Merchant"];

const HistoryPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? recentTransactions
    : recentTransactions.filter((tx) => {
        if (activeFilter === "Sent") return tx.type === "sent";
        if (activeFilter === "Received") return tx.type === "received";
        if (activeFilter === "Bills") return tx.type === "bill";
        if (activeFilter === "Merchant") return tx.type === "merchant";
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

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-2 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-border/50 px-5 pt-2">
        {filtered.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No transactions found</p>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
