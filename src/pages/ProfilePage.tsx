import { ArrowLeft, Camera, User, Phone, Mail, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setInitialized(true);
  }

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile Updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Avatar Updated" });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const avatarInitial = profile?.full_name?.[0]?.toUpperCase() ?? "W";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-6">
        <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold">Edit Profile</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/20">
                  <span className="font-display text-3xl font-bold text-primary">{avatarInitial}</span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <p className="mt-3 text-xs font-mono text-muted-foreground">{profile?.wallox_id}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                maxLength={100}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 98XXXXXXXX"
                maxLength={20}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-transparent focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <input
                value={user?.email ?? ""}
                disabled
                className="w-full rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-muted-foreground/60">Email cannot be changed</p>
            </div>

            <div className="wallox-card p-4 flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${profile?.kyc_verified ? "bg-success/15" : "bg-warning/15"}`}>
                {profile?.kyc_verified ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <User className="h-4 w-4 text-warning" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">KYC Status</p>
                <p className="text-xs text-muted-foreground">{profile?.kyc_verified ? "Verified ✓" : "Not verified"}</p>
              </div>
              {!profile?.kyc_verified && (
                <button onClick={() => navigate("/kyc")} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  Verify Now
                </button>
              )}
            </div>

            <button
              onClick={() => updateProfile.mutate()}
              disabled={updateProfile.isPending || (!fullName.trim())}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
