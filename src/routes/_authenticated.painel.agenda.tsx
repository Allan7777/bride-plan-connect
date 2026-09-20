import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck2, CalendarDays, Clock3, HeartHandshake } from "lucide-react";
import { AccountGuard } from "@/components/account-guard";
import { AppShell } from "@/components/app-shell";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorLeadDialog, type VendorLead } from "@/components/vendor-lead-dialog";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_STATUS_LABELS } from "@/lib/noivahub";

export const Route = createFileRoute("/_authenticated/painel/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de consultas — NoivaHub" },
      { name: "description", content: "Organize consultas de orçamento, datas de casamento e próximos passos dos seus leads." },
      { property: "og:title", content: "Agenda de consultas — NoivaHub" },
      { property: "og:description", content: "Agenda de consultas e casamentos do fornecedor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgendaRoute,
});

function AgendaRoute() {
  return <AccountGuard type="vendor">{(account) => <VendorAgenda vendorId={account.vendorId} />}</AccountGuard>;
}

type AgendaEvent = {
  id: string;
  type: "consultation" | "wedding";
  date: Date;
  lead: VendorLead;
};

function VendorAgenda({ vendorId }: { vendorId: string | null }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["vendor-agenda", vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,bride_name,city,state,wedding_date,consultation_at,vendor_notes,message,status,created_at,categories:category_id(name)")
        .eq("vendor_id", vendorId ?? "")
        .order("consultation_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as VendorLead[];
    },
  });

  const events = useMemo<AgendaEvent[]>(() => leads.flatMap((lead) => {
    const result: AgendaEvent[] = [];
    if (lead.consultation_at) result.push({ id: `${lead.id}-consultation`, type: "consultation", date: new Date(lead.consultation_at), lead });
    if (lead.wedding_date) result.push({ id: `${lead.id}-wedding`, type: "wedding", date: new Date(`${lead.wedding_date}T12:00:00`), lead });
    return result;
  }).sort((a, b) => a.date.getTime() - b.date.getTime()), [leads]);

  const selectedEvents = events.filter((event) => isSameDay(event.date, selectedDate));
  const upcoming = events.filter((event) => event.date >= startOfDay(new Date())).slice(0, 8);
  const consultationDates = events.filter((event) => event.type === "consultation").map((event) => event.date);
  const weddingDates = events.filter((event) => event.type === "wedding").map((event) => event.date);

  return (
    <AppShell type="vendor">
      <div className="mx-auto max-w-6xl p-5 md:p-10">
        <p className="text-sm text-muted-foreground">Organização comercial</p>
        <h1 className="font-display text-4xl">Agenda</h1>
        <p className="mt-2 text-muted-foreground">Consultas de orçamento e datas de casamento reunidas em um só lugar.</p>

        {isLoading ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(320px,440px)_1fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(320px,440px)_1fr]">
            <section className="surface p-4 md:p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={{ consultations: consultationDates, weddings: weddingDates }}
                modifiersClassNames={{ consultations: "font-semibold ring-1 ring-primary/50", weddings: "bg-accent text-accent-foreground" }}
                className="pointer-events-auto mx-auto w-full p-0 [--cell-size:2.75rem]"
              />
              <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />Consulta</span>
                <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-accent-foreground" />Casamento</span>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</h2>
              <div className="mt-4 space-y-3">
                {selectedEvents.map((event) => <AgendaEventCard key={event.id} event={event} />)}
                {selectedEvents.length === 0 ? (
                  <div className="surface p-8 text-center"><CalendarDays className="mx-auto size-7 text-muted-foreground" /><p className="mt-3 font-medium">Nenhum compromisso nesta data</p><p className="mt-1 text-sm text-muted-foreground">Abra um lead para agendar uma consulta ou registrar o casamento.</p></div>
                ) : null}
              </div>
            </section>
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Visão cronológica</p><h2 className="font-display text-3xl">Próximos compromissos</h2></div><span className="text-sm text-muted-foreground">{upcoming.length} na agenda</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {upcoming.map((event) => <AgendaEventCard key={`upcoming-${event.id}`} event={event} />)}
          </div>
          {!isLoading && upcoming.length === 0 ? <div className="surface mt-4 p-10 text-center text-muted-foreground">As próximas consultas e datas de casamento aparecerão aqui.</div> : null}
        </section>
      </div>
    </AppShell>
  );
}

function AgendaEventCard({ event }: { event: AgendaEvent }) {
  const isConsultation = event.type === "consultation";
  return (
    <article className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          {isConsultation ? <Clock3 className="size-5" /> : <HeartHandshake className="size-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">{isConsultation ? "Consulta de orçamento" : "Data do casamento"}</p>
          <p className="truncate font-medium">{event.lead.bride_name ?? "Noiva interessada"}</p>
          <p className="text-sm text-muted-foreground">
            {format(event.date, isConsultation ? "dd/MM/yyyy 'às' HH:mm" : "dd/MM/yyyy", { locale: ptBR })} · {LEAD_STATUS_LABELS[event.lead.status]}
          </p>
        </div>
      </div>
      <VendorLeadDialog lead={event.lead} triggerLabel="Editar" />
    </article>
  );
}