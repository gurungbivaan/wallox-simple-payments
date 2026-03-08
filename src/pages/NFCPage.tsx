import { ArrowLeft, Smartphone, Check, ArrowDownLeft, Send, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import PinVerification from "@/components/PinVerification";
import { usePayment } from "@/hooks/use-wallet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type NFCState = "idle" | "searching" | "found" | "verify" | "success" | "unsupported";

const NFCPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [state, setState] = useState<NFCState>("idle");
  const [amount, setAmount] = useState("");
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [peerInfo, setPeerInfo] = useState<string>("Nearby Device");
  const payment = usePayment();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, wallox_id")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    setNfcSupported("NDEFReader" in window);
  }, []);

  const displayAmount = amount ? `Rs. ${Number(amount).toLocaleString()}` : "Rs. 0";

  const startNFC = async () => {
    if (mode === "send" && !amount) return;

    if (!nfcSupported) {
      setState("unsupported");
      return;
    }

    setState("searching");

    try {
      const ndef = new (window as any).NDEFReader();

      if (mode === "receive") {
        // Write our wallox ID to NFC tag for the sender to read
        await ndef.write({
          records: [{
            recordType: "text",
            data: JSON.stringify({
              wallox_id: profile?.wallox_id,
              name: profile?.full_name,
              amount: amount || null,
            }),
          }],
        });
        setState("found");
        setPeerInfo("Tag written - waiting for payment");
      } else {
        // Read NFC tag to get receiver info
        await ndef.scan();
        ndef.addEventListener("reading", ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === "text") {
              const decoder = new TextDecoder();
              try {
                const data = JSON.parse(decoder.decode(record.data));
                setPeerInfo(data.name || "NFC Device");
                setState("found");
              } catch {
                setPeerInfo("NFC Device");
                setState("found");
              }
            }
          }
        });
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setState("unsupported");
      } else {
        // Fallback to simulated NFC for demo
        setState("searching");
        setTimeout(() => {
          setPeerInfo("Nearby Device");
          setState("found");
        }, 2500);
      }
    }
  };

  const resetFlow = () => {
    setState("idle");
    setAmount("");
    setPeerInfo("Nearby Device");
  };

  const handleNFCPayment = () => {
    if (mode === "send") {
      payment.mutate(
        { amount: Number(amount), description: "NFC Transfer", metadata: { method: "nfc" } },
        {
          onSuccess: () => setState("success"),
          onError: () => setState("found"),
        }
      );
    } else {
      setState("success");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">NFC Transfer</h1>
        {nfcSupported === false && (
          <span className="ml-auto rounded-full bg-warning/15 px-2.5 py-0.5 text-[10px] font-medium text-warning">Demo Mode</span>
        )}
      </div>

      <div className="mx-5 mt-5 flex rounded-xl bg-secondary p-1">
        <button onClick={() => { setMode("send"); resetFlow(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${mode === "send" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          <Send className="h-3.5 w-3.5" /> Send
        </button>
        <button onClick={() => { setMode("receive"); resetFlow(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${mode === "receive" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          <ArrowDownLeft className="h-3.5 w-3.5" /> Receive
        </button>
      </div>

      <div className="pt-8">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5">
              <div className="mb-6">
                <label className="text-xs font-medium text-muted-foreground">
                  {mode === "send" ? "Amount to Send" : "Amount to Request (optional)"}
                </label>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-muted-foreground">Rs.</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder={mode === "send" ? "0" : "Any amount"}
                    className="flex-1 bg-transparent font-display text-4xl font-bold text-foreground placeholder:text-muted outline-none" />
                </div>
                <div className="mt-3 flex gap-2">
                  {[500, 1000, 2000].map((a) => (
                    <button key={a} onClick={() => setAmount(String(a))} className="flex-1 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground">
                      {a.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={startNFC} disabled={mode === "send" && !amount}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40">
                {mode === "send" ? "Start NFC Transfer" : "Start Receiving"}
              </button>
            </motion.div>
          )}

          {state === "unsupported" && (
            <motion.div key="unsupported" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center px-5 pt-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/15">
                <AlertTriangle className="h-10 w-10 text-warning" />
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold">NFC Not Available</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">NFC is not supported on this device or browser. Try using Chrome on an Android device with NFC.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={resetFlow} className="rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-foreground">Go Back</button>
                <button onClick={() => { setState("searching"); setTimeout(() => setState("found"), 2500); }}
                  className="rounded-xl bg-primary/15 px-6 py-2.5 text-sm font-medium text-primary">Try Demo</button>
              </div>
            </motion.div>
          )}

          {state === "searching" && (
            <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pt-10 px-5">
              <div className="relative">
                <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                <motion.div className="absolute inset-0 rounded-full bg-primary/15" animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-12 w-12 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="mt-8 font-display text-lg font-semibold">{mode === "send" ? "Searching for device..." : "Waiting for sender..."}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Hold phones close together</p>
              <button onClick={resetFlow} className="mt-6 rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-foreground">Cancel</button>
            </motion.div>
          )}

          {state === "found" && (
            <motion.div key="found" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5">
              <div className="wallox-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
                    <span className="text-lg font-bold text-accent">{peerInfo[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{peerInfo}</h3>
                    <p className="text-xs text-muted-foreground">NFC Transfer</p>
                  </div>
                </div>
                <div className="mt-4 h-px bg-border" />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{mode === "send" ? "Sending" : "Receiving"}</span>
                  <span className="font-display text-xl font-bold">{displayAmount}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={resetFlow} className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium text-foreground">Cancel</button>
                <button onClick={() => setState("verify")} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
                  {mode === "send" ? "Confirm & Send" : "Accept"}
                </button>
              </div>
            </motion.div>
          )}

          {state === "verify" && (
            <PinVerification key="verify"
              summaryItems={[
                { label: mode === "send" ? "Sending" : "Receiving", value: displayAmount },
                { label: "Method", value: "NFC Transfer" },
              ]}
              onSuccess={handleNFCPayment}
              onCancel={() => setState("found")}
            />
          )}

          {state === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-12 px-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <Check className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h3 className="mt-6 font-display text-xl font-bold">{mode === "send" ? "Transfer Successful!" : "Payment Received!"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{displayAmount} {mode === "send" ? "sent" : "received"} via NFC</p>
              <button onClick={resetFlow} className="mt-8 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground">Done</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NFCPage;
