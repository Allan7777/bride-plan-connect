const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido" }, 405);

  try {
    const { city, category } = await req.json();
    if (typeof city !== "string" || !city.trim() || !["espaco", "vestido"].includes(category)) {
      return jsonResponse({ error: "Parâmetros inválidos" }, 400);
    }

    const normalizedCity = city.trim();
    const queries =
      category === "vestido"
        ? [`loja noivas ${normalizedCity}`, `vestido de noiva ${normalizedCity}`]
        : [
            `casa de festas ${normalizedCity}`,
            `salão de festas ${normalizedCity}`,
            `espaço eventos ${normalizedCity}`,
          ];

    const responses = await Promise.all(
      queries.map(async (query) => {
        const url = new URL("https://photon.komoot.io/api/");
        url.searchParams.set("q", query);
        url.searchParams.set("limit", "20");

        try {
          const response = await Promise.race([
            fetch(url, {
              headers: { "User-Agent": "NoivaHub/1.0 (supplier-search)" },
            }),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000)),
          ]);
          if (!response?.ok) return [];
          const data = await response.json();
          return data.features ?? [];
        } catch (error) {
          console.warn(`Falha temporária na consulta ${query}`, error);
          return [];
        }
      }),
    );

    const places = responses
      .flat()
      .map((feature) => {
        const properties = feature.properties ?? {};
        const [lon, lat] = feature.geometry?.coordinates ?? [];
        if (!properties.name || !Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;

        return {
          id: `${properties.osm_type ?? "osm"}${properties.osm_id ?? `${lat}-${lon}`}`,
          name: properties.name,
          address:
            [
              properties.street,
              properties.housenumber,
              properties.district,
              properties.city,
              properties.state,
            ]
              .filter(Boolean)
              .join(", ") || normalizedCity,
          lat,
          lon,
        };
      })
      .filter(Boolean);

    const unique = Array.from(
      new Map(places.map((place) => [place.name.toLowerCase(), place])).values(),
    ).slice(0, 30);

    return jsonResponse({ places: unique });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Falha ao buscar" }, 500);
  }
});
