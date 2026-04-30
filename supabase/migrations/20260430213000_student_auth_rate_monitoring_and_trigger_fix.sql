-- Harden rate-limit trigger behavior and add monitoring helpers.

create or replace function public.student_auth_attempts_reject_when_locked()
returns trigger
language plpgsql
as $$
declare
  v_locked_until timestamptz;
begin
  if new.success is distinct from false then
    return new;
  end if;

  -- Prevent recursive block when trigger itself writes audit rows.
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  if new.failure_reason = 'rate_limited' then
    return new;
  end if;

  if new.action_type in ('activate', 'reset') then
    select max(a.locked_until)
      into v_locked_until
      from public.student_auth_attempts a
     where a.action_type = new.action_type
       and a.locked_until is not null
       and a.locked_until > now()
       and (
            a.ip_hash is not distinct from new.ip_hash
         or (
              new.tc_hash is not null
              and a.tc_hash is not distinct from new.tc_hash
            )
         or (
              new.phone_last4_hash is not null
              and a.phone_last4_hash is not distinct from new.phone_last4_hash
            )
         or (
              new.identity_serial_hash is not null
              and a.identity_serial_hash is not distinct from new.identity_serial_hash
            )
       );

    if v_locked_until is not null then
      insert into public.student_auth_attempts (
        action_type,
        tc_hash,
        username_hash,
        ip_hash,
        phone_last4_hash,
        identity_serial_hash,
        success,
        failure_reason,
        locked_until
      ) values (
        new.action_type,
        new.tc_hash,
        new.username_hash,
        new.ip_hash,
        new.phone_last4_hash,
        new.identity_serial_hash,
        false,
        'rate_limited',
        v_locked_until
      );
      return null;
    end if;

    return new;
  end if;

  if new.action_type = 'login' then
    select max(a.locked_until)
      into v_locked_until
      from public.student_auth_attempts a
     where a.action_type = 'login'
       and a.locked_until is not null
       and a.locked_until > now()
       and (
            a.ip_hash is not distinct from new.ip_hash
         or (
              new.username_hash is not null
              and a.username_hash is not distinct from new.username_hash
            )
       );

    if v_locked_until is not null then
      insert into public.student_auth_attempts (
        action_type,
        tc_hash,
        username_hash,
        ip_hash,
        phone_last4_hash,
        identity_serial_hash,
        success,
        failure_reason,
        locked_until
      ) values (
        new.action_type,
        new.tc_hash,
        new.username_hash,
        new.ip_hash,
        new.phone_last4_hash,
        new.identity_serial_hash,
        false,
        'rate_limited',
        v_locked_until
      );
      return null;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.student_auth_attempts_reject_when_locked() is
  'Cancels inserts during active lock and writes an explicit rate_limited audit row instead of raising exception.';

create or replace view public.student_auth_top_tc_last_hour as
select
  tc_hash,
  count(*)::bigint as attempt_count
from public.student_auth_attempts
where created_at >= now() - interval '1 hour'
  and tc_hash is not null
group by tc_hash
order by attempt_count desc, tc_hash asc;

create or replace view public.student_auth_top_failed_ip_last_hour as
select
  ip_hash,
  count(*)::bigint as fail_count
from public.student_auth_attempts
where created_at >= now() - interval '1 hour'
  and ip_hash is not null
  and success = false
group by ip_hash
order by fail_count desc, ip_hash asc;

create or replace function public.get_student_auth_monitoring_last_hour(limit_rows int default 20)
returns table (
  metric text,
  key_hash text,
  total_count bigint
)
language sql
stable
as $$
  (
    select
      'top_tc_attempts'::text as metric,
      t.tc_hash as key_hash,
      t.attempt_count as total_count
    from public.student_auth_top_tc_last_hour t
    order by t.attempt_count desc, t.tc_hash asc
    limit greatest(limit_rows, 1)
  )
  union all
  (
    select
      'top_failed_ip'::text as metric,
      i.ip_hash as key_hash,
      i.fail_count as total_count
    from public.student_auth_top_failed_ip_last_hour i
    order by i.fail_count desc, i.ip_hash asc
    limit greatest(limit_rows, 1)
  );
$$;

