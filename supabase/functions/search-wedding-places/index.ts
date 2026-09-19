const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

type Place = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  lat: number;
  lon: number;
};

type OsmElement = {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  try {
    const { city, category } = await req.json();

    if (typeof city !== "string" || !city.trim() || !["espaco", "vestido"].includes(category)) {
      return jsonResponse({ error: "Parâmetros inválidos" }, 400);
    }

    const normalizedCity = city.trim();
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(`${normalizedCity}, Brasil`)}`,
      {
        headers: {
          "User-Agent": "NoivaHub/1.0 (supplier-search)",
          "Accept-Language": "pt-BR",
        },
      },
    );

    if (!geoRes.ok) throw new Error("Falha ao localizar a cidade");

    const geo = await geoRes.json();
    if (!geo?.[0]) return jsonResponse({ places: [] });

    const [south, west, north, east] = geo[0].boundingbox.map(Number);
    const bbox = `${south},${west},${north},${east}`;
    const query =
      category === "vestido"
        ? `[out:json][timeout:25];(nwr[shop~"clothes|fashion|bridal"]["name"~"noiva|noivas|bridal|casamento|vestido",i](${bbox}););out center tags 50;`
        : `[out:json][timeout:25];(nwr[amenity~"events_venue|community_centre|conference_centre"](${bbox});nwr[tourism="hotel"][name](${bbox}););out center tags 50;`;

    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];
    let elements: OsmElement[] | undefined;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "NoivaHub/1.0",
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (response.ok) {
          const data = await response.json();
          elements = data.elements ?? [];
          break;
        }
      } catch (error) {
        console.warn(`Falha temporária no endpoint ${endpoint}`, error);
      }
    }

    if (!elements) throw new Error("Serviço de locais indisponível");

    const places = elements
      .map((element): Place | undefined => {
        const tags = element.tags ?? {};
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;

        if (!tags.name || !Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;

        return {
          id: `${element.type}${element.id}`,
          name: tags.name,
          address:
            [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"], tags["addr:city"]]
              .filter(Boolean)
              .join(", ") || normalizedCity,
          phone: tags.phone || tags["contact:phone"],
          website: tags.website || tags["contact:website"],
          lat: lat as number,
          lon: lon as number,
        };
      })
      .filter((place): place is Place => Boolean(place));

    const unique = Array.from(
      new Map(places.map((place) => [place.name.toLowerCase(), place])).values(),
    ).slice(0, 30);

    return jsonResponse({ places: unique });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Falha ao buscar" }, 500);
  }
});
