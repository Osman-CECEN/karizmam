-- Public gallery bucket + allow null image_url until upload completes (admin flow)

alter table public.gallery_items
  alter column image_url drop not null;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery_bucket_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'gallery');

create policy "gallery_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and public.is_admin()
  );

create policy "gallery_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "gallery_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());
