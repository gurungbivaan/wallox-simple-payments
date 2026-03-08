import { ArrowDownLeft, ArrowUpRight, Receipt, Zap, Wifi as WifiIcon, ShoppingBag } from "lucide-react";

export interface Transaction {
  id: string;
  name: string;
  type: "sent" | "received" | "bill" | "merchant";
  amount: number;
  date: string;
  icon: "send" | "receive" | "bill" | "merchant";
}

const iconMap = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  bill: Zap,
  merchant: ShoppingBag,
};

const colorMap = {
  send: "bg-destructive/15 text-destructive",
  receive: "bg-success/15 text-success",
  bill: "bg-warning/15 text-warning",
  merchant: "bg-accent/15 text-accent",
};

const TransactionItem = ({ tx }: { tx: Transaction }) => {
  const Icon = iconMap[tx.icon];
  const isNegative = tx.type === "sent" || tx.type === "bill" || tx.type === "merchant";

  return (
    <div className="flex items-center gap-3 rounded-xl px-1 py-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[tx.icon]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{tx.name}</p>
        <p className="text-xs text-muted-foreground">{tx.date}</p>
      </div>
      <p className={`text-sm font-semibold ${isNegative ? "text-destructive" : "text-success"}`}>
        {isNegative ? "-" : "+"}Rs. {Math.abs(tx.amount).toLocaleString()}
      </p>
    </div>
  );
};

export default TransactionItem;
