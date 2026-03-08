import { ArrowLeft, Phone, Mail, Hash, User, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PinVerification from "@/components/PinVerification";

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

const SendMoneyPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<SendMethod>("phone");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"recipient" | "amount" | "verify" | "success">("recipient");

  const config = methodConfig[method];

  const goBack = () => {
    if (step === "recipient") navigate("/");
    else if (step === "amount") setStep("recipient");
    else if (step === "verify") setStep("amount");
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
              onClick={() => setStep("verify")}
              disabled={!amount}
              className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Send Rs. {amount ? Number(amount).toLocaleString() : "0"}
            </button>
          </motion.div>
        )}

        {step === "verify" && (
          <PinVerification
            key="verify"
            summaryItems={[
              { label: "To", value: recipient },
              { label: "Amount", value: `Rs. ${Number(amount).toLocaleString()}` },
            ]}
            onSuccess={() => setStep("success")}
            onCancel={() => setStep("amount")}
          />
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
              onClick={() => { setStep("recipient"); setRecipient(""); setAmount(""); }}
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
