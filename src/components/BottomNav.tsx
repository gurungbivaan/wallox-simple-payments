import { Home, Receipt, QrCode, Wifi, Clock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/bills", icon: Receipt, label: "Bills" },
  { path: "/qr", icon: QrCode, label: "QR Pay" },
  { path: "/nfc", icon: Wifi, label: "NFC" },
  { path: "/history", icon: Clock, label: "History" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 wallox-glass safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-colors ${
                isActive ? "wallox-nav-active" : "wallox-nav-inactive"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
