-- Optional profile banner (GIFs allowed here; avatars are converted to static images on upload)
alter table public.profiles add column banner_url text;

-- Banners: images only, max 4MB, publicly readable
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 4194304, array['image/jpeg','image/png','image/webp','image/gif']);

-- Users can only write inside their own folder: banners/<user id>/...
create policy "Anyone can view banners" on storage.objects
  for select to public using (bucket_id = 'banners');

create policy "Users can upload their own banner" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own banner" on storage.objects
  for update to authenticated
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);
