ALTER TABLE public.wedding_tasks ADD CONSTRAINT wedding_tasks_bride_category_key UNIQUE (bride_id, category_id);
GRANT UPDATE ON public.reports TO authenticated;
CREATE POLICY "reports admin update" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));