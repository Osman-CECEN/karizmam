"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/requireRole";
import { parseVehicleStoragePathFromPublicUrl } from "@/lib/vehicles/vehicleImageStorage";
import type { VehicleRow } from "@/types/database";

function serviceError() {
  return { ok: false as const, error: "Veritabanı bağlantısı yapılandırılmamış." };
}

function mapDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("violates") && m.includes("not-null")) {
    return "Zorunlu alanlar eksik. Model başlığını ve görseli kontrol edin.";
  }
  if (m.includes("duplicate") || m.includes("unique")) {
    return "Bu kayıt zaten var veya çakışan bir değer gönderildi.";
  }
  return message || "İşlem tamamlanamadı.";
}

export async function listVehiclesAdmin(): Promise<{
  ok: boolean;
  data?: VehicleRow[];
  error?: string;
}> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return { ok: false, error: mapDbError(error.message) };
  return { ok: true, data: (data ?? []) as VehicleRow[] };
}

export type VehicleInput = {
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
};

export async function createVehicle(
  input: VehicleInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      title: input.title.trim(),
      description: input.description.trim() || null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      image_url: input.image_url,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: mapDbError(error.message) };
  revalidatePath("/");
  revalidatePath("/admin/vehicles");
  return { ok: true, id: data?.id };
}

export async function updateVehicle(
  id: string,
  input: VehicleInput
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { error } = await supabase
    .from("vehicles")
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      image_url: input.image_url,
    })
    .eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };
  revalidatePath("/");
  revalidatePath("/admin/vehicles");
  return { ok: true };
}

export async function deleteVehicle(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();

  const { data: row, error: fetchErr } = await supabase
    .from("vehicles")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: mapDbError(fetchErr.message) };

  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };

  const path = parseVehicleStoragePathFromPublicUrl(row?.image_url ?? "");
  if (path) {
    const { error: rmErr } = await supabase.storage.from("vehicles").remove([path]);
    if (rmErr) {
      console.warn("[vehicles] Depodan silinemedi:", rmErr.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/vehicles");
  return { ok: true };
}

export async function setVehicleActive(
  id: string,
  is_active: boolean
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { error } = await supabase
    .from("vehicles")
    .update({ is_active })
    .eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };
  revalidatePath("/");
  revalidatePath("/admin/vehicles");
  return { ok: true };
}
