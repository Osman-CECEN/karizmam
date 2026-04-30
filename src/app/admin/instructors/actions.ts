"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/requireRole";
import type { InstructorRow } from "@/types/database";

function serviceError() {
  return { ok: false as const, error: "Veritabanı bağlantısı yapılandırılmamış." };
}

export async function listInstructorsAdmin(): Promise<{
  ok: boolean;
  data?: InstructorRow[];
  error?: string;
}> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("instructors")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as InstructorRow[] };
}

export type InstructorInput = {
  name: string;
  role_title: string;
  bio: string;
  sort_order: number;
  is_active: boolean;
  is_visible_on_home: boolean;
  image_url: string | null;
};

export async function createInstructor(
  input: InstructorInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("instructors")
    .insert({
      name: input.name.trim(),
      role_title: input.role_title.trim(),
      bio: input.bio.trim() || null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      is_visible_on_home: input.is_visible_on_home,
      image_url: input.image_url,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/instructors");
  return { ok: true, id: data?.id };
}

export async function updateInstructor(
  id: string,
  input: InstructorInput
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { error } = await supabase
    .from("instructors")
    .update({
      name: input.name.trim(),
      role_title: input.role_title.trim(),
      bio: input.bio.trim() || null,
      sort_order: input.sort_order,
      is_active: input.is_active,
      is_visible_on_home: input.is_visible_on_home,
      image_url: input.image_url,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/instructors");
  return { ok: true };
}

export async function deleteInstructor(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { error } = await supabase.from("instructors").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/instructors");
  return { ok: true };
}
