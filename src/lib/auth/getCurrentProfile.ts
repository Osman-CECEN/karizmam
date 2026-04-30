import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

export type CurrentProfile = ProfileRow;

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, username, role, is_active, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as CurrentProfile;
}
