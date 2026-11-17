drop policy if exists "Anyone can view product photos" on storage.objects;
create policy "Admins view product photos" on storage.objects for select to authenticated
  using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));