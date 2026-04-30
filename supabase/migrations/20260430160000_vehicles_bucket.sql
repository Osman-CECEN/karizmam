-- Public vehicles bucket (admin upload, anon read via public URL)

insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do nothing;

create policy "vehicles_bucket_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'vehicles');

create policy "vehicles_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicles'
    and public.is_admin()
  );

create policy "vehicles_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'vehicles' and public.is_admin())
  with check (bucket_id = 'vehicles' and public.is_admin());

create policy "vehicles_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehicles' and public.is_admin());
