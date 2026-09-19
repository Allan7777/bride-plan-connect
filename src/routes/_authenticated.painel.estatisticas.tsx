import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, MessageCircle, MousePointer2, TrendingUp } from "lucide-react";
import { AccountGuard } from "@/components/account-guard";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route=createFileRoute("/_authenticated/painel/estatisticas")({component:Page});
function Page(){return <AccountGuard type="vendor">{a=><Stats vendorId={a.vendorId}/>}</AccountGuard>}
function Stats({vendorId}:{vendorId:string|null}){
 const {data,isLoading}=useQuery({queryKey:["vendor-stats",vendorId],enabled:!!vendorId,queryFn:async()=>{const[{data:v},{count:f},{count:l},{data:e}]=await Promise.all([supabase.from("vendors").select("views,whatsapp_clicks").eq("id",vendorId??"").maybeSingle(),supabase.from("favorites").select("id",{count:"exact",head:true}).eq("vendor_id",vendorId??""),supabase.from("leads").select("id",{count:"exact",head:true}).eq("vendor_id",vendorId??""),supabase.from("vendor_events").select("event_type").eq("vendor_id",vendorId??"")]);return{views:v?.views??0,whatsapp:v?.whatsapp_clicks??0,favorites:f??0,leads:l??0,requests:(e??[]).filter(x=>x.event_type==="budget_request").length}}});
 const cards=[["Visualizações",data?.views,Eye],["Favoritos",data?.favorites,Heart],["Pedidos de orçamento",data?.requests,MessageCircle],["Cliques no WhatsApp",data?.whatsapp,MousePointer2],["Leads",data?.leads,TrendingUp]] as const;
 return <AppShell type="vendor"><div className="mx-auto max-w-6xl p-5 md:p-10"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">Desempenho</span><h1 className="mt-4 text-4xl font-extrabold">Estatísticas</h1><p className="mt-2 text-slate-600">Entenda como sua vitrine está performando no NoivaHub.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="size-5"/></div><p className="mt-5 text-4xl font-bold">{isLoading?"—":value??0}</p><p className="mt-1 text-sm font-medium text-slate-600">{label}</p></div>)}</div></div></AppShell>
}