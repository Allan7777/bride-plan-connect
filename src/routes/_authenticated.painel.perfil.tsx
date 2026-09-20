import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountGuard } from "@/components/account-guard";
import { AppShell } from "@/components/app-shell";
import { PortfolioManager } from "@/components/portfolio-manager";
import { SimpleWorkEditor } from "@/components/simple-work-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_WHATSAPP_MESSAGE, normalizeBrazilianWhatsapp, parseWorkBlocks, serializeWorkBlocks, type WorkBlock } from "@/lib/vendor-portfolio";

export const Route = createFileRoute("/_authenticated/painel/perfil")({
  head: () => ({ meta: [
    { title: "Perfil e portfólio — NoivaHub" },
    { name: "description", content: "Atualize sua vitrine profissional e seu portfólio." },
    { property: "og:title", content: "Perfil e portfólio — NoivaHub" },
    { property: "og:description", content: "Gerencie sua vitrine profissional no NoivaHub." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  return <AccountGuard type="vendor">{(account) => <Editor id={account.vendorId} userId={user.id} />}</AccountGuard>;
}

function Editor({ id, userId }: { id: string | null; userId: string }) {
  const { data: categories = [] } = useQuery({ queryKey: ["cats"], queryFn: async () => {
    const { data } = await supabase.from("categories").select("id,name").eq("active", true).order("name");
    return data ?? [];
  }});
  const { data: vendor } = useQuery({ queryKey: ["edit-vendor", id], enabled: !!id, queryFn: async () => {
    const { data, error } = await supabase.from("vendors").select("*").eq("id", id ?? "").single();
    if (error) throw error;
    return data;
  }});
  const [form, setForm] = useState({ company_name: "", owner_name: "", description: "", city: "", state: "", whatsapp: "", instagram: "", website: "", price_from: "", price_to: "", logo_url: "", primary_category_id: "", whatsapp_message: DEFAULT_WHATSAPP_MESSAGE });
  const [workBlocks, setWorkBlocks] = useState<WorkBlock[]>([]);

  useEffect(() => {
    if (!vendor) return;
    setForm({ company_name: vendor.company_name, owner_name: vendor.owner_name ?? "", description: vendor.description ?? "", city: vendor.city ?? "", state: vendor.state ?? "", whatsapp: vendor.whatsapp ?? "", instagram: vendor.instagram ?? "", website: vendor.website ?? "", price_from: String(vendor.price_from ?? ""), price_to: String(vendor.price_to ?? ""), logo_url: vendor.logo_url ?? "", primary_category_id: vendor.primary_category_id ?? "", whatsapp_message: vendor.whatsapp_message ?? DEFAULT_WHATSAPP_MESSAGE });
    setWorkBlocks(parseWorkBlocks(vendor.work_description));
  }, [vendor]);

  async function save() {
    if (!id || !form.company_name.trim()) { toast.error("Informe o nome da empresa."); return; }
    const whatsapp = form.whatsapp.trim() ? normalizeBrazilianWhatsapp(form.whatsapp) : null;
    if (form.whatsapp.trim() && !whatsapp) { toast.error("Informe um WhatsApp brasileiro válido, com DDD."); return; }
    if (!form.whatsapp_message.trim() || form.whatsapp_message.length > 1000) { toast.error("A mensagem do WhatsApp deve ter entre 1 e 1.000 caracteres."); return; }
    const { error } = await supabase.from("vendors").update({
      company_name: form.company_name.trim().slice(0, 160), owner_name: form.owner_name.trim().slice(0, 160) || null,
      description: form.description.trim().slice(0, 3000) || null, city: form.city.trim().slice(0, 120) || null,
      state: form.state.trim().toUpperCase().slice(0, 2) || null, whatsapp, instagram: form.instagram.trim().slice(0, 160) || null,
      website: form.website.trim().slice(0, 500) || null, logo_url: form.logo_url.trim().slice(0, 1000) || null,
      price_from: form.price_from ? Number(form.price_from) : null, price_to: form.price_to ? Number(form.price_to) : null,
      primary_category_id: form.primary_category_id || null, whatsapp_message: form.whatsapp_message.trim(),
      work_description: serializeWorkBlocks(workBlocks), status: vendor?.status === "rejeitado" ? "pendente" : vendor?.status ?? "pendente",
    }).eq("id", id);
    error ? toast.error(error.message) : toast.success("Perfil profissional atualizado.");
  }

  if (!id) return null;
  const field = (key: keyof typeof form, label: string, type = "text", placeholder?: string) => <div><Label htmlFor={key}>{label}</Label><Input id={key} type={type} placeholder={placeholder} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></div>;
  return <AppShell type="vendor"><div className="mx-auto max-w-5xl p-5 md:p-10">
    <h1 className="font-display text-4xl">Perfil e portfólio</h1><p className="mt-2 text-muted-foreground">Construa uma vitrine que mostre seu trabalho e facilite novos orçamentos.</p>
    <section className="mt-8"><h2 className="font-display text-3xl">Seu perfil</h2><div className="surface mt-4 grid gap-5 p-6 sm:grid-cols-2">
      {field("company_name", "Nome da empresa")}{field("owner_name", "Responsável")}{field("city", "Cidade")}{field("state", "Estado (UF)")}
      {field("whatsapp", "WhatsApp para receber orçamentos", "tel", "+55 (XX) XXXXX-XXXX")}{field("instagram", "Instagram")}{field("website", "Site", "url")}{field("logo_url", "URL do logo", "url")}{field("price_from", "Preço a partir de", "number")}{field("price_to", "Preço até", "number")}
      <div><Label>Categoria principal</Label><Select value={form.primary_category_id} onValueChange={(value) => setForm({ ...form, primary_category_id: value })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label htmlFor="description">Sobre o fornecedor</Label><Textarea id="description" rows={5} maxLength={3000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Sobre meu trabalho</Label><p className="mb-3 text-xs text-muted-foreground">Use parágrafos, negrito e itens de lista para contar como você trabalha.</p><SimpleWorkEditor value={workBlocks} onChange={setWorkBlocks} /></div>
      <div className="sm:col-span-2"><Label htmlFor="whatsapp_message">Mensagem do WhatsApp</Label><Textarea id="whatsapp_message" rows={4} maxLength={1000} value={form.whatsapp_message} onChange={(event) => setForm({ ...form, whatsapp_message: event.target.value })} /><p className="mt-1 text-xs text-muted-foreground">Os dados cadastrados pela noiva serão acrescentados quando disponíveis.</p></div>
      <Button type="button" onClick={save} className="sm:col-span-2">Salvar alterações</Button>
    </div></section>
    <PortfolioManager vendorId={id} userId={userId} limit={vendor?.portfolio_limit ?? 20} />
  </div></AppShell>;
}
