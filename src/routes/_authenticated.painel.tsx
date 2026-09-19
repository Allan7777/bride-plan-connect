import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ArrowRight, Eye, Heart, Images, MessageCircle, MousePointer2, Store, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AccountGuard } from "@/components/account-guard";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { VENDOR_STATUS_LABELS } from "@/lib/noivahub";

export const Route=createFileRoute("/_authenticated/painel")({head:()=>({meta:[{title:"Painel do fornecedor — NoivaHub"},{name:"description",content:"Acompanhe seu perfil, portfólio, consultas e desempenho no NoivaHub."}]}),component:Painel});
function Painel(){return <AccountGuard type="vendor">{account=><Vendor account={account}/>}</AccountGuard>}
const chartConfig={views:{label:"Visualizações",color:"#10b981"},requests:{label:"Consultas",color:"#0f172a"}} satisfies ChartConfig;

function Vendor({account}:{account:NonNullable<ReturnType<typeof import("@/hooks/useAuth").useAccount>["data"]>}){
  const {data,isLoading}=useQuery({queryKey:["vendor-dashboard",account.vendorId],enabled:!!account.vendorId,queryFn:async()=>{
    const vendorId=account.vendorId??""; const since=new Date(); since.setDate(since.getDate()-29);
    const[{data:v},{count:leads},{count:favorites},{count:photos},{data:events}]=await Promise.all([
      supabase.from("vendors").select("views,whatsapp_clicks,rating,reviews_count,company_name,status,slug").eq("id",vendorId).maybeSingle(),
      supabase.from("leads").select("id",{count:"exact",head:true}).eq("vendor_id",vendorId),
      supabase.from("favorites").select("id",{count:"exact",head:true}).eq("vendor_id",vendorId),
      supabase.from("vendor_photos").select("id",{count:"exact",head:true}).eq("vendor_id",vendorId),
      supabase.from("vendor_events").select("event_type,created_at").eq("vendor_id",vendorId).gte("created_at",since.toISOString()).order("created_at")
    ]);
    const chart=Array.from({length:30},(_,offset)=>{const day=new Date(since);day.setDate(since.getDate()+offset);const key=day.toISOString().slice(0,10);const dayEvents=(events??[]).filter(e=>e.created_at.slice(0,10)===key);return{day:day.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),views:dayEvents.filter(e=>e.event_type==="profile_view").length,requests:dayEvents.filter(e=>e.event_type==="budget_request").length}});
    return{v,leads:leads??0,favorites:favorites??0,photos:photos??0,budgetRequests:(events??[]).filter(e=>e.event_type==="budget_request").length,chart};
  }});
  const metrics=[
    {l:"Visualizações",v:data?.v?.views??0,i:Eye,help:"pessoas viram sua vitrine"},
    {l:"Favoritos",v:data?.favorites??0,i:Heart,help:"noivas salvaram seu perfil"},
    {l:"Orçamentos",v:data?.budgetRequests??0,i:MessageCircle,help:"consultas nos últimos 30 dias"},
    {l:"WhatsApp",v:data?.v?.whatsapp_clicks??0,i:MousePointer2,help:"cliques para conversar"},
    {l:"Leads",v:data?.leads??0,i:TrendingUp,help:"oportunidades recebidas"}
  ];
  return <AppShell type="vendor"><div className="mx-auto max-w-7xl p-5 md:p-10">
    <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end">
      <div><span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">Central do fornecedor</span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Olá, {account.profile?.full_name?.split(" ")[0] ?? "fornecedor"}.</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Acompanhe oportunidades, fortaleça sua vitrine e transforme visitas em novos clientes.</p></div>
      <Button asChild className="bg-slate-950 text-white hover:bg-slate-800"><Link to="/painel/perfil"><Store className="mr-2 size-4"/>Editar minha vitrine</Link></Button>
    </header>
    <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg"><p className="text-sm font-medium text-slate-400">Status da empresa</p><div className="mt-3 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">{data?.v?.company_name || "Sua empresa"}</h2><p className="mt-1 text-sm text-slate-300">{account.vendorStatus?VENDOR_STATUS_LABELS[account.vendorStatus]:"Complete seu cadastro para publicar sua vitrine."}</p></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-300">{account.vendorStatus==="aprovado"?"Vitrine ativa":"Cadastro em análise"}</span></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Portfólio</p><p className="mt-1 text-2xl font-bold text-slate-950">{isLoading?"—":data?.photos??0} imagens</p></div><Images className="size-8 text-emerald-500"/></div><Button asChild variant="ghost" className="mt-4 h-auto p-0 text-emerald-700 hover:bg-transparent hover:text-emerald-900"><Link to="/painel/perfil">Gerenciar portfólio <ArrowRight className="ml-1 size-4"/></Link></Button></div>
    </section>
    <h2 className="mt-10 text-xl font-bold text-slate-950">Desempenho do negócio</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(x=><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={x.l}><div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><x.i className="size-5"/></div><p className="mt-4 text-3xl font-bold text-slate-950">{isLoading?"—":x.v}</p><p className="mt-1 text-sm font-semibold text-slate-800">{x.l}</p><p className="mt-1 text-xs text-slate-500">{x.help}</p></div>)}</div>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-950">Movimento dos últimos 30 dias</h3><p className="mt-1 text-sm text-slate-500">Visualizações e pedidos de orçamento gerados pela sua vitrine.</p></div><Button asChild variant="outline"><Link to="/painel/leads">Abrir oportunidades</Link></Button></div>
      <ChartContainer config={chartConfig} className="mt-6 h-72 w-full"><AreaChart data={data?.chart??[]}><defs><linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.03}/></linearGradient></defs><CartesianGrid vertical={false}/><XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={28}/><ChartTooltip content={<ChartTooltipContent/>}/><Area dataKey="views" type="monotone" fill="url(#fillViews)" stroke="#10b981"/><Area dataKey="requests" type="monotone" fill="#0f172a" fillOpacity={0.08} stroke="#0f172a"/></AreaChart></ChartContainer>
    </section>
    <div className="mt-6 flex flex-wrap gap-3"><Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700"><Link to="/painel/leads">Ver todos os leads</Link></Button><Button asChild variant="outline"><Link to="/painel/perfil">Completar vitrine</Link></Button>{data?.v?.slug&&account.vendorStatus==="aprovado"?<Button asChild variant="outline"><Link to="/fornecedor/$slug" params={{slug:data.v.slug}}>Ver perfil público</Link></Button>:null}</div>
  </div></AppShell>;
}
