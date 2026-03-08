import { ArrowLeft, ScanLine, Camera, CameraOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const QRPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"scan" | "show">("scan");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError(true);
    }
  };

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);
  useEffect(() => { if (mode !== "scan") stopCamera(); }, [mode, stopCamera]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">QR Payments</h1>
      </div>

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
          {cameraError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
              <CameraOff className="h-4 w-4" /> Camera access denied. Check permissions.
            </div>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">{cameraActive ? "Point your camera at a QR code" : "Open camera to scan QR codes"}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={cameraActive ? stopCamera : startCamera} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
              <Camera className="h-4 w-4" /> {cameraActive ? "Stop Camera" : "Open Camera"}
            </button>
            <button className="rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-foreground">Upload from Gallery</button>
          </div>
        </motion.div>
      ) : (
        <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center px-5 pt-8">
          <div className="wallox-card p-6 text-center">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-foreground">
              <div className="grid grid-cols-5 gap-1 p-4">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`h-6 w-6 rounded-sm ${[0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 22, 23, 24].includes(i) ? "bg-background" : "bg-foreground"}`} />
                ))}
              </div>
            </div>
            <h3 className="mt-4 font-display text-base font-semibold">{profile?.full_name ?? "Wallox User"}</h3>
            <p className="text-xs text-muted-foreground">wallox://pay/{profile?.wallox_id ?? ""}</p>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">Share this QR code to receive payments</p>
          <div className="mt-3 flex gap-3">
            <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Share QR</button>
            <button className="rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-foreground">Save Image</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QRPage;
