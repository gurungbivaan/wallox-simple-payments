import { Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const BalanceCard = () => {
  const [hidden, setHidden] = useState(false);

  return (
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
            {hidden ? "••••••" : "Rs. 24,580.00"}
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
        <button className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-4 py-2 text-xs font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/25">
          <Plus className="h-3.5 w-3.5" />
          Add Money
        </button>
        <p className="text-xs text-primary-foreground/60">•••• 4829</p>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
