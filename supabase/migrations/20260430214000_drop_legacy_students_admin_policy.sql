-- Cleanup: legacy broad policy no longer needed.
drop policy if exists "students_admin_all" on public.students;

