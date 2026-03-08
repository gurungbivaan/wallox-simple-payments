import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { billCategories } from "@/data/mockData";
import { motion } from "framer-motion";
import { useState } from "react";

const BillsPage = () => {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const selected = billCategories.find((b) => b.id === selectedBill);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => selectedBill ? setSelectedBill(null) : navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Bill Payments</h1>
      </div>

      {!selectedBill ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-5">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search bills..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* Categories */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {billCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedBill(cat.id)}
                className="wallox-card flex items-center gap-3 p-4 text-left transition-colors hover:bg-card-elevated"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.color}`}>
                  <span className="text-lg">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-[11px] text-muted-foreground">{cat.provider}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : !showConfirm ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected?.color}`}>
              <span className="text-2xl">{selected?.icon}</span>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">{selected?.name}</h2>
              <p className="text-xs text-muted-foreground">{selected?.provider}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Customer ID / Meter No.</label>
              <input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter your customer ID"
                className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50"
              />
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!customerId}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Fetch Bill Details
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-6">
          <div className="wallox-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected?.color}`}>
                <span className="text-lg">{selected?.icon}</span>
              </div>
              <h3 className="font-display text-sm font-semibold">{selected?.name} Bill</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Customer ID</span><span className="font-medium">{customerId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bill Period</span><span className="font-medium">Feb 2026</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium text-warning">Mar 15, 2026</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between"><span className="text-muted-foreground">Amount Due</span><span className="font-display text-lg font-bold text-foreground">Rs. 2,340</span></div>
            </div>
          </div>

          <button
            onClick={() => { setShowConfirm(false); setSelectedBill(null); setCustomerId(""); }}
            className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Pay Rs. 2,340
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BillsPage;
