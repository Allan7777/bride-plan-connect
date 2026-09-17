CREATE POLICY "portfolio image read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'vendor-portfolios');