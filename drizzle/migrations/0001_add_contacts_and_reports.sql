CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id uuid NOT NULL,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  status public.lead_status NOT NULL DEFAULT 'novo',
  notes text,
  last_contact_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bride_id, vendor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts bride access" ON public.contacts FOR ALL TO authenticated USING (bride_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (bride_id = auth.uid());

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports insert own" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports read admin" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR reporter_id = auth.uid());

CREATE INDEX contacts_bride_idx ON public.contacts(bride_id);
CREATE INDEX leads_vendor_idx ON public.leads(vendor_id, created_at DESC);
CREATE INDEX wedding_tasks_bride_idx ON public.wedding_tasks(bride_id);
CREATE INDEX vendors_marketplace_idx ON public.vendors(status, primary_category_id, state);
CREATE INDEX favorites_user_idx ON public.favorites(user_id);
