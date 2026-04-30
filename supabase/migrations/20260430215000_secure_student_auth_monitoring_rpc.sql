-- Monitoring access model:
-- - Direct table access to public.student_auth_attempts remains service_role-only.
-- - Admin/office dashboards should use this RPC, not direct selects.

create or replace function public.get_student_auth_monitoring_last_hour(limit_rows int default 20)
returns table (
  metric text,
  key_hash text,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or public.is_office()) then
    raise exception 'insufficient_role_for_student_auth_monitoring';
  end if;

  return query
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
end;
$$;

revoke all on function public.get_student_auth_monitoring_last_hour(int) from public;
grant execute on function public.get_student_auth_monitoring_last_hour(int) to authenticated;
grant execute on function public.get_student_auth_monitoring_last_hour(int) to service_role;

comment on function public.get_student_auth_monitoring_last_hour(int) is
  'Security-definer RPC for admin/office auth monitoring. Direct access to student_auth_attempts stays restricted.';

