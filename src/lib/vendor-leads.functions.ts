import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const leadUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["novo", "contatado", "negociacao", "fechado", "perdido"]),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  consultationAt: z.string().datetime({ offset: true }).nullable(),
  vendorNotes: z.string().trim().max(2000).nullable(),
});

export type VendorLeadUpdate = z.infer<typeof leadUpdateSchema>;

export const updateVendorLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => leadUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: lead, error } = await context.supabase
      .from("leads")
      .update({
        status: data.status,
        wedding_date: data.weddingDate,
        consultation_at: data.consultationAt,
        vendor_notes: data.vendorNotes || null,
      })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!lead) throw new Error("Lead não encontrado ou sem permissão para edição.");
    return { id: lead.id };
  });