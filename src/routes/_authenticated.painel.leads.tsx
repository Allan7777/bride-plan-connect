import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AccountGuard } from "@/components/account-guard";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_STATUS_LABELS } from "@/lib/noivahub";

export const Route=createFileRoute("/_authenticated/painel/leads")({head:()=>({meta:[{title:"Oportunidades — NoivaHub"},{name:"description",content:"Gerencie as oportunidades recebidas pelo seu perfil."}]}),component:Leads});
function Leads(){return <AccountGuard type="vendor">{a=><LeadsList vendorId={a.vendorId}/>}</AccountGuard>}

function LeadsList({vendorId}:{vendorId:string|null}){
  const qc=useQueryClient();
  const {data=[],isLoading}=useQuery({queryKey:["vendor-leads",vendorId],enabled:!!vendorId,queryFn:async()=>{
    const {data,error}=await supabase.from("leads").select("id,bride_name,city,state,wedding_date,message,status,created_at,categories:category_id(name)").eq("vendor_id",vendorId??"").order("created_at",{ascending:false});
    if(error) throw error;
    return data??[];
  }});
  async function update(id:string,status:string){
    const {error}=await supabase.from("leads").update({status:status as "novo"|"contatado"|"negociacao"|"fechado"|"perdido"}).eq("id",id);
    if(error){toast.error("Não foi possível atualizar o status.");return;}
    toast.success("Status atualizado.");
    await qc.invalidateQueries({queryKey:["vendor-leads",vendorId]});
  }
  return <AppShell type="vendor"><div className="mx-auto max-w-6xl p-5 md:p-10">
    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">Pipeline comercial</span>
    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Oportunidades recebidas</h1>
    <p className="mt-2 text-slate-600">Acompanhe cada noiva interessada e atualize a etapa da negociação.</p>
    <div className="mt-8 space-y-4">
      {isLoading?<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Carregando oportunidades...</div>:data.map(l=><article key={l.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_210px]"><div>
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-full bg-slate-100"><UserRound className="size-5 text-slate-600"/></div><div><p className="font-bold text-slate-950">{l.bride_name??"Noiva interessada"}</p><p className="text-sm text-emerald-700">{l.categories?.name??"Serviço não informado"}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><MapPin className="size-4"/>{l.city??"Cidade não informada"}{l.state?" - "+l.state:""}</span>{l.wedding_date&&<span className="flex items-center gap-1"><CalendarDays className="size-4"/>{new Date(l.wedding_date+"T12:00:00").toLocaleDateString("pt-BR")}</span>}</div>
          {l.message&&<p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{l.message}</p>}
        </div><div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Etapa do atendimento</p><Select value={l.status} onValueChange={v=>update(l.id,v)}><SelectTrigger className="bg-white"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(LEAD_STATUS_LABELS).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div></div>
      </article>)}
      {!isLoading&&data.length===0&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="font-semibold text-slate-800">Nenhuma oportunidade por enquanto.</p><p className="mt-1 text-sm text-slate-500">Quando uma noiva solicitar orçamento, o contato aparecerá aqui.</p></div>}
    </div>
  </div></AppShell>;
}
