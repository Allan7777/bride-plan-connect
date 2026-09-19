import { useState } from "react";
import { ExternalLink, MapPin, Phone, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Place={id:string;name:string;address:string;phone?:string;website?:string;lat:number;lon:number};
export function AutomaticSupplierSearch({category}:{category:"espaco"|"vestido"}){
 const [city,setCity]=useState(""); const [loading,setLoading]=useState(false); const [places,setPlaces]=useState<Place[]>([]); const [searched,setSearched]=useState(false); const [error,setError]=useState("");
 async function search(){
  if(city.trim().length<2)return; setLoading(true);setError("");setSearched(true);
  try{
   const {data,error}=await supabase.functions.invoke("search-wedding-places",{body:{city:city.trim(),category}});
   if(error) throw error;
   if(data?.error) throw new Error(data.error);
   setPlaces((data?.places??[]) as Place[]);
  }catch(e){setPlaces([]);setError("Não foi possível buscar agora. Tente novamente em alguns instantes.");}finally{setLoading(false)}
 }
 const title=category==="vestido"?"lojas de vestidos de noiva":"espaços para casamento";
 return <div className="mt-8">
  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6"><div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white"><Search className="size-5"/></div><div><h2 className="text-xl font-bold">Busca automática de {title}</h2><p className="mt-1 text-sm text-emerald-900/70">Digite a cidade. O NoivaHub procura estabelecimentos reais em dados públicos de localização, sem exigir cadastro do estabelecimento.</p></div></div><div className="mt-5 flex gap-2"><Input value={city} onChange={e=>setCity(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Ex.: Rio de Janeiro, RJ" className="bg-white"/><Button onClick={search} disabled={loading||city.trim().length<2} className="bg-emerald-600 hover:bg-emerald-700">{loading?"Buscando...":"Buscar"}</Button></div></div>
  {error&&<div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{places.map(p=><article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid size-10 place-items-center rounded-xl bg-slate-100"><Store className="size-5"/></div><h3 className="mt-4 text-lg font-bold">{p.name}</h3><p className="mt-2 flex gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 size-4 shrink-0"/>{p.address}</p><div className="mt-5 flex flex-wrap gap-2">{p.phone&&<Button asChild size="sm" variant="outline"><a href={"tel:"+p.phone}><Phone className="mr-1 size-4"/>Ligar</a></Button>}{p.website&&<Button asChild size="sm" variant="outline"><a href={p.website} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 size-4"/>Site</a></Button>}<Button asChild size="sm"><a href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.name+" "+p.address)} target="_blank" rel="noreferrer">Ver no mapa</a></Button></div></article>)}</div>
  {searched&&!loading&&!error&&places.length===0&&<div className="mt-6 rounded-2xl border border-dashed p-10 text-center"><p className="font-semibold">Nenhum resultado público encontrado nessa cidade.</p><p className="mt-1 text-sm text-slate-500">Tente informar cidade e UF. A cobertura depende dos dados públicos disponíveis.</p></div>}
  {places.length>0&&<p className="mt-4 text-xs text-slate-500">Resultados obtidos automaticamente de dados públicos do OpenStreetMap. O NoivaHub não afirma que o estabelecimento é parceiro nem garante disponibilidade; confirme informações diretamente com o local.</p>}
 </div>
}