import { createAnonSupabaseClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { InstructorRow } from "@/types/database";

/** Public home: active + visible, ordered. Empty when Supabase is off or on error. */
export async function getPublicInstructors(): Promise<InstructorRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAnonSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("instructors")
    .select(
      "id, name, role_title, bio, image_url, sort_order, is_active, is_visible_on_home, created_at, updated_at"
    )
    .eq("is_active", true)
    .eq("is_visible_on_home", true)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data ?? []) as InstructorRow[];
}
