import { ArrowLeft, Phone, Mail, Hash, User, Check, Fingerprint, ShieldCheck, Delete } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type SendMethod = "phone" | "email" | "wallox";

const methodConfig = {
  phone: { icon: Phone, label: "Phone Number", placeholder: "+977 98XXXXXXXX" },
  email: { icon: Mail, label: "Email Address", placeholder: "user@example.com" },
  wallox: { icon: Hash, label: "Wallox ID", placeholder: "wallox://user-id" },
};

const recentContacts = [
  { name: "Arun Sharma", phone: "+977 98XXXXXX12", avatar: "A" },
  { name: "Priya Thapa", phone: "+977 98XXXXXX34", avatar: "P" },
  { name: "Suman Rai", phone: "+977 98XXXXXX56", avatar: "S" },
  { name: "Kabita Lama", phone: "+977 98XXXXXX78", avatar: "K" },
];

const CORRECT_PIN = "1234";

const SendMoneyPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<SendMethod>("phone");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"recipient" | "amount" | "verify" | "success">("recipient");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const config = methodConfig[method];

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      setVerifying(true);
      setTimeout(() => {
        if (newPin === CORRECT_PIN) {
          setStep("success");
        } else {
          setPinError(true);
          setPin("");
        }
        setVerifying(false);
      }, 800);
    }
  };

  const handlePinDelete = () => {
    setPin((p) => p.slice(0, -1));
    setPinError(false);
  };

  const handleBiometric = () => {
    setVerifying(true);
    setTimeout(() => {
      setStep("success");
      setVerifying(false);
    }, 1200);
  };

  const goBack = () => {
    if (step === "recipient") navigate("/");
    else if (step === "amount") setStep("recipient");
    else if (step === "verify") { setStep("amount"); setPin(""); setPinError(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Send Money</h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "recipient" && (
          <motion.div key="recipient" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pt-5">
            {/* Method tabs */}
            <div className="flex rounded-xl bg-secondary p-1">
              {(["phone", "email", "wallox"] as SendMethod[]).map((m) => {
                const Icon = methodConfig[m].icon;
                return (
                  <button
                    key={m}
                    onClick={() => { setMethod(m); setRecipient(""); }}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-colors ${
                      method === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {m === "phone" ? "Phone" : m === "email" ? "Email" : "Wallox ID"}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <label className="text-xs font-medium text-muted-foreground">{config.label}</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                <config.icon className="h-4 w-4 text-muted-foreground" />
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={config.placeholder}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            {method === "phone" && (
              <div className="mt-6">
                <h3 className="text-xs font-medium text-muted-foreground mb-3">Recent Contacts</h3>
                <div className="space-y-2">
                  {recentContacts.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setRecipient(c.phone)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                        <span className="text-sm font-semibold text-primary">{c.avatar}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep("amount")}
              disabled={!recipient}
              className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === "amount" && (
          <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            <div className="wallox-card p-4 flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sending to</p>
                <p className="text-xs text-muted-foreground">{recipient}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-muted-foreground">Rs.</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent font-display text-4xl font-bold text-foreground placeholder:text-muted outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {[500, 1000, 2000, 5000].map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="flex-1 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground"
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setStep("verify"); setPin(""); setPinError(false); }}
              disabled={!amount}
              className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Send Rs. {amount ? Number(amount).toLocaleString() : "0"}
            </button>
          </motion.div>
        )}

        {step === "verify" && (
          <motion.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            {/* Transaction summary */}
            <div className="wallox-card p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Secure Verification</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium text-foreground">{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-display font-bold text-foreground">Rs. {Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* PIN entry */}
            <div className="text-center mb-6">
              <h3 className="font-display text-base font-semibold text-foreground">Enter Transaction PIN</h3>
              <p className="mt-1 text-xs text-muted-foreground">Enter your 4-digit PIN to confirm</p>
            </div>

            {/* PIN dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={pinError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`h-4 w-4 rounded-full transition-colors ${
                    pinError
                      ? "bg-destructive"
                      : i < pin.length
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-destructive mb-4"
              >
                Incorrect PIN. Try again.
              </motion.p>
            )}

            {verifying && (
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
                />
              </div>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  onClick={() => handlePinDigit(d)}
                  disabled={verifying}
                  className="flex h-14 items-center justify-center rounded-2xl bg-secondary text-lg font-semibold text-foreground transition-colors active:bg-primary/20 disabled:opacity-50"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => handlePinDigit("0")}
                disabled={verifying}
                className="flex h-14 items-center justify-center rounded-2xl bg-secondary text-lg font-semibold text-foreground transition-colors active:bg-primary/20 disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                disabled={verifying}
                className="flex h-14 items-center justify-center rounded-2xl text-foreground transition-colors active:bg-secondary disabled:opacity-50"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>

            {/* Biometric option */}
            <div className="mt-6 flex flex-col items-center">
              <div className="h-px w-full bg-border mb-4" />
              <p className="text-xs text-muted-foreground mb-3">Or use biometrics</p>
              <button
                onClick={handleBiometric}
                disabled={verifying}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors active:bg-primary/20 disabled:opacity-50"
              >
                <Fingerprint className="h-8 w-8 text-primary" />
              </button>
              <p className="mt-2 text-[11px] text-muted-foreground">Touch to verify</p>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center px-5 pt-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-primary"
            >
              <Check className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h3 className="mt-6 font-display text-xl font-bold">Sent Successfully!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Rs. {Number(amount).toLocaleString()} sent to {recipient}</p>
            <button
              onClick={() => { setStep("recipient"); setRecipient(""); setAmount(""); setPin(""); }}
              className="mt-8 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SendMoneyPage;
