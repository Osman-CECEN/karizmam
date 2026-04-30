-- Rate limit v2: composite identity columns, DB-side lock enforcement, indexes

alter table public.student_auth_attempts
  add column if not exists phone_last4_hash text,
  add column if not exists identity_serial_hash text;

comment on column public.student_auth_attempts.phone_last4_hash is 'HMAC hash of normalized phone last4; composite rate key for activate/reset.';
comment on column public.student_auth_attempts.identity_serial_hash is 'HMAC hash of normalized identity serial; composite rate key for activate/reset.';

-- Composite lookups (activate/reset failures in time windows)
create index if not exists student_auth_attempts_identity_composite_idx
  on public.student_auth_attempts (
    action_type,
    tc_hash,
    ip_hash,
    phone_last4_hash,
    identity_serial_hash,
    created_at desc
  )
  where action_type in ('activate', 'reset') and success = false;

create index if not exists student_auth_attempts_lock_scan_idx
  on public.student_auth_attempts (action_type, locked_until desc)
  where locked_until is not null;

-- Login: username + ip lock scans
create index if not exists student_auth_attempts_login_lock_idx
  on public.student_auth_attempts (action_type, username_hash, ip_hash, locked_until)
  where action_type = 'login' and locked_until is not null;

-- ---------------------------------------------------------------------------
-- BEFORE INSERT: reject new failure rows while an active lock exists on any
-- overlapping dimension (OR). Success rows always allowed.
-- ---------------------------------------------------------------------------
create or replace function public.student_auth_attempts_reject_when_locked()
returns trigger
language plpgsql
as $$
declare
  v_locked boolean;
begin
  if new.success is distinct from false then
    return new;
  end if;

  if new.action_type in ('activate', 'reset') then
    select exists (
      select 1
      from public.student_auth_attempts a
      where a.action_type = new.action_type
        and a.locked_until is not null
        and a.locked_until > now()
        and (
          (new.tc_hash is not null and a.tc_hash is not distinct from new.tc_hash)
          or (a.ip_hash is not distinct from new.ip_hash)
          or (
            new.phone_last4_hash is not null
            and a.phone_last4_hash is not distinct from new.phone_last4_hash
          )
          or (
            new.identity_serial_hash is not null
            and a.identity_serial_hash is not distinct from new.identity_serial_hash
          )
        )
    )
    into v_locked;

    if v_locked then
      raise exception 'student_auth_rate_limited';
    end if;

    return new;
  end if;

  if new.action_type = 'login' then
    select exists (
      select 1
      from public.student_auth_attempts a
      where a.action_type = 'login'
        and a.locked_until is not null
        and a.locked_until > now()
        and (
          (
            new.username_hash is not null
            and a.username_hash is not distinct from new.username_hash
          )
          or (a.ip_hash is not distinct from new.ip_hash)
        )
    )
    into v_locked;

    if v_locked then
      raise exception 'student_auth_rate_limited';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists student_auth_attempts_reject_when_locked_trg
  on public.student_auth_attempts;

create trigger student_auth_attempts_reject_when_locked_trg
  before insert on public.student_auth_attempts
  for each row
  execute function public.student_auth_attempts_reject_when_locked();

comment on function public.student_auth_attempts_reject_when_locked() is
  'Blocks INSERT of failed attempts while a row with locked_until > now() overlaps on tc, ip, phone hash, or identity hash (activate/reset), or username/ip (login).';
