import { Fingerprint, ShieldCheck, Delete, ScanFace } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const CORRECT_PIN = "1234";

interface PinVerificationProps {
  title?: string;
  summaryItems: { label: string; value: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

const PinVerification = ({ title = "Enter Transaction PIN", summaryItems, onSuccess, onCancel }: PinVerificationProps) => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      setVerifying(true);
      setTimeout(() => {
        if (newPin === CORRECT_PIN) {
          onSuccess();
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
      onSuccess();
      setVerifying(false);
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5 pt-6">
      {/* Transaction summary */}
      <div className="wallox-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Secure Verification</span>
        </div>
        <div className="space-y-2 text-sm">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PIN entry */}
      <div className="text-center mb-6">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
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
              pinError ? "bg-destructive" : i < pin.length ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      {pinError && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-destructive mb-4">
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

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="mt-6 w-full rounded-xl bg-secondary py-3 text-sm font-medium text-foreground"
      >
        Cancel
      </button>
    </motion.div>
  );
};

export default PinVerification;
