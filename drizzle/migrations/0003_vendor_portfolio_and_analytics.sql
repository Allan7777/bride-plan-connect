ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS work_description jsonb NOT NULL DEFAULT '{"blocks":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS portfolio_limit integer NOT NULL DEFAULT 20;

ALTER TABLE public.vendors
  ADD CONSTRAINT vendors_portfolio_limit_range CHECK (portfolio_limit BETWEEN 1 AND 100),
  ADD CONSTRAINT vendors_whatsapp_message_length CHECK (whatsapp_message IS NULL OR char_length(whatsapp_message) <= 1000),
  ADD CONSTRAINT vendors_whatsapp_digits CHECK (whatsapp IS NULL OR whatsapp ~ '^55[1-9][0-9]{9,10}$');

ALTER TABLE public.vendor_photos
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.vendor_photos
  ADD CONSTRAINT vendor_photos_description_length CHECK (description IS NULL OR char_length(description) <= 300);

CREATE UNIQUE INDEX IF NOT EXISTS vendor_photos_single_cover
  ON public.vendor_photos (vendor_id) WHERE is_cover;
CREATE UNIQUE INDEX IF NOT EXISTS vendor_photos_storage_path_unique
  ON public.vendor_photos (storage_path) WHERE storage_path IS NOT NULL;

CREATE TYPE public.vendor_event_type AS ENUM ('profile_view', 'favorite', 'budget_request', 'whatsapp_click', 'lead_created');

CREATE TABLE public.vendor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  event_type public.vendor_event_type NOT NULL,
  source text NOT NULL DEFAULT 'perfil_fornecedor',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vendor_events_source_length CHECK (char_length(source) BETWEEN 1 AND 80)
);

GRANT SELECT ON public.vendor_events TO authenticated;
GRANT ALL ON public.vendor_events TO service_role;
ALTER TABLE public.vendor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor events owner read"
ON public.vendor_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_events.vendor_id
      AND (v.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

CREATE INDEX vendor_events_vendor_created_idx ON public.vendor_events (vendor_id, created_at DESC);
CREATE INDEX vendor_events_vendor_type_idx ON public.vendor_events (vendor_id, event_type);

CREATE OR REPLACE FUNCTION public.track_vendor_event(
  _vendor_id uuid,
  _event_type public.vendor_event_type,
  _category_id uuid DEFAULT NULL,
  _source text DEFAULT 'perfil_fornecedor'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  current_actor uuid := auth.uid();
BEGIN
  IF char_length(_source) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Invalid event source';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.vendors
    WHERE id = _vendor_id AND status = 'aprovado'::public.vendor_status
  ) THEN
    RAISE EXCEPTION 'Vendor unavailable';
  END IF;

  INSERT INTO public.vendor_events (vendor_id, actor_id, category_id, event_type, source)
  VALUES (_vendor_id, current_actor, _category_id, _event_type, _source)
  RETURNING id INTO new_id;

  IF _event_type = 'profile_view' THEN
    UPDATE public.vendors SET views = views + 1 WHERE id = _vendor_id;
  ELSIF _event_type = 'whatsapp_click' THEN
    UPDATE public.vendors SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = _vendor_id;
  END IF;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.track_vendor_event(uuid, public.vendor_event_type, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_vendor_event(uuid, public.vendor_event_type, uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_vendor_photo_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_limit integer;
  photo_count integer;
BEGIN
  SELECT portfolio_limit INTO allowed_limit FROM public.vendors WHERE id = NEW.vendor_id;
  SELECT count(*) INTO photo_count FROM public.vendor_photos WHERE vendor_id = NEW.vendor_id;
  IF allowed_limit IS NULL OR photo_count >= allowed_limit THEN
    RAISE EXCEPTION 'Portfolio image limit reached';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_vendor_photo_limit_before_insert
BEFORE INSERT ON public.vendor_photos
FOR EACH ROW EXECUTE FUNCTION public.enforce_vendor_photo_limit();

CREATE POLICY "portfolio owner upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'vendor-portfolios'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  AND EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.user_id = auth.uid()
      AND v.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "portfolio owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'vendor-portfolios'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vendor-portfolios'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

CREATE POLICY "portfolio owner or admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'vendor-portfolios'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);
