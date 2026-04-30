"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/requireRole";
import { parseGalleryStoragePathFromPublicUrl } from "@/lib/gallery/galleryImageStorage";
import type { GalleryItemRow } from "@/types/database";

function serviceError() {
  return { ok: false as const, error: "Veritabanı bağlantısı yapılandırılmamış." };
}

function mapDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("violates") && m.includes("not-null")) {
    return "Zorunlu alanlar eksik. Başlık ve görsel yollarını kontrol edin.";
  }
  if (m.includes("duplicate") || m.includes("unique")) {
    return "Bu kayıt zaten var veya çakışan bir değer gönderildi.";
  }
  return message || "İşlem tamamlanamadı.";
}

export async function listGalleryAdmin(): Promise<{
  ok: boolean;
  data?: GalleryItemRow[];
  error?: string;
}> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return { ok: false, error: mapDbError(error.message) };
  return { ok: true, data: (data ?? []) as GalleryItemRow[] };
}

export type GalleryInput = {
  title: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
};

export async function createGalleryItem(
  input: GalleryInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("gallery_items")
    .insert({
      title: input.title.trim(),
      alt_text: input.alt_text.trim() || null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      image_url: input.image_url,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: mapDbError(error.message) };
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { ok: true, id: data?.id };
}

export async function updateGalleryItem(
  id: string,
  input: GalleryInput
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { error } = await supabase
    .from("gallery_items")
    .update({
      title: input.title.trim(),
      alt_text: input.alt_text.trim() || null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      image_url: input.image_url,
    })
    .eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { ok: true };
}

export async function deleteGalleryItem(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();

  const { data: row, error: fetchErr } = await supabase
    .from("gallery_items")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: mapDbError(fetchErr.message) };

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };

  const url = row?.image_url?.trim() ?? "";
  const path = parseGalleryStoragePathFromPublicUrl(url);
  if (path) {
    const { error: rmErr } = await supabase.storage.from("gallery").remove([path]);
    if (rmErr) {
      console.warn("[gallery] Depodan silinemedi:", rmErr.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { ok: true };
}

export async function setGalleryItemActive(
  id: string,
  is_active: boolean
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { error } = await supabase
    .from("gallery_items")
    .update({ is_active })
    .eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { ok: true };
}
