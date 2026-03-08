import { ArrowLeft, CreditCard, Building2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface LinkedAccount {
  id: string;
  type: "bank" | "card";
  name: string;
  last4: string;
  icon: string;
}

const LinkedAccountsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<"bank" | "card">("bank");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleAdd = () => {
    if (!accountName.trim() || accountNumber.length < 4) {
      toast({ title: "Invalid Details", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const newAccount: LinkedAccount = {
      id: Date.now().toString(),
      type: addType,
      name: accountName.trim(),
      last4: accountNumber.slice(-4),
      icon: addType === "bank" ? "🏦" : "💳",
    };
    setAccounts([...accounts, newAccount]);
    setShowAdd(false);
    setAccountName("");
    setAccountNumber("");
    toast({ title: `${addType === "bank" ? "Bank Account" : "Card"} Linked` });
  };

  const handleRemove = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    toast({ title: "Account Removed" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold flex-1">Linked Accounts</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Plus className="h-4 w-4 text-primary" />
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-5">
          <div className="wallox-card p-5 space-y-4">
            <h3 className="font-display text-sm font-semibold">Link New Account</h3>
            <div className="flex rounded-xl bg-secondary p-1">
              <button onClick={() => setAddType("bank")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-colors ${addType === "bank" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <Building2 className="h-3.5 w-3.5" /> Bank Account
              </button>
              <button onClick={() => setAddType("card")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-colors ${addType === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <CreditCard className="h-3.5 w-3.5" /> Card
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{addType === "bank" ? "Bank Name" : "Card Name"}</label>
              <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder={addType === "bank" ? "e.g. Nepal Bank Ltd" : "e.g. Visa Debit"}
                className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{addType === "bank" ? "Account Number" : "Card Number"}</label>
              <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter number"
                className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium text-foreground">Cancel</button>
              <button onClick={handleAdd} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">Link Account</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="px-5 pt-5 space-y-2">
        {accounts.length > 0 ? (
          accounts.map((account, i) => (
            <motion.div key={account.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="wallox-card flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-lg">{account.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{account.name}</p>
                <p className="text-xs text-muted-foreground">•••• {account.last4}</p>
              </div>
              <button onClick={() => handleRemove(account.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center py-16">
            <CreditCard className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">No linked accounts yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Tap + to link a bank account or card</p>
          </div>
        )}
      </div>

      <div className="mx-5 mt-6 wallox-card p-4">
        <p className="text-xs text-muted-foreground">
          🔒 Your bank details are encrypted and stored securely. Wallox never stores full card numbers.
        </p>
      </div>
    </div>
  );
};

export default LinkedAccountsPage;
