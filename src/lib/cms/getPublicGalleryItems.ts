import { createAnonSupabaseClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { GalleryItemRow } from "@/types/database";

export async function getPublicGalleryItems(): Promise<GalleryItemRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAnonSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("gallery_items")
    .select(
      "id, title, image_url, alt_text, sort_order, is_active, created_at, updated_at"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return [];
  const rows = (data ?? []) as GalleryItemRow[];
  return rows.filter((r) => Boolean(r.image_url?.trim()));
}
