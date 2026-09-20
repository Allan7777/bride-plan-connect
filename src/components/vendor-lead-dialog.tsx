import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CalendarDays, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/lib/noivahub";
import { updateVendorLead } from "@/lib/vendor-leads.functions";
import { cn } from "@/lib/utils";

export type VendorLead = {
  id: string;
  bride_name: string | null;
  city: string | null;
  state: string | null;
  wedding_date: string | null;
  consultation_at: string | null;
  vendor_notes: string | null;
  message: string | null;
  status: "novo" | "contatado" | "negociacao" | "fechado" | "perdido";
  created_at: string;
  categories: { name: string } | null;
};

function dateFromValue(value: string | null) {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

function localDateTimeValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function VendorLeadDialog({ lead, triggerLabel = "Organizar" }: { lead: VendorLead; triggerLabel?: string }) {
  const saveLead = useServerFn(updateVendorLead);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [weddingDate, setWeddingDate] = useState<Date | undefined>(dateFromValue(lead.wedding_date));
  const [consultationAt, setConsultationAt] = useState(localDateTimeValue(lead.consultation_at));
  const [notes, setNotes] = useState(lead.vendor_notes ?? "");

  useEffect(() => {
    if (!open) return;
    setStatus(lead.status);
    setWeddingDate(dateFromValue(lead.wedding_date));
    setConsultationAt(localDateTimeValue(lead.consultation_at));
    setNotes(lead.vendor_notes ?? "");
  }, [lead, open]);

  async function handleSave() {
    if (notes.trim().length > 2000) {
      toast.error("As observações podem ter no máximo 2.000 caracteres.");
      return;
    }
    const consultationDate = consultationAt ? new Date(consultationAt) : null;
    if (consultationDate && Number.isNaN(consultationDate.getTime())) {
      toast.error("Informe uma data e horário válidos para a consulta.");
      return;
    }
    setSaving(true);
    try {
      await saveLead({
        data: {
          id: lead.id,
          status,
          weddingDate: weddingDate ? format(weddingDate, "yyyy-MM-dd") : null,
          consultationAt: consultationDate?.toISOString() ?? null,
          vendorNotes: notes.trim() || null,
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vendor-leads"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-agenda"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-dashboard"] }),
      ]);
      toast.success("Lead e agenda atualizados.");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pencil className="size-4" />{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Organizar {lead.bride_name ?? "este lead"}</DialogTitle>
          <DialogDescription>Atualize a etapa, a consulta de orçamento e a data do casamento.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <label className="grid gap-2 text-sm font-medium">
            Etapa do lead
            <Select value={status} onValueChange={(value) => setStatus(value as VendorLead["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUS_ORDER.map((value) => <SelectItem key={value} value={value}>{LEAD_STATUS_LABELS[value]}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            <span className="flex items-center gap-2"><CalendarClock className="size-4 text-gold" />Consulta de orçamento</span>
            <Input type="datetime-local" value={consultationAt} onChange={(event) => setConsultationAt(event.target.value)} />
          </label>

          <div className="grid gap-2 text-sm font-medium">
            <span className="flex items-center gap-2"><CalendarDays className="size-4 text-gold" />Data do casamento</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start font-normal", !weddingDate && "text-muted-foreground")}>
                  <CalendarDays className="size-4" />
                  {weddingDate ? format(weddingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={weddingDate} onSelect={setWeddingDate} className="pointer-events-auto p-3" />
              </PopoverContent>
            </Popover>
            {weddingDate ? <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => setWeddingDate(undefined)}>Remover data</Button> : null}
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Observações internas
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={4} placeholder="Preferências, próximos passos e detalhes da conversa" />
            <span className="text-right text-xs font-normal text-muted-foreground">{notes.length}/2.000</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : null}Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}