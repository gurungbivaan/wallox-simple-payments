import { ArrowLeft, HelpCircle, MessageCircle, Mail, FileText, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  { q: "How do I add money to my wallet?", a: "Tap the 'Add Money' button on your balance card. You can top up using linked bank accounts, cards, or mobile banking. For testing, use the simulated top-up feature." },
  { q: "How do I send money to someone?", a: "Go to 'Send Money' from the home screen. You can find recipients by phone number, email, or Wallox ID. Enter the amount and confirm with your PIN." },
  { q: "What is KYC verification?", a: "KYC (Know Your Customer) is required to verify your identity. Go to Settings → Profile & KYC to submit your documents. This enables higher transaction limits." },
  { q: "How does NFC transfer work?", a: "NFC allows you to send/receive money by tapping phones together. On Android, hold phones close and follow the prompts. On iOS, NFC reading is supported in Safari and apps." },
  { q: "Is my money safe?", a: "Yes! All transactions are secured with PIN verification and encrypted connections. Your funds are protected by our banking-grade security infrastructure." },
  { q: "What are the transaction limits?", a: "Unverified accounts: Rs. 25,000/day. KYC verified accounts: Rs. 500,000/day. Contact support for higher limits." },
];

const HelpPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Help & Support</h1>
      </div>

      {/* Contact options */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => window.open("mailto:support@wallox.app")}
          className="wallox-card flex flex-col items-center gap-2 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs font-medium text-foreground">Email Support</p>
          <p className="text-[10px] text-muted-foreground">support@wallox.app</p>
        </motion.button>
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="wallox-card flex flex-col items-center gap-2 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <MessageCircle className="h-5 w-5 text-success" />
          </div>
          <p className="text-xs font-medium text-foreground">Live Chat</p>
          <p className="text-[10px] text-muted-foreground">Available 24/7</p>
        </motion.button>
      </div>

      {/* FAQs */}
      <div className="px-5 pt-6">
        <h2 className="font-display text-sm font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="wallox-card flex w-full items-center gap-3 p-4 text-left"
              >
                <HelpCircle className="h-4 w-4 shrink-0 text-info" />
                <span className="flex-1 text-sm font-medium text-foreground">{faq.q}</span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden px-4 pb-3">
                  <p className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="mx-5 mt-6 wallox-card p-4 text-center">
        <p className="text-xs font-medium text-foreground">Wallox v1.0.0</p>
        <p className="mt-1 text-[10px] text-muted-foreground">Made in Nepal 🇳🇵</p>
        <div className="mt-2 flex justify-center gap-4">
          <button className="text-[10px] text-primary">Terms of Service</button>
          <button className="text-[10px] text-primary">Privacy Policy</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
