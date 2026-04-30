import { createAnonSupabaseClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { VehicleRow } from "@/types/database";

export async function getPublicVehicles(): Promise<VehicleRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAnonSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id, title, description, image_url, sort_order, is_active, created_at, updated_at"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return [];
  const rows = (data ?? []) as VehicleRow[];
  return rows.filter((r) => Boolean(r.image_url?.trim()));
}
