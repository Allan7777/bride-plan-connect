import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PRICE_BRL } from "@/lib/noivahub";

export const Route = createFileRoute("/precos")({
  head: () => ({
    meta: [
      { title: "Preços — NoivaHub" },
      {
        name: "description",
        content:
          "Plano Noiva e plano Fornecedor por R$ 10,90/mês. Sem comissão sobre contratos.",
      },
      { property: "og:title", content: "Preços — NoivaHub" },
      {
        property: "og:description",
        content: "Assinatura mensal de R$ 10,90 para noivas e fornecedores.",
      },
    ],
  }),
  component: Precos,
});

const plans = [
  {
    title: "Noiva",
    subtitle: "Do primeiro fornecedor ao último detalhe.",
    items: [
      "Planejamento",
      "Checklist",
      "Busca de fornecedores",
      "Filtros",
      "Favoritos",
      "Contatos",
      "Acompanhamento do casamento",
    ],
    cta: "Começar planejamento",
    perfil: "noiva" as const,
  },
  {
    title: "Fornecedor",
    subtitle: "Seja encontrado por quem está planejando o casamento.",
    items: [
      "Perfil profissional",
      "Portfólio",
      "Serviços",
      "Leads",
      "Contatos",
      "Estatísticas",
    ],
    cta: "Divulgar meu negócio",
    perfil: "fornecedor" as const,
  },
];

function Precos() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-5xl">Planos simples e transparentes</h1>
        <p className="mt-4 text-muted-foreground">
          Sem comissão sobre contratos. O pagamento do serviço é feito diretamente entre
          noiva e fornecedor.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p.title} className="surface p-8">
              <h2 className="font-display text-3xl">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.subtitle}</p>
              <p className="mt-6 font-display text-5xl">
                {PRICE_BRL}
                <span className="text-base text-muted-foreground">/mês</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="size-4 text-gold" /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full">
                <Link to="/auth" search={{ modo: "cadastro", perfil: p.perfil }}>
                  {p.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
