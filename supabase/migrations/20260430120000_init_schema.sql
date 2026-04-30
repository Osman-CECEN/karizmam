-- Karizmam: core schema, RLS, storage, seed (run in Supabase SQL Editor or via CLI)

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum (
  'member',
  'student',
  'instructor',
  'office',
  'admin'
);

create type public.post_status as enum (
  'draft',
  'published'
);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Instructors (CMS + public home)
create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null,
  bio text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_visible_on_home boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Future modules (RLS: admin-only for now; read-only Akınsoft sync can be added later)
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_test_results (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  test_title text not null,
  score numeric,
  total_questions int,
  correct_count int,
  wrong_count int,
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  student_code text unique,
  license_class text,
  registration_status text,
  document_status text,
  payment_status text,
  assigned_instructor_id uuid references public.instructors (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger instructors_set_updated_at
  before update on public.instructors
  for each row execute function public.set_updated_at();

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create trigger gallery_items_set_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- New auth user -> profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'member'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check (RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.user_role
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.vehicles enable row level security;
alter table public.gallery_items enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.member_test_results enable row level security;
alter table public.students enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- instructors
create policy "instructors_select_public_or_admin"
  on public.instructors for select
  to anon, authenticated
  using (
    (is_active and is_visible_on_home)
    or public.is_admin()
  );

create policy "instructors_insert_admin"
  on public.instructors for insert
  to authenticated
  with check (public.is_admin());

create policy "instructors_update_admin"
  on public.instructors for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "instructors_delete_admin"
  on public.instructors for delete
  to authenticated
  using (public.is_admin());

-- Admin-only placeholder tables
create policy "vehicles_admin_all"
  on public.vehicles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "gallery_items_admin_all"
  on public.gallery_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "blog_posts_admin_all"
  on public.blog_posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_settings_admin_all"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "member_test_results_admin_all"
  on public.member_test_results for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "students_admin_all"
  on public.students for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Storage: instructors bucket (public read)
insert into storage.buckets (id, name, public)
values ('instructors', 'instructors', true)
on conflict (id) do nothing;

create policy "instructors_bucket_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'instructors');

create policy "instructors_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'instructors'
    and public.is_admin()
  );

create policy "instructors_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'instructors' and public.is_admin())
  with check (bucket_id = 'instructors' and public.is_admin());

create policy "instructors_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'instructors' and public.is_admin());

-- Seed instructors (matches previous static home section; images under /public)
insert into public.instructors
  (name, role_title, bio, image_url, sort_order, is_active, is_visible_on_home)
values
  ('Ali ÇEÇEN', 'Kurucu', null, '/images/instructors/ali-cecen.jpg', 0, true, true),
  ('Abdullah TÜRK', 'Direksiyon Sorumlusu', null, '/images/instructors/abdullah-turk.jpg', 1, true, true),
  ('Özcan ÇETİN', 'Halkla İlişkiler', null, '/images/instructors/ozcan-cetin.jpg', 2, true, true),
  ('Zöhre EMUR', 'Halkla ilişkiler', null, '/images/instructors/zohre-emur.jpg', 3, true, true),
  ('Meral ERCİL', 'Eğitmen', null, '/images/instructors/meral-ercil.jpg', 4, true, true),
  ('Yasemin TUNÇOĞLU', 'Eğitmen', null, '/images/instructors/yasemin-tuncoglu.jpg', 5, true, true),
  ('Engin ATABEY', 'Eğitmen', null, '/images/instructors/engin-atbey.jpg', 6, true, true),
  ('Gökhan ALICI', 'İlk Yardım Öğretmeni', null, '/images/instructors/gokhan-alici.jpg', 7, true, true),
  ('.......', 'Trafik Öğretmeni', null, '/images/instructors/trafik-ogretmeni.jpg', 8, true, true),
  ('Osman ÇEÇEN', 'Evrak Kayıt', null, '/images/instructors/osman-cecen.jpg', 9, true, true);
