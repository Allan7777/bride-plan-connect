import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Bell, BriefcaseBusiness, Heart, Home, ListChecks, LogOut, Search, Settings, Store, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const brideLinks=[{to:"/noiva",label:"Início",icon:Home},{to:"/meu-casamento",label:"Meu Casamento",icon:ListChecks},{to:"/fornecedores",label:"Buscar",icon:Search},{to:"/favoritos",label:"Favoritos",icon:Heart},{to:"/contatos",label:"Contatos",icon:Bell},{to:"/assinatura",label:"Assinatura",icon:WalletCards},{to:"/meu-perfil",label:"Perfil",icon:UserRound}] as const;
const vendorLinks=[
 {to:"/painel",label:"Dashboard",icon:Home},
 {to:"/painel/leads",label:"Oportunidades",icon:BriefcaseBusiness},
 {to:"/painel/perfil",label:"Vitrine profissional",icon:Store},
 {to:"/painel/estatisticas",label:"Estatísticas",icon:BarChart3},
 {to:"/assinatura",label:"Assinatura",icon:WalletCards},
 {to:"/painel/configuracoes",label:"Configurações",icon:Settings},
] as const;

export function AppShell({type,children}:{type:"bride"|"vendor";children:React.ReactNode}){
 const queryClient=useQueryClient();const navigate=useNavigate();const links=type==="bride"?brideLinks:vendorLinks;const vendor=type==="vendor";
 async function signOut(){await queryClient.cancelQueries();queryClient.clear();await supabase.auth.signOut();navigate({to:"/auth",replace:true})}
 return <div className={vendor?"min-h-screen bg-slate-50 text-slate-950":"min-h-screen bg-background"}>
  <aside className={vendor?"fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800 bg-slate-950 p-6 text-white lg:block":"fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar p-5 lg:block"}>
   <Link to={vendor?"/painel":"/"} className={vendor?"block text-2xl font-extrabold tracking-tight":"font-display text-2xl"}>{vendor?<>NoivaHub <span className="text-emerald-400">Pro</span></>:<>Noiva<span className="text-gold">Hub</span></>}</Link>
   {vendor&&<p className="mt-2 text-sm text-slate-400">Área do Fornecedor</p>}
   <nav className="mt-10 space-y-1">{links.map((item,index)=><Link key={item.label+index} to={item.to} activeOptions={{exact:true}} className={vendor?"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white":"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"} activeProps={{className:vendor?"flex items-center gap-3 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950":"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium"}}><item.icon className="size-4"/>{item.label}</Link>)}</nav>
   <Button variant="ghost" className={vendor?"absolute bottom-6 left-6 right-6 justify-start gap-2 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white":"absolute bottom-6 left-5 gap-2"} onClick={signOut}><LogOut className="size-4"/>Sair</Button>
  </aside>
  <main className={vendor?"pb-24 lg:ml-72 lg:pb-0":"pb-24 lg:ml-64 lg:pb-0"}>{children}</main>
  <nav className={vendor?"fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-800 bg-slate-950 px-2 text-white lg:hidden":"fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 px-2 backdrop-blur lg:hidden"}>{links.slice(0,4).map((item,index)=><Link key={item.label+index} to={item.to} activeOptions={{exact:true}} className={vendor?"flex min-w-16 flex-col items-center gap-1 text-[10px] text-slate-400":"flex min-w-14 flex-col items-center gap-1 text-[10px] text-muted-foreground"} activeProps={{className:vendor?"flex min-w-16 flex-col items-center gap-1 text-[10px] font-semibold text-emerald-400":"flex min-w-14 flex-col items-center gap-1 text-[10px] text-foreground"}}><item.icon className="size-5"/>{item.label}</Link>)}</nav>
 </div>
}
