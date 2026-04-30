-- Production: audit attempts, password_reset_at, explicit students RLS, column-level hash protection

-- ---------------------------------------------------------------------------
-- student_auth_attempts (service_role only; no client access)
-- ---------------------------------------------------------------------------
create table if not exists public.student_auth_attempts (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in ('activate', 'reset', 'login')),
  tc_hash text,
  username_hash text,
  ip_hash text,
  success boolean not null,
  failure_reason text,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists student_auth_attempts_tc_action_idx
  on public.student_auth_attempts (tc_hash, action_type)
  where tc_hash is not null;

create index if not exists student_auth_attempts_ip_action_idx
  on public.student_auth_attempts (ip_hash, action_type)
  where ip_hash is not null;

create index if not exists student_auth_attempts_username_hash_idx
  on public.student_auth_attempts (username_hash)
  where username_hash is not null;

create index if not exists student_auth_attempts_created_at_idx
  on public.student_auth_attempts (created_at desc);

alter table public.student_auth_attempts enable row level security;

revoke all on table public.student_auth_attempts from public;
revoke all on table public.student_auth_attempts from anon;
revoke all on table public.student_auth_attempts from authenticated;

grant select, insert, update, delete on table public.student_auth_attempts to service_role;

comment on table public.student_auth_attempts is 'Server-side auth audit and rate limits; never exposed to PostgREST clients.';

-- ---------------------------------------------------------------------------
-- students: password reset audit
-- ---------------------------------------------------------------------------
alter table public.students
  add column if not exists password_reset_at timestamptz;

-- ---------------------------------------------------------------------------
-- students: explicit RLS policies (replace)
-- ---------------------------------------------------------------------------
drop policy if exists "students_select_admin_office" on public.students;
drop policy if exists "students_select_own_student_role" on public.students;
drop policy if exists "students_insert_admin_office" on public.students;
drop policy if exists "students_update_admin_office" on public.students;
drop policy if exists "students_delete_admin_office" on public.students;

-- Admin or office: full row access except hash columns are hidden via column GRANTs below
create policy "students_select_admin_or_office"
  on public.students for select
  to authenticated
  using (public.is_admin() or public.is_office());

-- Student: only own linked row
create policy "students_select_own_student"
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

-- Instructor: no SELECT policy (cannot read students)

create policy "students_insert_admin_or_office"
  on public.students for insert
  to authenticated
  with check (public.is_admin() or public.is_office());

create policy "students_update_admin_or_office"
  on public.students for update
  to authenticated
  using (public.is_admin() or public.is_office())
  with check (public.is_admin() or public.is_office());

create policy "students_delete_admin_or_office"
  on public.students for delete
  to authenticated
  using (public.is_admin() or public.is_office());

-- ---------------------------------------------------------------------------
-- Column privileges: authenticated cannot SELECT hash columns (RLS still applies)
-- ---------------------------------------------------------------------------
revoke all on table public.students from anon;

revoke all on table public.students from authenticated;

grant select (
  id,
  profile_id,
  student_code,
  full_name,
  phone,
  email,
  tc_last4,
  phone_last4,
  username,
  license_class,
  registration_status,
  document_status,
  payment_status,
  theory_exam_date,
  driving_exam_date,
  assigned_instructor_id,
  notes,
  initial_login_used,
  must_change_password,
  activated_at,
  password_reset_at,
  created_at,
  updated_at
) on table public.students to authenticated;

grant insert, update, delete on table public.students to authenticated;
