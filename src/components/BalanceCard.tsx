import { Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet, useTopup } from "@/hooks/use-wallet";

const BalanceCard = () => {
  const [hidden, setHidden] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const { data: wallet, isLoading } = useWallet();
  const topup = useTopup();

  const balance = wallet?.balance ?? 0;

  const handleTopup = () => {
    const amt = Number(topupAmount);
    if (amt <= 0) return;
    topup.mutate({ amount: amt, description: `Wallet Top Up - Rs. ${amt}` }, {
      onSuccess: () => { setShowTopup(false); setTopupAmount(""); },
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="wallox-balance-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/70">Total Balance</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-primary-foreground">
              {isLoading ? "Loading..." : hidden ? "••••••" : `Rs. ${Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </h2>
          </div>
          <button
            onClick={() => setHidden(!hidden)}
            className="rounded-full bg-primary-foreground/10 p-2 backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
          >
            {hidden ? (
              <EyeOff className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Eye className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => setShowTopup(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-4 py-2 text-xs font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/25"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Money
          </button>
          <p className="text-xs text-primary-foreground/60">{wallet?.currency ?? "NPR"}</p>
        </div>
      </motion.div>

      {/* Top-up Modal */}
      {showTopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowTopup(false)}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="w-full max-w-md rounded-t-3xl bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-foreground">Add Money</h3>
            <p className="mt-1 text-xs text-muted-foreground">Top up your Wallox wallet</p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-muted-foreground">Rs.</span>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent font-display text-4xl font-bold text-foreground placeholder:text-muted outline-none"
              />
            </div>

            <div className="mt-4 flex gap-2">
              {[500, 1000, 2000, 5000].map((a) => (
                <button
                  key={a}
                  onClick={() => setTopupAmount(String(a))}
                  className="flex-1 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground"
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={handleTopup}
              disabled={!topupAmount || Number(topupAmount) <= 0 || topup.isPending}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {topup.isPending ? "Processing..." : `Add Rs. ${topupAmount ? Number(topupAmount).toLocaleString() : "0"}`}
            </button>

            <button
              onClick={() => setShowTopup(false)}
              className="mt-2 w-full rounded-xl bg-secondary py-3 text-sm font-medium text-foreground"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default BalanceCard;
