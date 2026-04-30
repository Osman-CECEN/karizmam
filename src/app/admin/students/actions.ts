"use server";

import { revalidatePath } from "next/cache";
import {
  normalizeIdentitySerial,
  normalizeNationalIdDigits,
} from "@/lib/auth/studentIdentityNormalize";
import { hashSensitiveValue } from "@/lib/auth/sensitiveHash";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/requireRole";
import type {
  InstructorOption,
  ProfileLinkOption,
  StudentRow,
} from "@/types/database";

function serviceError() {
  return { ok: false as const, error: "Veritabanı bağlantısı yapılandırılmamış." };
}

function mapDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("violates") && m.includes("not-null")) {
    return "Zorunlu alanlar eksik. Ad ve öğrenci kodunu kontrol edin.";
  }
  if (m.includes("duplicate") || m.includes("unique")) {
    return "Bu öğrenci kodu zaten kullanılıyor. Farklı bir kod deneyin.";
  }
  if (m.includes("forbidden") || m.includes("42501")) {
    return "Bu işlem için yetkiniz yok.";
  }
  return message || "İşlem tamamlanamadı.";
}

async function requireStaff() {
  await requireRole(["admin", "office"]);
}

/** Columns safe for admin/office UI (no identity hashes). */
const STUDENT_ADMIN_LIST_COLUMNS =
  "id, profile_id, student_code, full_name, phone, email, tc_last4, phone_last4, username, license_class, registration_status, document_status, payment_status, theory_exam_date, driving_exam_date, assigned_instructor_id, notes, initial_login_used, must_change_password, activated_at, password_reset_at, created_at, updated_at";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s.trim()
  );
}

function revalidateStudentPaths() {
  revalidatePath("/admin/students");
  revalidatePath("/office/students");
  revalidatePath("/student/dashboard");
}

export async function listStudents(): Promise<{
  ok: boolean;
  data?: StudentRow[];
  error?: string;
}> {
  await requireStaff();
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("students")
    .select(STUDENT_ADMIN_LIST_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return { ok: false, error: mapDbError(error.message) };
  return { ok: true, data: (data ?? []) as StudentRow[] };
}

export async function listInstructorsForStudents(): Promise<{
  ok: boolean;
  data?: InstructorOption[];
  error?: string;
}> {
  await requireStaff();
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("instructors")
    .select("id, name, role_title")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) return { ok: false, error: mapDbError(error.message) };
  return { ok: true, data: (data ?? []) as InstructorOption[] };
}

export async function listProfilesForStudentLink(): Promise<{
  ok: boolean;
  data?: ProfileLinkOption[];
  error?: string;
}> {
  await requireStaff();
  const supabase = await createClient();
  if (!supabase) return serviceError();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, username, created_at")
    .order("created_at", { ascending: false })
    .limit(400);
  if (error) return { ok: false, error: mapDbError(error.message) };
  return { ok: true, data: (data ?? []) as ProfileLinkOption[] };
}

export type StudentInput = {
  student_code: string;
  use_auto_code: boolean;
  full_name: string;
  phone: string;
  email: string;
  /** Last 4 digits display / fallback when full T.C. is not re-entered. */
  tc_last4: string;
  /** Full 11-digit T.C. — server hashes once; never stored or returned. */
  tc_full: string;
  /** Kimlik kartı seri/no — server hashes once; never shown in UI after save. */
  identity_card_serial: string;
  license_class: string;
  registration_status: string;
  document_status: string;
  payment_status: string;
  theory_exam_date: string | null;
  driving_exam_date: string | null;
  assigned_instructor_id: string | null;
  notes: string;
  manual_profile_id: string;
};

