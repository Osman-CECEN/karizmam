-- Central auth: profile username, student identity hashes & activation flags

alter table public.profiles
  add column if not exists username text;

create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username))
  where username is not null;

alter table public.students
  add column if not exists tc_hash text,
  add column if not exists identity_card_no_hash text,
  add column if not exists phone_last4 text,
  add column if not exists username text,
  add column if not exists initial_login_used boolean not null default false,
  add column if not exists must_change_password boolean not null default true,
  add column if not exists activated_at timestamptz;

create unique index if not exists students_username_lower_uidx
  on public.students (lower(username))
  where username is not null;

-- Derive phone_last4 from existing phone where possible
update public.students s
set phone_last4 = right(regexp_replace(coalesce(s.phone, ''), '\D', '', 'g'), 4)
where s.phone_last4 is null
  and length(regexp_replace(coalesce(s.phone, ''), '\D', '', 'g')) >= 4;

comment on column public.students.tc_hash is 'HMAC-SHA512 of normalized national ID; never log plaintext.';
comment on column public.students.identity_card_no_hash is 'HMAC-SHA512 of normalized ID card serial; never shown in admin UI.';
comment on column public.students.phone_last4 is 'Last 4 digits of phone for identity verification (not secret at same level as full TC).';
comment on column public.profiles.username is 'Login handle for password auth; stored lowercase.';
