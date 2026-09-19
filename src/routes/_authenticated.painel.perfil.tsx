import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, MapPin, Pencil, Store } from "lucide-react";
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

export const Route=createFileRoute("/_authenticated/painel/perfil")({head:()=>({meta:[{title:"Vitrine profissional — NoivaHub Pro"},{name:"description",content:"Gerencie a vitrine profissional que as noivas encontram."}]}),component:Page});
function Page(){const {user}=Route.useRouteContext();return <AccountGuard type="vendor">{account=><Editor id={account.vendorId} userId={user.id}/>}</AccountGuard>}

function Editor({id,userId}:{id:string|null;userId:string}){
 const {data:categories=[]}=useQuery({queryKey:["cats"],queryFn:async()=>{const{data}=await supabase.from("categories").select("id,name").eq("active",true).order("name");return data??[]}});
 const {data:vendor}=useQuery({queryKey:["edit-vendor",id],enabled:!!id,queryFn:async()=>{const{data,error}=await supabase.from("vendors").select("*").eq("id",id??"").single();if(error)throw error;return data}});
 const [editing,setEditing]=useState(false);
 const [form,setForm]=useState({company_name:"",owner_name:"",description:"",city:"",state:"",whatsapp:"",instagram:"",website:"",price_from:"",price_to:"",logo_url:"",primary_category_id:"",whatsapp_message:DEFAULT_WHATSAPP_MESSAGE});
 const [workBlocks,setWorkBlocks]=useState<WorkBlock[]>([]);
 useEffect(()=>{if(!vendor)return;setForm({company_name:vendor.company_name,owner_name:vendor.owner_name??"",description:vendor.description??"",city:vendor.city??"",state:vendor.state??"",whatsapp:vendor.whatsapp??"",instagram:vendor.instagram??"",website:vendor.website??"",price_from:String(vendor.price_from??""),price_to:String(vendor.price_to??""),logo_url:vendor.logo_url??"",primary_category_id:vendor.primary_category_id??"",whatsapp_message:vendor.whatsapp_message??DEFAULT_WHATSAPP_MESSAGE});setWorkBlocks(parseWorkBlocks(vendor.work_description))},[vendor]);
 async function save(){if(!id||!form.company_name.trim()){toast.error("Informe o nome da empresa.");return}const whatsapp=form.whatsapp.trim()?normalizeBrazilianWhatsapp(form.whatsapp):null;if(form.whatsapp.trim()&&!whatsapp){toast.error("Informe um WhatsApp brasileiro válido, com DDD.");return}const{error}=await supabase.from("vendors").update({company_name:form.company_name.trim().slice(0,160),owner_name:form.owner_name.trim().slice(0,160)||null,description:form.description.trim().slice(0,3000)||null,city:form.city.trim().slice(0,120)||null,state:form.state.trim().toUpperCase().slice(0,2)||null,whatsapp,instagram:form.instagram.trim().slice(0,160)||null,website:form.website.trim().slice(0,500)||null,logo_url:form.logo_url.trim().slice(0,1000)||null,price_from:form.price_from?Number(form.price_from):null,price_to:form.price_to?Number(form.price_to):null,primary_category_id:form.primary_category_id||null,whatsapp_message:form.whatsapp_message.trim(),work_description:serializeWorkBlocks(workBlocks),status:vendor?.status==="rejeitado"?"pendente":vendor?.status??"pendente"}).eq("id",id);if(error)toast.error(error.message);else{toast.success("Vitrine atualizada.");setEditing(false)}}
 if(!id)return null;
 const field=(key:keyof typeof form,label:string,type="text")=><div><Label htmlFor={key}>{label}</Label><Input id={key} type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></div>;
 return <AppShell type="vendor"><div className="mx-auto max-w-7xl p-5 md:p-10">
   <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Vitrine profissional</h1><p className="mt-2 text-slate-600">Como as noivas veem seu perfil e seus melhores trabalhos.</p></div>{vendor?.slug&&<Button asChild variant="outline"><Link to="/fornecedor/$slug" params={{slug:vendor.slug}}>Ver página pública <ExternalLink className="ml-2 size-4"/></Link></Button>}</div>
   <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
     <div className="h-44 bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-800 md:h-52"/>
     <div className="relative p-6 pt-16 md:p-8 md:pt-16">
       <div className="absolute -top-14 left-6 grid size-28 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-slate-950 shadow-lg md:left-8">{form.logo_url?<img src={form.logo_url} alt={form.company_name} className="size-full object-cover"/>:<Store className="size-10 text-emerald-400"/>}</div>
       <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">{form.company_name||"Nome da sua empresa"}</h2><p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin className="size-4"/>{form.city||"Cidade não informada"}{form.state?" - "+form.state:""}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{form.description||"Adicione uma descrição para apresentar seu trabalho às noivas."}</p></div><Button onClick={()=>setEditing(v=>!v)} className="bg-slate-950 text-white hover:bg-slate-800"><Pencil className="mr-2 size-4"/>{editing?"Fechar edição":"Editar perfil"}</Button></div>
     </div>
   </section>
   {editing&&<section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Editar informações da vitrine</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{field("company_name","Nome da empresa")}{field("owner_name","Responsável")}{field("city","Cidade")}{field("state","Estado (UF)")}{field("whatsapp","WhatsApp","tel")}{field("instagram","Instagram")}{field("website","Site","url")}{field("logo_url","URL do logo","url")}{field("price_from","Preço a partir de","number")}{field("price_to","Preço até","number")}<div><Label>Categoria principal</Label><Select value={form.primary_category_id} onValueChange={value=>setForm({...form,primary_category_id:value})}><SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger><SelectContent>{categories.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div className="sm:col-span-2"><Label>Sobre o fornecedor</Label><Textarea rows={5} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div><div className="sm:col-span-2"><Label>Sobre meu trabalho</Label><SimpleWorkEditor value={workBlocks} onChange={setWorkBlocks}/></div><div className="sm:col-span-2"><Label>Mensagem do WhatsApp</Label><Textarea rows={4} value={form.whatsapp_message} onChange={e=>setForm({...form,whatsapp_message:e.target.value})}/></div><Button type="button" onClick={save} className="bg-emerald-600 text-white hover:bg-emerald-700 sm:col-span-2">Salvar alterações</Button></div></section>}
   <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><PortfolioManager vendorId={id} userId={userId} limit={vendor?.portfolio_limit??20}/></section>
   <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-6"><div><p className="font-bold text-emerald-950">Sua vitrine profissional</p><p className="mt-1 text-sm text-emerald-800">Mantenha fotos e informações atualizadas para receber mais oportunidades.</p></div>{vendor?.slug&&<Button asChild variant="outline"><Link to="/fornecedor/$slug" params={{slug:vendor.slug}}>Visualizar como noiva</Link></Button>}</div>
 </div></AppShell>
}
