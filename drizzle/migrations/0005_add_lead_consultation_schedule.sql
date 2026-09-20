ALTER TABLE public.leads
  ADD COLUMN consultation_at timestamp with time zone,
  ADD COLUMN vendor_notes text;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_vendor_notes_length CHECK (vendor_notes IS NULL OR char_length(vendor_notes) <= 2000);

CREATE INDEX leads_vendor_consultation_idx
  ON public.leads(vendor_id, consultation_at)
  WHERE consultation_at IS NOT NULL;