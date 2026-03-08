import { ArrowLeft, Search, ChevronRight, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { billCategories } from "@/data/mockData";
import { motion } from "framer-motion";
import { useState } from "react";
import PinVerification from "@/components/PinVerification";

const savedContacts = [
  { name: "Bivaan Gurung", phone: "+977 98XXXXXX91" },
  { name: "Arun Sharma", phone: "+977 98XXXXXX12" },
  { name: "Priya Thapa", phone: "+977 98XXXXXX34" },
];

const BillsPage = () => {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selected = billCategories.find((b) => b.id === selectedBill);
  const isMobileTopup = selectedBill === "mobile";

  const paymentAmount = isMobileTopup ? `Rs. ${Number(customerId).toLocaleString()}` : "Rs. 2,340";

  const resetAll = () => {
    setShowConfirm(false);
    setShowVerify(false);
    setShowSuccess(false);
    setSelectedBill(null);
    setCustomerId("");
    setPhoneNumber("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => {
            if (showVerify) { setShowVerify(false); }
            else if (showConfirm) { setShowConfirm(false); }
            else if (selectedBill) { setSelectedBill(null); setCustomerId(""); setPhoneNumber(""); }
            else navigate("/");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Bill Payments</h1>
      </div>

      {showSuccess ? (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center px-5 pt-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary"
          >
            <span className="text-3xl text-primary-foreground">✓</span>
          </motion.div>
          <h3 className="mt-6 font-display text-xl font-bold">Payment Successful!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {paymentAmount} paid for {isMobileTopup ? "Mobile Recharge" : selected?.name}
          </p>
          <button onClick={resetAll} className="mt-8 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground">
            Done
          </button>
        </motion.div>
      ) : showVerify ? (
        <PinVerification
          summaryItems={[
            { label: "Service", value: isMobileTopup ? "Mobile Recharge" : selected?.name || "" },
            ...(isMobileTopup ? [{ label: "Phone", value: phoneNumber }] : [{ label: "Customer ID", value: customerId }]),
            { label: "Amount", value: paymentAmount },
          ]}
          onSuccess={() => { setShowVerify(false); setShowSuccess(true); }}
          onCancel={() => setShowVerify(false)}
        />
      ) : !selectedBill ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-5">
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search bills..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {billCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedBill(cat.id)}
                className="wallox-card flex items-center gap-3 p-4 text-left transition-colors hover:bg-card-elevated"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.color}`}>
                  <span className="text-lg">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-[11px] text-muted-foreground">{cat.provider}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : !showConfirm ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected?.color}`}>
              <span className="text-2xl">{selected?.icon}</span>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">{selected?.name}</h2>
              <p className="text-xs text-muted-foreground">{selected?.provider}</p>
            </div>
          </div>

          {isMobileTopup ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary px-3 py-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Or select from contacts</label>
                <div className="space-y-1.5">
                  {savedContacts.map((c) => (
                    <button
                      key={c.phone}
                      onClick={() => setPhoneNumber(c.phone)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Recharge Amount</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[100, 200, 500, 1000].map((a) => (
                    <button
                      key={a}
                      onClick={() => setCustomerId(String(a))}
                      className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${
                        customerId === String(a) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      Rs.{a}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={!phoneNumber || !customerId}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                Recharge Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Customer ID / Meter No.</label>
                <input
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter your customer ID"
                  className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50"
                />
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={!customerId}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                Fetch Bill Details
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-6">
          <div className="wallox-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected?.color}`}>
                <span className="text-lg">{selected?.icon}</span>
              </div>
              <h3 className="font-display text-sm font-semibold">
                {isMobileTopup ? "Mobile Recharge" : `${selected?.name} Bill`}
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              {isMobileTopup ? (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{phoneNumber}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Operator</span><span className="font-medium">Auto-detected</span></div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-display text-lg font-bold text-foreground">Rs. {Number(customerId).toLocaleString()}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Customer ID</span><span className="font-medium">{customerId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bill Period</span><span className="font-medium">Feb 2026</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium text-warning">Mar 15, 2026</span></div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount Due</span><span className="font-display text-lg font-bold text-foreground">Rs. 2,340</span></div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowVerify(true)}
            className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
          >
            {isMobileTopup ? `Recharge Rs. ${Number(customerId).toLocaleString()}` : "Pay Rs. 2,340"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BillsPage;
