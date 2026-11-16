alter table public.products add column image_path text;

-- Product photos are shop imagery: anyone may read them (needed to create view links)
create policy "Anyone can view product photos" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-photos');
