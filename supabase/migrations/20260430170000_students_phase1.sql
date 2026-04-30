-- Phase 1: students table extensions, roles (office/student policies), helpers

create or replace function public.is_office()
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
      and p.role = 'office'::public.user_role
  );
$$;

comment on function public.is_office() is 'Whether the current authenticated user has office panel access.';

-- Expand students columns
alter table public.students
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists tc_last4 text,
  add column if not exists theory_exam_date date,
  add column if not exists driving_exam_date date,
  add column if not exists notes text;

alter table public.students alter column profile_id drop not null;

alter table public.students
  alter column registration_status set default 'active',
  alter column document_status set default 'pending',
  alter column payment_status set default 'pending';

update public.students p
set full_name = coalesce(nullif(trim(pr.full_name), ''), 'Student')
from public.profiles pr
where p.profile_id = pr.id
  and p.full_name is null;

update public.students set full_name = 'Student' where full_name is null;

alter table public.students alter column full_name set not null;

update public.students set registration_status = coalesce(registration_status, 'active');
update public.students set document_status = coalesce(document_status, 'pending');
update public.students set payment_status = coalesce(payment_status, 'pending');

-- Backfill student_code before NOT NULL
do $$
declare
  r record;
  seq int := 0;
  y text := to_char(timezone('Europe/Istanbul'::text, now()), 'YYYY');
begin
  for r in
    select id from public.students where student_code is null order by created_at
  loop
    seq := seq + 1;
    update public.students
    set student_code = 'KRM-' || y || '-' || lpad(seq::text, 4, '0')
    where id = r.id;
  end loop;
end $$;

alter table public.students alter column student_code set not null;

-- Next code for current year (atomic, office/admin only)
create or replace function public.generate_next_student_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y text := to_char(timezone('Europe/Istanbul'::text, now()), 'YYYY');
  prefix text := 'KRM-' || y || '-';
  max_seq int;
begin
  if not (public.is_admin() or public.is_office()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('karizmam_student_code_' || y));

  select coalesce(max(
    (regexp_match(student_code, '^KRM-' || y || '-([0-9]+)$'))[1]::int
  ), 0)
  into max_seq
  from public.students
  where student_code ~ ('^KRM-' || y || '-[0-9]+$');

  return prefix || lpad((max_seq + 1)::text, 4, '0');
end;
$$;

revoke all on function public.generate_next_student_code() from public;
grant execute on function public.generate_next_student_code() to authenticated;

-- Resolve auth user id by email (office/admin only); used for profile_id linking
create or replace function public.resolve_profile_id_by_email(p_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not (public.is_admin() or public.is_office()) then
    return null;
  end if;
  if p_email is null or length(trim(p_email)) = 0 then
    return null;
  end if;
  return (
    select u.id
    from auth.users u
    where lower(trim(u.email)) = lower(trim(p_email))
    limit 1
  );
end;
$$;

revoke all on function public.resolve_profile_id_by_email(text) from public;
grant execute on function public.resolve_profile_id_by_email(text) to authenticated;

-- RLS: replace students policies
drop policy if exists "students_admin_all" on public.students;

create policy "students_select_admin_office"
  on public.students for select
  to authenticated
  using (public.is_admin() or public.is_office());

create policy "students_select_own_student_role"
  on public.students for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'student'::public.user_role
    )
    and profile_id = auth.uid()
  );

create policy "students_insert_admin_office"
  on public.students for insert
  to authenticated
  with check (public.is_admin() or public.is_office());

create policy "students_update_admin_office"
  on public.students for update
  to authenticated
  using (public.is_admin() or public.is_office())
  with check (public.is_admin() or public.is_office());

create policy "students_delete_admin_office"
  on public.students for delete
  to authenticated
  using (public.is_admin() or public.is_office());

-- Office: list profiles for linking (id, name, role only)
create policy "profiles_select_office_all"
  on public.profiles for select
  to authenticated
  using (public.is_office());

-- Office: read active instructors for assignment dropdown
create policy "instructors_select_office_active"
  on public.instructors for select
  to authenticated
  using (public.is_office() and is_active);

-- Student: read only the instructor row linked to their own student record
create policy "instructors_select_assigned_to_student"
  on public.instructors for select
  to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.assigned_instructor_id = public.instructors.id
        and s.profile_id = auth.uid()
    )
  );
