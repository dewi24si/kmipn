insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('laporan-foto', 'laporan-foto', true, 10485760, array['image/jpeg','image/png','image/webp','video/mp4'])
on conflict (id) do nothing;

create policy "laporan_foto_public_upload" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'laporan-foto');
