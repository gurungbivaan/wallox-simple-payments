import { ArrowLeft, Smartphone, Check, ArrowDownLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PinVerification from "@/components/PinVerification";

type NFCState = "idle" | "searching" | "found" | "verify" | "success";

const NFCPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [state, setState] = useState<NFCState>("idle");
  const [amount, setAmount] = useState("");

  const displayAmount = amount ? `Rs. ${Number(amount).toLocaleString()}` : "Rs. 1,500";

  const startNFC = () => {
    if (mode === "send" && !amount) return;
    setState("searching");
    setTimeout(() => setState("found"), 2500);
  };

  const resetFlow = () => {
    setState("idle");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">NFC Transfer</h1>
      </div>

      {/* Send / Receive Toggle */}
      <div className="mx-5 mt-5 flex rounded-xl bg-secondary p-1">
        <button
          onClick={() => { setMode("send"); resetFlow(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            mode === "send" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
        <button
          onClick={() => { setMode("receive"); resetFlow(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            mode === "receive" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <ArrowDownLeft className="h-3.5 w-3.5" /> Receive
        </button>
      </div>

      <div className="pt-8">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5">
              {mode === "send" ? (
                <div className="mb-6">
                  <label className="text-xs font-medium text-muted-foreground">Amount to Send</label>
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
              ) : (
                <div className="mb-6">
                  <label className="text-xs font-medium text-muted-foreground">Amount to Request (optional)</label>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-muted-foreground">Rs.</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Any amount"
                      className="flex-1 bg-transparent font-display text-4xl font-bold text-foreground placeholder:text-muted outline-none"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={startNFC}
                disabled={mode === "send" && !amount}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                {mode === "send" ? "Start NFC Transfer" : "Start Receiving"}
              </button>
            </motion.div>
          )}

          {state === "searching" && (
            <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pt-10 px-5">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/15"
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-12 w-12 text-primary animate-pulse-glow" />
                </div>
              </div>
              <h3 className="mt-8 font-display text-lg font-semibold">
                {mode === "send" ? "Searching for device..." : "Waiting for sender..."}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">Hold phones close together</p>
            </motion.div>
          )}

          {state === "found" && (
            <motion.div key="found" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5">
              <div className="wallox-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                    <span className="text-lg font-bold text-accent">A</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Arun Sharma</h3>
                    <p className="text-xs text-muted-foreground">+977 98XXXXXX12</p>
                  </div>
                </div>
                <div className="mt-4 h-px bg-border" />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mode === "send" ? "Sending" : "Receiving"}
                  </span>
                  <span className="font-display text-xl font-bold">{displayAmount}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={resetFlow} className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium text-foreground">
                  Cancel
                </button>
                <button onClick={() => setState("verify")} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
                  {mode === "send" ? "Confirm & Send" : "Accept"}
                </button>
              </div>
            </motion.div>
          )}

          {state === "verify" && (
            <PinVerification
              key="verify"
              summaryItems={[
                { label: mode === "send" ? "Sending to" : "Receiving from", value: "Arun Sharma" },
                { label: "Amount", value: displayAmount },
                { label: "Method", value: "NFC Transfer" },
              ]}
              onSuccess={() => setState("success")}
              onCancel={() => setState("found")}
            />
          )}

          {state === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-12 px-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary"
              >
                <Check className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h3 className="mt-6 font-display text-xl font-bold">
                {mode === "send" ? "Transfer Successful!" : "Payment Received!"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {displayAmount} {mode === "send" ? "sent to" : "received from"} Arun Sharma
              </p>
              <button onClick={resetFlow} className="mt-8 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground">
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NFCPage;
