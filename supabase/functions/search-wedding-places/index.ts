const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 try{
  const {city,category}=await req.json();
  if(!city||!["espaco","vestido"].includes(category))return new Response(JSON.stringify({error:"Parâmetros inválidos"}),{status:400,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const geoRes=await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q="+encodeURIComponent(city+", Brasil"),{headers:{"User-Agent":"NoivaHub/1.0 (supplier-search)","Accept-Language":"pt-BR"}});
  if(!geoRes.ok)throw new Error("Falha ao localizar a cidade");
  const geo=await geoRes.json();if(!geo?.[0])return new Response(JSON.stringify({places:[]}),{headers:{...corsHeaders,"Content-Type":"application/json"}});
  const [s,w,n,e]=geo[0].boundingbox.map(Number);
  const query=category==="vestido"
   ? '[out:json][timeout:25];(nwr[shop~"clothes|fashion|bridal"]["name"~"noiva|noivas|bridal|casamento|vestido",i]('+s+','+w+','+n+','+e+'););out center tags 50;'
   : '[out:json][timeout:25];(nwr[amenity~"events_venue|community_centre|conference_centre"]('+s+','+w+','+n+','+e+');nwr[tourism="hotel"][name]('+s+','+w+','+n+','+e+'););out center tags 50;';
  const endpoints=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
  let json=null;
  for(const endpoint of endpoints){try{const x=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"NoivaHub/1.0"},body:"data="+encodeURIComponent(query)});if(x.ok){json=await x.json();break}}catch{}}
  if(!json)throw new Error("Serviço de locais indisponível");
  const places=(json.elements??[]).map((x:any)=>{const t=x.tags??{};const lat=x.lat??x.center?.lat,lon=x.lon??x.center?.lon;return{id:String(x.type)+x.id,name:t.name,address:[t["addr:street"],t["addr:housenumber"],t["addr:suburb"],t["addr:city"]].filter(Boolean).join(", ")||city,phone:t.phone||t["contact:phone"],website:t.website||t["contact:website"],lat,lon}}).filter((x:any)=>x.name&&Number.isFinite(x.lat)&&Number.isFinite(x.lon));
  const unique=Array.from(new Map(places.map((x:any)=>[x.name.toLowerCase(),x])).values()).slice(0,30);
  return new Response(JSON.stringify({places:unique}),{headers:{...corsHeaders,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:"Falha ao buscar"}),{status:500,headers:{...corsHeaders,"Content-Type":"application/json"}})}
});