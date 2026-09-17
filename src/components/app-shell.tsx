import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, Home, Images, ListChecks, LogOut, Search, Store, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const brideLinks = [
  { to: "/noiva", label: "Início", icon: Home },
  { to: "/meu-casamento", label: "Meu Casamento", icon: ListChecks },
  { to: "/fornecedores", label: "Buscar", icon: Search },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/contatos", label: "Contatos", icon: Bell },
  { to: "/assinatura", label: "Assinatura", icon: WalletCards },
  { to: "/meu-perfil", label: "Perfil", icon: UserRound },
] as const;

const vendorLinks = [
  { to: "/painel", label: "Dashboard", icon: Home },
  { to: "/painel/leads", label: "Leads", icon: Bell },
  { to: "/painel/perfil", label: "Perfil", icon: Store },
  { to: "/painel/perfil", label: "Portfólio", icon: Images },
  { to: "/assinatura", label: "Assinatura", icon: WalletCards },
] as const;

export function AppShell({
  type,
  children,
}: {
  type: "bride" | "vendor";
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const links = type === "bride" ? brideLinks : vendorLinks;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar p-5 lg:block">
        <Link to="/" className="font-display text-2xl">Noiva<span className="text-gold">Hub</span></Link>
        <nav className="mt-10 space-y-1">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" className="absolute bottom-6 left-5 gap-2" onClick={signOut}>
          <LogOut className="size-4" /> Sair
        </Button>
      </aside>
      <main className="pb-24 lg:ml-64 lg:pb-0">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 px-2 backdrop-blur lg:hidden">
        {links.slice(0, 5).map((item) => (
          <Link key={item.to} to={item.to} className="flex min-w-14 flex-col items-center gap-1 text-[10px] text-muted-foreground" activeProps={{ className: "flex min-w-14 flex-col items-center gap-1 text-[10px] text-foreground" }}>
            <item.icon className="size-5" /> {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
