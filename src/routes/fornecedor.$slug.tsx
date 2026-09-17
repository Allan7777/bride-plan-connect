import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Globe2, Instagram, MapPin, MessageCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { PortfolioLightbox } from "@/components/portfolio-lightbox";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WorkDescription } from "@/components/work-description";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { vendorPriceLabel } from "@/lib/noivahub";
import { DEFAULT_WHATSAPP_MESSAGE, formatWeddingDate, PORTFOLIO_BUCKET } from "@/lib/vendor-portfolio";

export const Route=createFileRoute("/fornecedor/$slug")({
  loader:async({params})=>{const {data}=await supabase.from("vendors").select("company_name,description,city,state,categories:primary_category_id(name)").eq("slug",params.slug).eq("status","aprovado").maybeSingle();if(!data)throw notFound();return data;},
  head:({loaderData})=>{const category=loaderData?.categories?.name??"Fornecedor de casamento";const place=loaderData?.city?` em ${loaderData.city}${loaderData.state?` - ${loaderData.state}`:""}`:"";const title=loaderData?`${loaderData.company_name} | ${category}${place} — NoivaHub`:"Fornecedor indisponível — NoivaHub";const description=loaderData?(loaderData.description??`Conheça o portfólio, serviços e valores de ${loaderData.company_name}, ${category.toLowerCase()}${place}.`).slice(0,155):"Perfil de fornecedor indisponível.";return{meta:[{title},{name:"description",content:description},{property:"og:title",content:title},{property:"og:description",content:description},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"},...(!loaderData?[{name:"robots",content:"noindex"}]:[])]}},
  component:VendorProfile,
  notFoundComponent:()=> <div className="p-12 text-center"><h1 className="font-display text-4xl">Fornecedor não encontrado</h1><Button asChild className="mt-6"><Link to="/fornecedores">Voltar à busca</Link></Button></div>
});

function VendorProfile(){
  const {slug}=Route.useParams();
  const {user}=useSession();
  const [lightbox,setLightbox]=useState<number|null>(null);
  const {data:v}=useQuery({queryKey:["vendor",slug],queryFn:async()=>{const {data,error}=await supabase.from("vendors").select("*,categories:primary_category_id(id,name,emoji),vendor_services(*),vendor_photos(*)").eq("slug",slug).eq("status","aprovado").single();if(error)throw error;const photos=await Promise.all((data.vendor_photos??[]).sort((a,b)=>a.sort_order-b.sort_order).map(async(photo)=>{if(!photo.storage_path)return{...photo,displayUrl:photo.url};const{data:signed}=await supabase.storage.from(PORTFOLIO_BUCKET).createSignedUrl(photo.storage_path,3600);return{...photo,displayUrl:signed?.signedUrl??photo.url}}));return{...data,photos};}});
  useEffect(()=>{if(!v)return;const key=`noivahub:view:${v.id}`;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");supabase.rpc("track_vendor_event",{_vendor_id:v.id,_event_type:"profile_view",_category_id:v.primary_category_id??undefined,_source:"perfil_fornecedor"}).then(()=>undefined);},[v]);
  const cover=useMemo(()=>v?.photos.find(photo=>photo.is_cover)?.displayUrl??v?.photos[0]?.displayUrl??v?.cover_url??null,[v]);
  const continueToWhatsapp=useCallback(async()=>{
    if(!v?.whatsapp){toast.error("Este fornecedor ainda não cadastrou um WhatsApp para orçamentos.");return;}
    let profile:{full_name:string|null;city:string|null;state:string|null;type:string}|null=null;
    let weddingDate:string|null=null;
    if(user){const[{data:p},{data:b}]=await Promise.all([supabase.from("profiles").select("full_name,city,state,type").eq("id",user.id).maybeSingle(),supabase.from("brides").select("wedding_date").eq("id",user.id).maybeSingle()]);profile=p;weddingDate=b?.wedding_date??null;}
    const lines=[(v.whatsapp_message??DEFAULT_WHATSAPP_MESSAGE).replace(/^Olá[!,]?/i,`Olá, ${v.company_name}!`)];
    if(profile?.type==="bride"&&profile.full_name)lines.push(`Meu nome é ${profile.full_name}.`);
    if(profile?.type==="bride"&&weddingDate)lines.push(`A data do meu casamento é ${formatWeddingDate(weddingDate)}.`);
    if(profile?.type==="bride"&&profile.city)lines.push(`A cidade é ${profile.city}${profile.state?` - ${profile.state}`:""}.`);
    lines.push("Gostaria de receber informações sobre valores e disponibilidade.");
    const message=lines.join("\n\n").slice(0,1000);
    await supabase.rpc("track_vendor_event",{_vendor_id:v.id,_event_type:"budget_request",_category_id:v.primary_category_id??undefined,_source:"perfil_fornecedor"});
    if(user&&profile?.type==="bride"){
      const{error}=await supabase.from("leads").insert({vendor_id:v.id,bride_id:user.id,category_id:v.primary_category_id,bride_name:profile.full_name,city:profile.city,state:profile.state,wedding_date:weddingDate,message});
      if(!error){await Promise.all([supabase.rpc("track_vendor_event",{_vendor_id:v.id,_event_type:"lead_created",_category_id:v.primary_category_id??undefined,_source:"perfil_fornecedor"}),supabase.from("contacts").upsert({vendor_id:v.id,bride_id:user.id,category_id:v.primary_category_id,notes:message,last_contact_at:new Date().toISOString()},{onConflict:"bride_id,vendor_id"})]);}
    }
    await supabase.rpc("track_vendor_event",{_vendor_id:v.id,_event_type:"whatsapp_click",_category_id:v.primary_category_id??undefined,_source:"perfil_fornecedor"});
    window.open(`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  },[user,v]);
  if(!v)return <div className="p-10">Carregando...</div>;
  const Cta=({className=""}:{className?:string})=><AlertDialog><AlertDialogTrigger asChild><Button size="lg" className={className}><MessageCircle className="mr-2 size-4"/>Consultar valores</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Continuar para o WhatsApp?</AlertDialogTitle><AlertDialogDescription>Você será direcionada para o WhatsApp de {v.company_name}. O NoivaHub registrará esta consulta para o fornecedor.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={continueToWhatsapp}>Continuar para WhatsApp</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
  return <div className="min-h-screen pb-20 md:pb-0"><SiteHeader/><main>
    <section className="relative min-h-[430px] bg-muted">{cover?<img src={cover} alt={`Trabalho de ${v.company_name}`} className="absolute inset-0 size-full object-cover"/>:null}<div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent"/><div className="relative mx-auto flex min-h-[430px] max-w-6xl items-end px-4 pb-10 text-primary-foreground"><div className="max-w-3xl"><p>{v.categories?.emoji} {v.categories?.name}</p><h1 className="mt-2 font-display text-5xl md:text-6xl">{v.company_name}</h1><div className="mt-3 flex flex-wrap items-center gap-5 text-sm"><span className="flex items-center gap-1"><MapPin className="size-4"/>{v.city??"Localização a consultar"}{v.state?` - ${v.state}`:""}</span>{v.reviews_count>0?<span className="flex items-center gap-1"><Star className="size-4 fill-gold text-gold"/>{Number(v.rating).toFixed(1)} ({v.reviews_count} avaliações)</span>:null}</div><Cta className="mt-6 hidden md:inline-flex"/></div></div></section>
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="max-w-3xl"><p className="text-sm font-medium uppercase text-muted-foreground">Quem é</p><h2 className="mt-2 font-display text-4xl">Sobre o fornecedor</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{v.description||"Conheça os serviços e trabalhos deste fornecedor."}</p></section>
      {v.photos.length?<section className="mt-14"><p className="text-sm font-medium uppercase text-muted-foreground">O que já fez</p><h2 className="mt-2 font-display text-4xl">Meu trabalho</h2><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{v.photos.map((photo,index)=><button type="button" key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted" onClick={()=>setLightbox(index)}><img src={photo.displayUrl} loading="lazy" alt={photo.description||`Trabalho de ${v.company_name}`} className="size-full object-cover transition-transform duration-500 group-hover:scale-105"/></button>)}</div><Cta className="mt-7"/></section>:null}
      <section className="mt-14 max-w-3xl"><p className="text-sm font-medium uppercase text-muted-foreground">Como trabalha</p><h2 className="mt-2 font-display text-4xl">Sobre meu trabalho</h2><div className="mt-4 leading-7"><WorkDescription value={v.work_description}/></div></section>
      <section className="mt-14"><p className="text-sm font-medium uppercase text-muted-foreground">O que oferece</p><h2 className="mt-2 font-display text-4xl">Serviços</h2>{v.vendor_services.length?<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{v.vendor_services.map(service=><article key={service.id} className="surface p-5"><h3 className="font-display text-2xl">{service.name}</h3>{service.description?<p className="mt-2 text-sm text-muted-foreground">{service.description}</p>:null}<p className="mt-4 font-medium">{vendorPriceLabel(service.price)}</p></article>)}</div>:<p className="mt-4 text-muted-foreground">Consulte o fornecedor para conhecer os serviços disponíveis.</p>}</section>
      <section className="mt-14 grid gap-8 border-y border-border py-10 md:grid-cols-2"><div><p className="text-sm font-medium uppercase text-muted-foreground">Quanto custa</p><h2 className="mt-2 font-display text-4xl">Faixa de preço</h2><p className="mt-3 text-xl">{vendorPriceLabel(v.price_from)}</p>{v.price_from&&v.price_to?<p className="mt-1 text-sm text-muted-foreground">Até {v.price_to.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0})}</p>:null}</div><div><p className="text-sm font-medium uppercase text-muted-foreground">Onde atende</p><h2 className="mt-2 font-display text-4xl">Localização</h2><p className="mt-3 flex items-center gap-2"><MapPin className="size-5 text-gold"/>{v.city??"Consulte a área de atendimento"}{v.state?` - ${v.state}`:""}</p></div></section>
      <section className="py-14 text-center"><h2 className="font-display text-4xl">Gostou deste trabalho?</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Converse diretamente com o fornecedor sobre disponibilidade, valores e condições.</p><Cta className="mt-6"/><div className="mt-6 flex justify-center gap-5 text-sm text-muted-foreground">{v.instagram?<a href={`https://instagram.com/${v.instagram.replace("@","")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1"><Instagram className="size-4"/>Instagram</a>:null}{v.website?<a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1"><Globe2 className="size-4"/>Site</a>:null}</div></section>
    </div>
  </main><SiteFooter/><div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden"><Cta className="w-full"/></div><PortfolioLightbox photos={v.photos} index={lightbox} onIndexChange={setLightbox} onClose={()=>setLightbox(null)}/></div>;
}
