import { ArrowLeft, Shield, Key, Fingerprint, Smartphone, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SecurityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password Updated" });
      setShowChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const securityOptions = [
    {
      icon: Key,
      label: "Change Password",
      desc: "Update your login password",
      action: () => setShowChangePassword(!showChangePassword),
    },
    {
      icon: Fingerprint,
      label: "Biometric Login",
      desc: biometricsEnabled ? "Enabled" : "Disabled",
      toggle: true,
      value: biometricsEnabled,
      onToggle: () => {
        setBiometricsEnabled(!biometricsEnabled);
        toast({ title: `Biometrics ${!biometricsEnabled ? "Enabled" : "Disabled"}` });
      },
    },
    {
      icon: Lock,
      label: "Transaction PIN",
      desc: pinEnabled ? "Enabled — required for all payments" : "Disabled",
      toggle: true,
      value: pinEnabled,
      onToggle: () => {
        setPinEnabled(!pinEnabled);
        toast({ title: `Transaction PIN ${!pinEnabled ? "Enabled" : "Disabled"}` });
      },
    },
    {
      icon: Smartphone,
      label: "Two-Factor Auth",
      desc: "Not set up",
      action: () => toast({ title: "Coming Soon", description: "2FA will be available in the next update." }),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Security</h1>
      </div>

      <div className="px-5 pt-5 space-y-2">
        {securityOptions.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button
              onClick={item.toggle ? item.onToggle : item.action}
              className="wallox-card flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-card-elevated"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <item.icon className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {item.toggle && (
                <div className={`h-6 w-11 rounded-full transition-colors ${item.value ? "bg-primary" : "bg-muted"} relative`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {showChangePassword && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-5 pt-4">
          <div className="wallox-card p-5 space-y-4">
            <h3 className="font-display text-sm font-semibold text-foreground">Change Password</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <div className="mt-1.5 flex items-center rounded-xl bg-secondary px-3 py-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1.5 w-full rounded-xl bg-secondary px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={updating || !newPassword || !confirmPassword}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {updating ? "Updating..." : "Update Password"}
            </button>
          </div>
        </motion.div>
      )}

      <div className="mx-5 mt-6 wallox-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Security Tips</span>
        </div>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>• Use a strong, unique password</li>
          <li>• Enable biometric login for convenience</li>
          <li>• Never share your PIN or password</li>
          <li>• Enable 2FA when available</li>
        </ul>
      </div>
    </div>
  );
};

export default SecurityPage;
