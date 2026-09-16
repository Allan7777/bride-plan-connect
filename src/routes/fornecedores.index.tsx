import { createFileRoute } from "@tanstack/react-router";
import { VendorSearch } from "@/components/vendor-search";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/fornecedores/")({
  head: () => ({
    meta: [
      { title: "Encontre fornecedores para casamento — NoivaHub" },
      {
        name: "description",
        content:
          "Busque fotógrafos, maquiadores, cerimonialistas, DJs, buffets e mais fornecedores de casamento por cidade, preço e avaliação.",
      },
      { property: "og:title", content: "Encontre fornecedores para casamento — NoivaHub" },
      {
        property: "og:description",
        content: "Marketplace de fornecedores de casamento com filtros por cidade e preço.",
      },
    ],
  }),
  component: FornecedoresPage,
});

function FornecedoresPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-5xl">Encontre fornecedores</h1>
        <p className="mt-3 text-muted-foreground">
          Qual fornecedor você está procurando?
        </p>
        <VendorSearch />
      </main>
      <SiteFooter />
    </div>
  );
}
