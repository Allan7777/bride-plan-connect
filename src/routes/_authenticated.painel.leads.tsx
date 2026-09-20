import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CalendarDays, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AccountGuard } from "@/components/account-guard";
import { VendorLeadDialog, type VendorLead } from "@/components/vendor-lead-dialog";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_STATUS_LABELS } from "@/lib/noivahub";
export const Route=createFileRoute("/_authenticated/painel/leads")({head:()=>({meta:[{title:"Leads — NoivaHub"},{name:"description",content:"Gerencie as oportunidades recebidas pelo seu perfil."},{property:"og:title",content:"Leads — NoivaHub"},{property:"og:description",content:"Oportunidades do seu negócio."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:Leads});

function Leads(){return <AccountGuard type="vendor">{a=><LeadsList vendorId={a.vendorId}/>}</AccountGuard>}

function LeadsList({vendorId}:{vendorId:string|null}) {
  const {data=[]}=useQuery({
    queryKey:["vendor-leads",vendorId],
    enabled:!!vendorId,
    queryFn:async()=>{
      const {data,error}=await supabase.from("leads").select("id,bride_name,city,state,wedding_date,consultation_at,vendor_notes,message,status,created_at,categories:category_id(name)").eq("vendor_id",vendorId??"").order("created_at",{ascending:false});
      if(error) throw error;
      return (data??[]) as VendorLead[];
    },
  });

  return <AppShell type="vendor"><div className="mx-auto max-w-5xl p-5 md:p-10">
    <p className="text-sm text-muted-foreground">Funil comercial</p>
    <h1 className="font-display text-4xl">Leads recebidos</h1>
    <p className="mt-2 text-muted-foreground">Organize cada oportunidade do primeiro contato à contratação.</p>
    <div className="mt-6 space-y-3">{data.map(lead=><article key={lead.id} className="surface grid gap-5 p-5 md:grid-cols-[1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{lead.bride_name??"Noiva interessada"}</p><span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">{LEAD_STATUS_LABELS[lead.status]}</span></div>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{lead.categories?.name} · {lead.city??"Cidade não informada"}{lead.state?` - ${lead.state}`:""}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {lead.consultation_at?<span className="flex items-center gap-1.5"><CalendarClock className="size-4 text-gold" />Consulta: {new Date(lead.consultation_at).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}</span>:null}
          {lead.wedding_date?<span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-gold" />Casamento: {new Date(`${lead.wedding_date}T12:00:00`).toLocaleDateString("pt-BR")}</span>:null}
        </div>
        {lead.message?<p className="mt-4 text-sm">{lead.message}</p>:null}
        {lead.vendor_notes?<p className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">{lead.vendor_notes}</p>:null}
      </div>
      <div className="flex items-start"><VendorLeadDialog lead={lead} /></div>
    </article>)}
    {data.length===0&&<div className="surface p-10 text-center text-muted-foreground">Seus novos contatos aparecerão aqui.</div>}
    </div>
  </div></AppShell>;
}
