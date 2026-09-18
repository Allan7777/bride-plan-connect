import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorCard } from "@/components/vendor-card";
import { VendorCompare } from "@/components/vendor-compare";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { UF } from "@/lib/noivahub";

export function VendorSearch({ initialCategory }: { initialCategory?: string }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "todas");
  const [state, setState] = useState("todos");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState(40000);
  const [minRating, setMinRating] = useState("0");
  const [compare, setCompare] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,slug,name,emoji")
        .eq("active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors", category, state, city, maxPrice, minRating, term],
    queryFn: async () => {
      let q = supabase
        .from("vendors")
        .select(
          "id,slug,company_name,city,state,price_from,rating,reviews_count,cover_url,primary_category_id,categories:primary_category_id(name,emoji,slug)",
        )
        .eq("status", "aprovado")
        .order("rating", { ascending: false });

      if (state !== "todos") q = q.eq("state", state);
      if (city.trim()) q = q.ilike("city", `%${city.trim()}%`);
      if (term.trim()) q = q.ilike("company_name", `%${term.trim()}%`);
      if (Number(minRating) > 0) q = q.gte("rating", Number(minRating));
      q = q.or(`price_from.is.null,price_from.lte.${maxPrice}`);

      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as unknown as Array<
        Parameters<typeof VendorCard>[0]["vendor"] & { categories: { slug: string } | null }
      >;
      return category === "todas"
        ? rows
        : rows.filter((v) => v.categories?.slug === category);
    },
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("vendor_id");
      return (data ?? []).map((f) => f.vendor_id);
    },
  });

  const favoriteSet = useMemo(() => new Set(favorites ?? []), [favorites]);

  async function toggleFavorite(vendorId: string) {
    if (!user) {
      toast.error("Entre na sua conta para favoritar fornecedores.");
      return;
    }
    if (favoriteSet.has(vendorId)) {
      await supabase.from("favorites").delete().eq("vendor_id", vendorId).eq("user_id", user.id);
    } else {
      const { error } = await supabase.from("favorites").insert({ vendor_id: vendorId, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      const vendor = vendors?.find((item) => item.id === vendorId);
      await supabase.rpc("track_vendor_event", {
        _vendor_id: vendorId,
        _event_type: "favorite",
        ...(vendor?.primary_category_id ? { _category_id: vendor.primary_category_id } : {}),
        _source: "marketplace",
      });
      toast.success("Fornecedor salvo nos favoritos.");
    }
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
  }

  function toggleCompare(id: string) {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  }

  return (
    <div className="mt-8">
      <div className="surface p-4 md:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Qual fornecedor você está procurando?"
            className="h-12 pl-10"
          />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {UF.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Cidade"
          />
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder="Avaliação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Qualquer avaliação</SelectItem>
              <SelectItem value="4">4 estrelas ou mais</SelectItem>
              <SelectItem value="4.5">4,5 estrelas ou mais</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-5">
          <p className="mb-2 text-sm text-muted-foreground">
            Preço inicial até{" "}
            {maxPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          </p>
          <Slider
            value={[maxPrice]}
            onValueChange={([v]) => setMaxPrice(v ?? 40000)}
            min={500}
            max={40000}
            step={500}
          />
        </div>
      </div>

      {compare.length > 0 ? (
        <div className="mt-6">
          <VendorCompare ids={compare} onClear={() => setCompare([])} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))
          : (vendors ?? []).map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                favorited={favoriteSet.has(v.id)}
                onToggleFavorite={toggleFavorite}
                selectable
                selected={compare.includes(v.id)}
                onToggleSelect={toggleCompare}
              />
            ))}
      </div>

      {!isLoading && (vendors ?? []).length === 0 ? (
        <div className="surface mt-8 p-12 text-center">
          <p className="font-display text-2xl">Nenhum fornecedor encontrado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente ajustar os filtros ou buscar em outra cidade.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setTerm("");
              setCity("");
              setState("todos");
              setMinRating("0");
              setMaxPrice(40000);
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : null}
    </div>
  );
}
