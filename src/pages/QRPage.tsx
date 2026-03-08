import { ArrowLeft, ScanLine, Camera, CameraOff, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import PinVerification from "@/components/PinVerification";
import { useLookupUser, useTransfer } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

const QRPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"scan" | "show">("scan");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Payment flow state
  const [scannedUser, setScannedUser] = useState<{ user_id: string; full_name: string; wallox_id: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"scan" | "amount" | "verify" | "success">("scan");

  const lookupUser = useLookupUser();
  const transfer = useTransfer();

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

  // Generate real QR code
  useEffect(() => {
    if (profile?.wallox_id) {
      QRCode.toDataURL(`wallox://pay/${profile.wallox_id}`, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      }).then(setQrDataUrl);
    }
  }, [profile?.wallox_id]);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const processQRData = useCallback(async (data: string) => {
    stopCamera();
    // Parse wallox://pay/wallox-xxxxxxxx
    const match = data.match(/wallox:\/\/pay\/(wallox-[a-z0-9]+)/i);
    if (!match) {
      toast({ title: "Invalid QR Code", description: "This QR code is not a valid Wallox payment code.", variant: "destructive" });
      return;
    }
    const walloxId = match[1];
    if (walloxId === profile?.wallox_id) {
      toast({ title: "Can't pay yourself", variant: "destructive" });
      return;
    }
    try {
      const found = await lookupUser.mutateAsync({ identifier: walloxId, method: "wallox" });
      setScannedUser(found);
      setStep("amount");
    } catch {
      toast({ title: "User Not Found", description: "No user found for this QR code.", variant: "destructive" });
    }
  }, [stopCamera, profile?.wallox_id, lookupUser, toast]);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Use BarcodeDetector API if available
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              processQRData(barcodes[0].rawValue);
            }
          } catch {}
        }, 500);
      } else {
        // Fallback: scan with canvas
        scanIntervalRef.current = window.setInterval(() => {
          if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          // Without jsQR, we can't decode in fallback. Show manual entry option.
        }, 1000);
      }
    } catch {
      setCameraError(true);
    }
  };

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);
  useEffect(() => { if (mode !== "scan") stopCamera(); }, [mode, stopCamera]);

  const handleTransfer = () => {
    if (!scannedUser) return;
    transfer.mutate(
      { receiverId: scannedUser.user_id, amount: Number(amount), description: `QR Payment to ${scannedUser.full_name}` },
      {
        onSuccess: () => setStep("success"),
        onError: () => setStep("amount"),
      }
    );
  };

  const resetFlow = () => {
    setStep("scan");
    setScannedUser(null);
    setAmount("");
  };

  const shareQR = async () => {
    if (!qrDataUrl) return;
    try {
      const blob = await (await fetch(qrDataUrl)).blob();
      const file = new File([blob], "wallox-qr.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({ files: [file], title: "My Wallox QR Code" });
      } else {
        toast({ title: "Share not supported", description: "Use Save Image instead." });
      }
    } catch {}
  };

  const saveQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `wallox-qr-${profile?.wallox_id}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => { if (step !== "scan") resetFlow(); else navigate("/"); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">QR Payments</h1>
      </div>

      {step === "scan" && (
        <>
          <div className="mx-5 mt-5 flex rounded-xl bg-secondary p-1">
            <button onClick={() => setMode("scan")} className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${mode === "scan" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Scan QR</button>
            <button onClick={() => setMode("show")} className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${mode === "show" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>My QR</button>
          </div>

          {mode === "scan" ? (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center px-5 pt-10">
              <div className="wallox-qr-frame relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl bg-card">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
                    <motion.div className="absolute left-3 right-3 h-0.5 bg-primary z-10" animate={{ y: [-100, 100] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }} />
                  </>
                ) : (
                  <>
                    <motion.div className="absolute left-3 right-3 h-0.5 bg-primary" animate={{ y: [-100, 100] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }} />
                    <ScanLine className="h-16 w-16 text-muted-foreground/30" />
                  </>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              {cameraError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                  <CameraOff className="h-4 w-4" /> Camera access denied. Check permissions.
                </div>
              )}
              <p className="mt-6 text-center text-sm text-muted-foreground">{cameraActive ? "Point your camera at a Wallox QR code" : "Open camera to scan QR codes"}</p>
              <div className="mt-4 flex gap-3">
                <button onClick={cameraActive ? stopCamera : startCamera} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                  <Camera className="h-4 w-4" /> {cameraActive ? "Stop Camera" : "Open Camera"}
                </button>
              </div>
              {!("BarcodeDetector" in window) && cameraActive && (
                <p className="mt-3 text-center text-xs text-warning">QR scanning may not work in this browser. Try Chrome on Android or use manual entry.</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center px-5 pt-8">
              <div className="wallox-card p-6 text-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="My Wallox QR Code" className="mx-auto h-48 w-48 rounded-2xl" />
                ) : (
                  <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-secondary">
                    <p className="text-sm text-muted-foreground">Generating...</p>
                  </div>
                )}
                <h3 className="mt-4 font-display text-base font-semibold">{profile?.full_name ?? "Wallox User"}</h3>
                <p className="text-xs text-muted-foreground font-mono">{profile?.wallox_id ?? ""}</p>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">Share this QR code to receive payments</p>
              <div className="mt-3 flex gap-3">
                <button onClick={shareQR} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Share QR</button>
                <button onClick={saveQR} className="rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-foreground">Save Image</button>
              </div>
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence mode="wait">
        {step === "amount" && scannedUser && (
          <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="px-5 pt-6">
            <div className="wallox-card p-4 flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <span className="font-display text-sm font-bold text-primary">{scannedUser.full_name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{scannedUser.full_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{scannedUser.wallox_id}</p>
              </div>
            </div>
            <label className="text-xs font-medium text-muted-foreground">Amount to Send</label>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-muted-foreground">Rs.</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                className="flex-1 bg-transparent font-display text-4xl font-bold text-foreground placeholder:text-muted outline-none" />
            </div>
            <div className="mt-4 flex gap-2">
              {[500, 1000, 2000, 5000].map((a) => (
                <button key={a} onClick={() => setAmount(String(a))} className="flex-1 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground">
                  {a.toLocaleString()}
                </button>
              ))}
            </div>
            <button onClick={() => setStep("verify")} disabled={!amount || Number(amount) <= 0}
              className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
              Send Rs. {amount ? Number(amount).toLocaleString() : "0"}
            </button>
          </motion.div>
        )}

        {step === "verify" && (
          <PinVerification key="verify"
            summaryItems={[
              { label: "To", value: scannedUser?.full_name ?? "" },
              { label: "Method", value: "QR Payment" },
              { label: "Amount", value: `Rs. ${Number(amount).toLocaleString()}` },
            ]}
            onSuccess={handleTransfer}
            onCancel={() => setStep("amount")}
          />
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center px-5 pt-16">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Check className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h3 className="mt-6 font-display text-xl font-bold">Payment Sent!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Rs. {Number(amount).toLocaleString()} sent to {scannedUser?.full_name}</p>
            <button onClick={() => { resetFlow(); navigate("/"); }} className="mt-8 rounded-xl bg-secondary px-8 py-3 text-sm font-medium text-foreground">Done</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRPage;
