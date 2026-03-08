import { ArrowLeft, Upload, Camera, FileCheck, AlertCircle, Clock, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type DocType = "citizenship" | "passport" | "drivers_license" | "national_id";

const docTypeLabels: Record<DocType, string> = {
  citizenship: "Citizenship Certificate",
  passport: "Passport",
  drivers_license: "Driver's License",
  national_id: "National ID Card",
};

const KYCPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"info" | "documents" | "selfie" | "review" | "submitted">("info");
  const [docType, setDocType] = useState<DocType>("citizenship");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [docFrontPreview, setDocFrontPreview] = useState<string | null>(null);
  const [docBackPreview, setDocBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const { data: existingKyc, isLoading } = useQuery({
    queryKey: ["kyc", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleFileSelect = (
    file: File | null,
    setter: (f: File | null) => void,
    previewSetter: (s: string | null) => void
  ) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" });
      return;
    }
    setter(file);
    const reader = new FileReader();
    reader.onload = (e) => previewSetter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from("kyc-documents")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const handleSubmit = async () => {
    if (!user || !docFront || !selfie) return;
    setSubmitting(true);
    try {
      const uid = user.id;
      const frontPath = await uploadFile(docFront, `${uid}/doc-front-${Date.now()}`);
      let backPath: string | null = null;
      if (docBack) {
        backPath = await uploadFile(docBack, `${uid}/doc-back-${Date.now()}`);
      }
      const selfiePath = await uploadFile(selfie, `${uid}/selfie-${Date.now()}`);

      const { error } = await supabase.from("kyc_submissions").insert({
        user_id: uid,
        document_type: docType,
        document_front_url: frontPath,
        document_back_url: backPath,
        selfie_url: selfiePath,
        full_name: fullName,
        date_of_birth: dob,
        document_number: docNumber,
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      setStep("submitted");
      toast({ title: "KYC Submitted!", description: "Your documents are under review." });
    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show status if already submitted
  if (existingKyc) {
    const statusConfig = {
      pending: { icon: Clock, color: "text-warning", bg: "bg-warning/15", label: "Under Review", desc: "Your documents are being verified. This usually takes 1-2 business days." },
      approved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/15", label: "Verified", desc: "Your identity has been verified. You have full access to all features." },
      rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/15", label: "Rejected", desc: existingKyc.rejection_reason || "Your submission was rejected. Please resubmit with valid documents." },
    };
    const cfg = statusConfig[existingKyc.status as keyof typeof statusConfig];
    const Icon = cfg.icon;

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-semibold">KYC Verification</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-8">
          <div className="flex flex-col items-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${cfg.bg}`}>
              <Icon className={`h-10 w-10 ${cfg.color}`} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-foreground">{cfg.label}</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">{cfg.desc}</p>
          </div>

          <div className="mt-8 wallox-card p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{existingKyc.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Document</span>
              <span className="font-medium text-foreground">{docTypeLabels[existingKyc.document_type as DocType]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doc Number</span>
              <span className="font-medium text-foreground">{existingKyc.document_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium text-foreground">{new Date(existingKyc.submitted_at).toLocaleDateString()}</span>
            </div>
          </div>

          <button onClick={() => navigate("/settings")} className="mt-6 w-full rounded-xl bg-secondary py-3 text-sm font-medium text-foreground">
            Back to Settings
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => {
            if (step === "info") navigate("/settings");
            else if (step === "documents") setStep("info");
            else if (step === "selfie") setStep("documents");
            else if (step === "review") setStep("selfie");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">KYC Verification</h1>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mt-4 flex gap-1.5">
        {["info", "documents", "selfie", "review"].map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
            ["info", "documents", "selfie", "review"].indexOf(step) >= i ? "bg-primary" : "bg-secondary"
          }`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "info" && (
          <motion.div key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name (as on document)</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full legal name"
                  className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                <div className="mt-1.5 relative">
                  <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)}
                    className="w-full appearance-none rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary/50">
                    {Object.entries(docTypeLabels).map(([k, v]) => (
                      <option key={k} value={k} className="bg-card text-foreground">{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Document Number</label>
                <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Enter document number"
                  className="mt-1.5 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50" />
              </div>

              <button onClick={() => setStep("documents")}
                disabled={!fullName || !dob || !docNumber}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "documents" && (
          <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Upload Document</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Upload clear photos of your {docTypeLabels[docType]}</p>

            <div className="space-y-4">
              {/* Front */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Front Side *</label>
                <input ref={frontInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setDocFront, setDocFrontPreview)} />
                {docFrontPreview ? (
                  <div className="mt-1.5 relative rounded-xl overflow-hidden">
                    <img src={docFrontPreview} alt="Front" className="w-full h-40 object-cover rounded-xl" />
                    <button onClick={() => frontInputRef.current?.click()}
                      className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
                      Change
                    </button>
                  </div>
                ) : (
                  <button onClick={() => frontInputRef.current?.click()}
                    className="mt-1.5 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 transition-colors hover:border-primary/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Tap to upload or take photo</span>
                  </button>
                )}
              </div>

              {/* Back */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Back Side (optional)</label>
                <input ref={backInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setDocBack, setDocBackPreview)} />
                {docBackPreview ? (
                  <div className="mt-1.5 relative rounded-xl overflow-hidden">
                    <img src={docBackPreview} alt="Back" className="w-full h-40 object-cover rounded-xl" />
                    <button onClick={() => backInputRef.current?.click()}
                      className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
                      Change
                    </button>
                  </div>
                ) : (
                  <button onClick={() => backInputRef.current?.click()}
                    className="mt-1.5 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-6 transition-colors hover:border-primary/50">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Tap to upload back side</span>
                  </button>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-warning/10 p-3">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">Ensure text is clearly visible, no glare, and all corners are visible.</p>
              </div>

              <button onClick={() => setStep("selfie")} disabled={!docFront}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "selfie" && (
          <motion.div key="selfie" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Take a Selfie</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Take a clear photo of your face for identity matching</p>

            <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setSelfie, setSelfiePreview)} />

            {selfiePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={selfiePreview} alt="Selfie" className="w-full h-64 object-cover rounded-2xl" />
                <button onClick={() => selfieInputRef.current?.click()}
                  className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-4 py-2 text-xs font-medium text-white">
                  Retake
                </button>
              </div>
            ) : (
              <button onClick={() => selfieInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 transition-colors hover:border-primary/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Tap to take selfie</span>
              </button>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 rounded-xl bg-info/10 p-3">
                <AlertCircle className="h-4 w-4 text-info shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Look directly at the camera</p>
                  <p>• Ensure good lighting, no shadows</p>
                  <p>• Remove glasses, hats, or face coverings</p>
                </div>
              </div>
            </div>

            <button onClick={() => setStep("review")} disabled={!selfie}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
              Review & Submit
            </button>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Review Submission</h2>
            </div>

            <div className="wallox-card p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium text-foreground">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium text-foreground">{dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Type</span>
                <span className="font-medium text-foreground">{docTypeLabels[docType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document No.</span>
                <span className="font-medium text-foreground">{docNumber}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {docFrontPreview && <img src={docFrontPreview} alt="Front" className="h-20 w-full object-cover rounded-xl" />}
              {docBackPreview && <img src={docBackPreview} alt="Back" className="h-20 w-full object-cover rounded-xl" />}
              {selfiePreview && <img src={selfiePreview} alt="Selfie" className="h-20 w-full object-cover rounded-xl" />}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning/10 p-3">
              <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">By submitting, you confirm that all information is accurate and the documents are genuine.</p>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
              {submitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </motion.div>
        )}

        {step === "submitted" && (
          <motion.div key="submitted" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center px-5 pt-16">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h3 className="mt-6 font-display text-xl font-bold">Submitted!</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
              Your documents are under review. You'll be notified once verified (1-2 business days).
            </p>
            <button onClick={() => navigate("/settings")}
              className="mt-8 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground">
              Back to Settings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYCPage;
