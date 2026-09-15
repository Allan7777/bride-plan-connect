import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export type AccountInfo = {
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    type: "bride" | "vendor";
  } | null;
  isAdmin: boolean;
  vendorId: string | null;
  vendorStatus: string | null;
  brideOnboarded: boolean;
};

export function useAccount(userId?: string | null) {
  return useQuery({
    queryKey: ["account", userId],
    enabled: !!userId,
    queryFn: async (): Promise<AccountInfo> => {
      const [{ data: profile }, { data: roles }, { data: vendor }, { data: bride }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId!),
          supabase.from("vendors").select("id,status").eq("user_id", userId!).maybeSingle(),
          supabase.from("brides").select("onboarded").eq("id", userId!).maybeSingle(),
        ]);
      return {
        profile: (profile as AccountInfo["profile"]) ?? null,
        isAdmin: !!roles?.some((r) => r.role === "admin"),
        vendorId: vendor?.id ?? null,
        vendorStatus: vendor?.status ?? null,
        brideOnboarded: !!bride?.onboarded,
      };
    },
  });
}
