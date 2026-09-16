import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Heart, ListChecks, Search, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { PRICE_BRL } from "@/lib/noivahub";
import heroImage from "@/assets/hero-casamento.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NoivaHub — Seu casamento começa aqui" },
      {
        name: "description",
        content:
          "Organize seu casamento com checklist inteligente e encontre fotógrafos, maquiadores, cerimonialistas, DJs e buffets em um só lugar.",
      },
      { property: "og:title", content: "NoivaHub — Seu casamento começa aqui" },
      {
        property: "og:description",
        content:
          "Planejamento completo do casamento e marketplace de fornecedores por R$ 10,90/mês.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  "Crie sua conta",
  "Monte seu planejamento",
  "Encontre fornecedores",
  "Entre em contato",
  "Organize seu casamento",
];

const faqs = [
  {
    q: "O NoivaHub cobra comissão sobre o contrato?",
    a: "Não. A plataforma conecta noivas e fornecedores. O pagamento do serviço contratado é feito diretamente entre as partes.",
  },
  {
    q: "Quanto custa?",
    a: "R$ 10,90 por mês para noivas e R$ 10,90 por mês para fornecedores.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura é mensal e pode ser cancelada a qualquer momento. Seus dados continuam salvos.",
  },
  {
    q: "Os fornecedores são verificados?",
    a: "Todo fornecedor passa por aprovação antes de aparecer no marketplace público.",
  },
];

function Landing() {
  const { data: categories } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("slug,name,emoji")
        .eq("active", true)
        .order("sort_order")
        .limit(18);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="size-3.5 text-gold" /> Planejamento + fornecedores
            </p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-6xl">
              Seu casamento começa aqui.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Organize seu casamento e encontre fotógrafos, maquiadores, cerimonialistas,
              DJs, buffets e todos os fornecedores que você precisa em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ modo: "cadastro", perfil: "noiva" }}>
                  Sou noiva
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth" search={{ modo: "cadastro", perfil: "fornecedor" }}>
                  Sou fornecedor
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {PRICE_BRL}/mês · sem comissão sobre os contratos
            </p>
          </div>
          <div className="animate-rise overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
            <img
              src={heroImage}
              alt="Noiva e noivo segurando buquê de rosas claras"
              width={1408}
              height={1008}
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-4xl">Planeje tudo em um só lugar.</h2>
        <div className="gold-rule my-6 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Heart, t: "Meu Casamento", d: "Contagem regressiva, progresso e tudo o que falta resolver." },
            { icon: ListChecks, t: "Checklist inteligente", d: "28 categorias com status do não iniciado ao contratado." },
            { icon: Search, t: "Fornecedores", d: "Busca com filtros por categoria, cidade, preço e avaliação." },
            { icon: Heart, t: "Favoritos", d: "Salve os fornecedores que você amou e compare depois." },
            { icon: Store, t: "Contatos", d: "Histórico de todos os fornecedores com quem você falou." },
            { icon: Sparkles, t: "Progresso", d: "Veja em porcentagem o quanto do casamento já está resolvido." },
          ].map((f) => (
            <div key={f.t} className="surface p-6">
              <f.icon className="size-5 text-gold" />
              <h3 className="mt-4 font-display text-2xl">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl">Encontre o fornecedor certo.</h2>
          <div className="gold-rule my-6 w-24" />
          <div className="flex flex-wrap gap-2">
            {(categories ?? []).map((c) => (
              <Link
                key={c.slug}
                to="/fornecedores/$categoria"
                params={{ categoria: c.slug }}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-gold"
              >
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
          <Button asChild variant="link" className="mt-6 px-0">
            <Link to="/fornecedores">Ver todos os fornecedores →</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-4xl">Como funciona?</h2>
        <div className="gold-rule my-6 w-24" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s} className="surface p-5">
              <span className="font-display text-3xl text-gold">{i + 1}</span>
              <p className="mt-2 text-sm">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-accent/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl">
            Faça seu negócio ser encontrado por noivas.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Coloque seu negócio na frente de pessoas que estão planejando o casamento agora.
            Crie sua vitrine, mostre seu portfólio e receba oportunidades direto no painel.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth" search={{ modo: "cadastro", perfil: "fornecedor" }}>
              Divulgar meu negócio
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-4xl">Planos</h2>
        <div className="gold-rule my-6 w-24" />
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Noiva",
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
          ].map((p) => (
            <div key={p.title} className="surface p-8">
              <h3 className="font-display text-3xl">{p.title}</h3>
              <p className="mt-2 font-display text-4xl">
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
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="font-display text-4xl">Perguntas frequentes</h2>
        <div className="gold-rule my-6 w-24" />
        <Accordion type="single" collapsible>
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 text-center">
        <h2 className="font-display text-5xl">Comece a planejar seu casamento.</h2>
        <Button asChild size="lg" className="mt-8">
          <Link to="/auth" search={{ modo: "cadastro", perfil: "noiva" }}>
            Criar minha conta
          </Link>
        </Button>
      </section>

      <SiteFooter />
    </div>
  );
}
