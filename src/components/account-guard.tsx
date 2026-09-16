import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useSession } from "@/hooks/useAuth";

export function AccountGuard({ type, children }: { type?: "bride" | "vendor"; children: (account: NonNullable<ReturnType<typeof useAccount>["data"]>) => React.ReactNode }) {
  const { user, loading } = useSession();
  const { data: account, isLoading } = useAccount(user?.id);
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (account?.profile && type && account.profile.type !== type) navigate({ to: account.profile.type === "vendor" ? "/painel" : "/noiva" });
  }, [loading, user, account, type, navigate]);
  if (loading || isLoading || !account) return <div className="p-6"><Skeleton className="h-80 w-full" /></div>;
  return <>{children(account)}</>;
}
