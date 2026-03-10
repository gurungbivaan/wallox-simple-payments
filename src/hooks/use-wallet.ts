import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useTransactions = (limit?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id, limit],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useTransfer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      receiverId,
      amount,
      description,
    }: {
      receiverId: string;
      amount: number;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc("process_transfer", {
        p_sender_id: user!.id,
        p_receiver_id: receiverId,
        p_amount: amount,
        p_description: description || `Transfer to user`,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: any) => {
      toast({ title: "Transfer Failed", description: err.message, variant: "destructive" });
    },
  });
};

export const usePayment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      metadata,
    }: {
      amount: number;
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc("process_payment", {
        p_user_id: user!.id,
        p_amount: amount,
        p_description: description || "Payment",
        p_metadata: metadata || {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: any) => {
      toast({ title: "Payment Failed", description: err.message, variant: "destructive" });
    },
  });
};

export const useTopup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
    }: {
      amount: number;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc("process_topup", {
        p_user_id: user!.id,
        p_amount: amount,
        p_description: description || "Wallet Top Up",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Top Up Successful!" });
    },
    onError: (err: any) => {
      toast({ title: "Top Up Failed", description: err.message, variant: "destructive" });
    },
  });
};

export const useGroupMembers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["group-members", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_group_members");
      if (error) throw error;
      return data as { user_id: string; full_name: string; wallox_id: string; avatar_url: string | null }[];
    },
    enabled: !!user?.id,
  });
};

export const useLookupUser = () => {
  return useMutation({
    mutationFn: async ({
      identifier,
      method,
    }: {
      identifier: string;
      method: "phone" | "email" | "wallox";
    }) => {
      const { data, error } = await supabase.rpc("lookup_user", {
        p_identifier: identifier,
        p_method: method,
      });
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("User not found");
      return data[0] as { user_id: string; full_name: string; wallox_id: string };
    },
  });
};
  return useMutation({
    mutationFn: async ({
      identifier,
      method,
    }: {
      identifier: string;
      method: "phone" | "email" | "wallox";
    }) => {
      const { data, error } = await supabase.rpc("lookup_user", {
        p_identifier: identifier,
        p_method: method,
      });
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("User not found");
      return data[0] as { user_id: string; full_name: string; wallox_id: string };
    },
  });
};
