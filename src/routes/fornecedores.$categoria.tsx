import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { VendorSearch } from "@/components/vendor-search";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/fornecedores/$categoria")({
  head: ({ params }) => {
    const nome = params.categoria.replace(/-/g, " ");
    const title = `Fornecedores de ${nome} para casamento — NoivaHub`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Encontre fornecedores de ${nome} para casamento por cidade, faixa de preço e avaliação no NoivaHub.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Fornecedores de ${nome} para o seu casamento.`,
        },
      ],
    };
  },
  component: CategoriaPage,
});

function CategoriaPage() {
  const { categoria } = useParams({ from: "/fornecedores/$categoria" });
  const { data: cat } = useQuery({
    queryKey: ["category", categoria],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,emoji,slug")
        .eq("slug", categoria)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Link to="/fornecedores" className="text-sm text-muted-foreground hover:underline">
          ← Todos os fornecedores
        </Link>
        <h1 className="mt-4 font-display text-5xl">
          {cat ? `${cat.emoji} ${cat.name}` : "Fornecedores"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Fornecedores de {cat?.name?.toLowerCase() ?? categoria.replace(/-/g, " ")} para o seu
          casamento.
        </p>
        <VendorSearch initialCategory={categoria} />
      </main>
      <SiteFooter />
    </div>
  );
}
