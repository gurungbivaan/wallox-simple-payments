import { Send, QrCode, Wifi, Receipt, ArrowDownLeft, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const actions = [
  { icon: Send, label: "Send", color: "bg-primary/15 text-primary", path: "/send" },
  { icon: ArrowDownLeft, label: "Request", color: "bg-accent/15 text-accent", path: "/qr" },
  { icon: QrCode, label: "QR Pay", color: "bg-info/15 text-info", path: "/qr" },
  { icon: Receipt, label: "Bills", color: "bg-warning/15 text-warning", path: "/bills" },
  { icon: Building2, label: "Hotels", color: "bg-success/15 text-success", path: "/hotels" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center gap-2"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color}`}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
