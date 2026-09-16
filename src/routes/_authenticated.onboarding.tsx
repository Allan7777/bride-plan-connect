import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [
    { title: "Crie seu planejamento — NoivaHub" },
    { name: "description", content: "Conte um pouco sobre seu casamento para criarmos seu checklist." },
    { property: "og:title", content: "Crie seu planejamento — NoivaHub" },
    { property: "og:description", content: "Seu planejamento de casamento personalizado." },
  ]}),
  component: Onboarding,
});

function Onboarding() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ wedding_date: "", city: "", state: "", guests: "", budget: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const { data: categories } = useQuery({ queryKey: ["onboarding-categories"], queryFn: async () => {
    const { data } = await supabase.from("categories").select("id,name,emoji").eq("active", true).order("sort_order");
    return data ?? [];
  }});

  async function finish() {
    if (!form.wedding_date || !form.city || !form.state || !form.guests || selected.length === 0) {
      toast.error("Preencha as informações e escolha ao menos uma categoria."); return;
    }
    const { error } = await supabase.from("brides").update({ wedding_date: form.wedding_date, guests: Number(form.guests), budget: form.budget ? Number(form.budget) : null, onboarded: true }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("profiles").update({ city: form.city, state: form.state }).eq("id", user.id);
    await supabase.from("wedding_tasks").upsert(selected.map(category_id => ({ bride_id: user.id, category_id })), { onConflict: "bride_id,category_id" });
    toast.success("Pronto! Criamos seu planejamento inicial.");
    navigate({ to: "/noiva" });
  }

  return <main className="mx-auto max-w-2xl px-4 py-10">
    <LinkLogo />
    <Progress value={(step/5)*100} className="mt-8" />
    <p className="mt-2 text-xs text-muted-foreground">Passo {step} de 5</p>
    <div className="surface mt-6 p-6 md:p-8">
      {step === 1 && <Field title="Quando será seu casamento?" label="Data do casamento"><Input type="date" value={form.wedding_date} onChange={e=>setForm({...form,wedding_date:e.target.value})}/></Field>}
      {step === 2 && <><h1 className="font-display text-4xl">Em qual cidade?</h1><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><Label>Cidade</Label><Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div><div><Label>Estado</Label><Input maxLength={2} placeholder="UF" value={form.state} onChange={e=>setForm({...form,state:e.target.value.toUpperCase()})}/></div></div></>}
      {step === 3 && <Field title="Quantos convidados?" label="Quantidade estimada"><Input type="number" min="1" value={form.guests} onChange={e=>setForm({...form,guests:e.target.value})}/></Field>}
      {step === 4 && <Field title="Qual seu orçamento?" label="Valor aproximado (R$)"><Input type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></Field>}
      {step === 5 && <><h1 className="font-display text-4xl">Quais fornecedores você precisa?</h1><p className="mt-2 text-sm text-muted-foreground">Isso vai criar seu checklist inicial.</p><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">{(categories??[]).map(c=><button type="button" key={c.id} onClick={()=>setSelected(p=>p.includes(c.id)?p.filter(i=>i!==c.id):[...p,c.id])} className={`rounded-lg border p-3 text-left text-sm transition-colors ${selected.includes(c.id)?"border-gold bg-accent":"bg-card hover:border-gold"}`}>{c.emoji} {c.name}</button>)}</div></>}
      <div className="mt-8 flex justify-between"><Button variant="ghost" disabled={step===1} onClick={()=>setStep(s=>s-1)}>Voltar</Button>{step<5?<Button onClick={()=>setStep(s=>s+1)}>Continuar</Button>:<Button onClick={finish}>Criar meu planejamento</Button>}</div>
    </div>
  </main>;
}
function Field({ title,label,children}:{title:string;label:string;children:React.ReactNode}) { return <><h1 className="font-display text-4xl">{title}</h1><div className="mt-6 space-y-2"><Label>{label}</Label>{children}</div></>; }
function LinkLogo(){return <a href="/" className="font-display text-2xl">Noiva<span className="text-gold">Hub</span></a>}