async function resolveProfileId(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  input: Pick<StudentInput, "manual_profile_id" | "email">
): Promise<{ profile_id: string | null; error?: string }> {
  const manual = input.manual_profile_id.trim();
  if (manual) {
    if (!isUuid(manual)) {
      return { profile_id: null, error: "Profil seçimi için geçerli bir kimlik gereklidir." };
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", manual)
      .maybeSingle();
    if (error) return { profile_id: null, error: mapDbError(error.message) };
    if (!data?.id) {
      return { profile_id: null, error: "Seçilen profil bulunamadı." };
    }
    return { profile_id: data.id };
  }

  const em = input.email.trim();
  if (!em) {
    return { profile_id: null };
  }

  const { data: uid, error: rpcErr } = await supabase.rpc(
    "resolve_profile_id_by_email",
    { p_email: em }
  );
  if (rpcErr) {
    return { profile_id: null, error: mapDbError(rpcErr.message) };
  }
  const resolved = uid as string | null;
  return { profile_id: resolved ?? null };
}

async function pickStudentCode(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  input: Pick<StudentInput, "student_code" | "use_auto_code">
): Promise<{ student_code: string; error?: string }> {
  if (input.use_auto_code) {
    const { data, error } = await supabase.rpc("generate_next_student_code");
    if (error || data == null) {
      return {
        student_code: "",
        error: mapDbError(error?.message ?? "Öğrenci kodu üretilemedi."),
      };
    }
    return { student_code: String(data) };
  }

  const code = input.student_code.trim();
  if (!code) {
    return {
      student_code: "",
      error: "Öğrenci kodunu girin veya otomatik oluşturmayı seçin.",
    };
  }
  return { student_code: code };
}

function sanitizeRowPayload(studentCode: string, profileId: string | null, input: StudentInput) {
  const tc = input.tc_last4.trim();

  return {
    student_code: studentCode,
    profile_id: profileId,
    full_name: input.full_name.trim(),
    phone: input.phone.trim() || null,
    email: input.email.trim() || null,
    tc_last4: tc ? tc : null,
    license_class: input.license_class.trim() || null,
    registration_status:
      input.registration_status.trim() || "active",
    document_status: input.document_status.trim() || "pending",
    payment_status: input.payment_status.trim() || "pending",
    theory_exam_date:
      input.theory_exam_date && input.theory_exam_date.length > 0
        ? input.theory_exam_date
        : null,
    driving_exam_date:
      input.driving_exam_date && input.driving_exam_date.length > 0
        ? input.driving_exam_date
        : null,
    assigned_instructor_id:
      input.assigned_instructor_id && input.assigned_instructor_id.length > 0
        ? input.assigned_instructor_id
        : null,
    notes: input.notes.trim() || null,
  };
}

function validateTcFullIfPresent(input: StudentInput): string | null {
  if (!input.tc_full.trim()) return null;
  const d = normalizeNationalIdDigits(input.tc_full);
  if (!d) {
    return "Tam T.C. kimlik numarası 11 rakam olmalıdır.";
  }
  return null;
}

function validateIdentitySerialIfPresent(input: StudentInput): string | null {
  if (!input.identity_card_serial.trim()) return null;
  if (!normalizeIdentitySerial(input.identity_card_serial)) {
    return "Kimlik kartı seri/no formatı geçersiz (ör. A12B34567).";
  }
  return null;
}

/** Mutates `row` with hashed identity fields; never logs raw values. */
function mergeSensitiveStudentFields(
  row: Record<string, unknown>,
  input: StudentInput
) {
  const phoneDigits = input.phone.replace(/\D/g, "");
  if (phoneDigits.length >= 4) {
    row.phone_last4 = phoneDigits.slice(-4);
  }

  const tcDigits = normalizeNationalIdDigits(input.tc_full);
  if (tcDigits) {
    row.tc_hash = hashSensitiveValue(tcDigits);
    row.tc_last4 = tcDigits.slice(-4);
  }

  const serialNorm = input.identity_card_serial.trim()
    ? normalizeIdentitySerial(input.identity_card_serial)
    : null;
  if (serialNorm) {
    row.identity_card_no_hash = hashSensitiveValue(serialNorm);
  }
}

export async function createStudent(
  input: StudentInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireStaff();
  const supabase = await createClient();
  if (!supabase) return serviceError();

  if (!input.full_name.trim()) {
    return { ok: false, error: "Ad soyad zorunludur." };
  }

  const tc = input.tc_last4.trim();
  if (tc && !/^\d{4}$/.test(tc)) {
    return { ok: false, error: "T.C. son 4 hane yalnızca 4 rakam olmalıdır." };
  }

  const tcFullErr = validateTcFullIfPresent(input);
  if (tcFullErr) return { ok: false, error: tcFullErr };

  const serialErr = validateIdentitySerialIfPresent(input);
  if (serialErr) return { ok: false, error: serialErr };

  const { student_code: code, error: codeErr } = await pickStudentCode(supabase, input);
  if (codeErr) return { ok: false, error: codeErr };

  const { profile_id, error: profErr } = await resolveProfileId(supabase, input);
  if (profErr) return { ok: false, error: profErr };

  const row = { ...sanitizeRowPayload(code, profile_id, input) } as Record<string, unknown>;
  try {
    mergeSensitiveStudentFields(row, input);
  } catch (e) {
    if (e instanceof Error && e.message.includes("IDENTITY_HASH_PEPPER")) {
      return {
        ok: false,
        error:
          "Kimlik doğrulama için sunucu yapılandırması eksik (IDENTITY_HASH_PEPPER).",
      };
    }
    throw e;
  }

  const { data, error } = await supabase.from("students").insert(row).select("id").single();
  if (error) return { ok: false, error: mapDbError(error.message) };

  revalidateStudentPaths();
  return { ok: true, id: data?.id };
}

export async function updateStudent(
  id: string,
  input: StudentInput
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const supabase = await createClient();
  if (!supabase) return serviceError();

  if (!input.full_name.trim()) {
    return { ok: false, error: "Ad soyad zorunludur." };
  }

  const tc = input.tc_last4.trim();
  if (tc && !/^\d{4}$/.test(tc)) {
    return { ok: false, error: "T.C. son 4 hane yalnızca 4 rakam olmalıdır." };
  }

  const tcFullErr = validateTcFullIfPresent(input);
  if (tcFullErr) return { ok: false, error: tcFullErr };

  const serialErr = validateIdentitySerialIfPresent(input);
  if (serialErr) return { ok: false, error: serialErr };

  const { profile_id, error: profErr } = await resolveProfileId(supabase, input);
  if (profErr) return { ok: false, error: profErr };

  const finalCode = input.student_code.trim();
  if (!finalCode) {
    return { ok: false, error: "Öğrenci kodunu girin." };
  }

  const row = { ...sanitizeRowPayload(finalCode, profile_id, input) } as Record<string, unknown>;
  try {
    mergeSensitiveStudentFields(row, input);
  } catch (e) {
    if (e instanceof Error && e.message.includes("IDENTITY_HASH_PEPPER")) {
      return {
        ok: false,
        error:
          "Kimlik doğrulama için sunucu yapılandırması eksik (IDENTITY_HASH_PEPPER).",
      };
    }
    throw e;
  }

  const { error } = await supabase.from("students").update(row).eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };

  revalidateStudentPaths();
  return { ok: true };
}

export async function deleteStudent(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const supabase = await createClient();
  if (!supabase) return serviceError();

  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return { ok: false, error: mapDbError(error.message) };

  revalidateStudentPaths();
  return { ok: true };
}
