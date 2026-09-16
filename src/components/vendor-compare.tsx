import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/noivahub";

export function VendorCompare({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const { data } = useQuery({
    queryKey: ["compare", ids],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendors")
        .select(
          "id,slug,company_name,city,state,price_from,price_to,rating,reviews_count,categories:primary_category_id(name,emoji),vendor_services(name,price)",
        )
        .in("id", ids);
      return data ?? [];
    },
  });

  return (
    <div className="surface overflow-x-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Comparar fornecedores</h2>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar
        </Button>
      </div>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-2 font-normal">Fornecedor</th>
            <th className="py-2 font-normal">Categoria</th>
            <th className="py-2 font-normal">Local</th>
            <th className="py-2 font-normal">Faixa de preço</th>
            <th className="py-2 font-normal">Avaliação</th>
            <th className="py-2 font-normal">Serviços</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((v) => (
            <tr key={v.id} className="border-t border-border">
              <td className="py-3 pr-4 font-medium">{v.company_name}</td>
              <td className="py-3 pr-4">
                {v.categories ? `${v.categories.emoji} ${v.categories.name}` : "—"}
              </td>
              <td className="py-3 pr-4">
                {v.city} - {v.state}
              </td>
              <td className="py-3 pr-4">
                {brl(v.price_from)} – {brl(v.price_to)}
              </td>
              <td className="py-3 pr-4">
                {v.reviews_count > 0 ? `${Number(v.rating).toFixed(1)} ★` : "Sem avaliações"}
              </td>
              <td className="py-3 pr-4">
                {(v.vendor_services ?? []).map((s) => s.name).join(", ") || "—"}
              </td>
              <td className="py-3">
                <Button asChild size="sm" variant="outline">
                  <Link to="/fornecedor/$slug" params={{ slug: v.slug }}>
                    Ver
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
