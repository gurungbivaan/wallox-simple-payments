import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, User, Eye, EyeOff, ArrowRight, Fingerprint } from "lucide-react";
import walloxLogo from "@/assets/wallox-logo.png";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup";
type AuthMethod = "email" | "phone";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtp = async () => {
    setLoading(true);
    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: mode === "signup" ? { data: { full_name: fullName } } : undefined,
        });
        if (error) throw error;
        setOtpSent(true);
        toast({ title: "OTP Sent", description: "Check your phone for the verification code." });
      } else {
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: mode === "signup" ? "sms" : "sms" });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "email") handleEmailAuth();
    else handlePhoneOtp();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4"
        >
          <span className="font-display text-2xl font-bold text-primary-foreground">W</span>
        </motion.div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Sign in to your Wallox wallet" : "Join Wallox for seamless payments"}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mx-5 flex rounded-xl bg-secondary p-1">
        <button
          onClick={() => { setMode("login"); setOtpSent(false); setOtp(""); }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => { setMode("signup"); setOtpSent(false); setOtp(""); }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Method toggle */}
      <div className="mx-5 mt-4 flex rounded-xl bg-secondary p-1">
        <button
          onClick={() => { setMethod("email"); setOtpSent(false); setOtp(""); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            method === "email" ? "bg-card text-foreground" : "text-muted-foreground"
          }`}
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </button>
        <button
          onClick={() => { setMethod("phone"); setOtpSent(false); setOtp(""); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            method === "phone" ? "bg-card text-foreground" : "text-muted-foreground"
          }`}
        >
          <Phone className="h-3.5 w-3.5" /> Phone
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 pt-6 space-y-4 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={`${mode}-${method}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {mode === "signup" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Bivaan Gurung"
                    required
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
            )}

            {method === "email" ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      required
                      disabled={otpSent}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-medium text-muted-foreground">Verification Code</label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                      <Fingerprint className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        required
                        maxLength={6}
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none tracking-widest"
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <>
              {method === "phone" && otpSent ? "Verify OTP" : mode === "login" ? "Log In" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="px-5 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to Wallox's{" "}
          <span className="text-primary">Terms of Service</span> and{" "}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
