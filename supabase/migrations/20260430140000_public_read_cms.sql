-- Allow public (anon key) to read published CMS data for SSR / SEO

create policy "vehicles_select_public_active"
  on public.vehicles for select
  to anon, authenticated
  using (is_active = true);

create policy "gallery_items_select_public_active"
  on public.gallery_items for select
  to anon, authenticated
  using (is_active = true);

create policy "blog_posts_select_published"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published'::public.post_status);
