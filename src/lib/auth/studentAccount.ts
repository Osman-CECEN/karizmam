import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { revokeAllSessionsForUser } from "@/lib/supabase/adminRevokeSessions";
import { STUDENT_IDENTITY_PUBLIC_ERROR } from "@/lib/auth/constants";
import {
  assertStudentIdentityRateAllowed,
  buildIdentityRateBucket,
  recordActivateOrResetAttempt,
} from "@/lib/auth/studentAuthAttempts";
import {
  normalizeIdentitySerial,
  normalizeNationalIdDigits,
  normalizePhoneLast4,
} from "@/lib/auth/studentIdentityNormalize";
import { verifySensitiveHash } from "@/lib/auth/sensitiveHash";

export type VerifyStudentIdentityInput = {
  tcNationalId: string;
  phoneLast4: string;
  identityCardSerial: string;
};

export type VerifyStudentIdentityResult =
  | { ok: true; studentId: string }
  | { ok: false };

/**
 * Central identity check (activate / reset / future QR). Never logs raw inputs.
 */
export async function verifyStudentIdentity(
  input: VerifyStudentIdentityInput
): Promise<VerifyStudentIdentityResult> {
  const tc = normalizeNationalIdDigits(input.tcNationalId);
  const pl4 = normalizePhoneLast4(input.phoneLast4);
  const serial = normalizeIdentitySerial(input.identityCardSerial);
  if (!tc || !pl4 || !serial) {
    return { ok: false };
  }

  const svc = createServiceRoleClient();
  if (!svc) {
    return { ok: false };
  }

  const tcLast4 = tc.slice(-4);

  const { data: candidates, error } = await svc
    .from("students")
    .select("id, tc_hash, identity_card_no_hash, tc_last4, phone_last4")
    .eq("tc_last4", tcLast4)
    .eq("phone_last4", pl4)
    .limit(25);

  if (error || !candidates?.length) {
    return { ok: false };
  }

  const matches: string[] = [];
  for (const row of candidates) {
    if (!row.tc_hash || !row.identity_card_no_hash) continue;
    if (!verifySensitiveHash(tc, row.tc_hash as string)) continue;
    if (!verifySensitiveHash(serial, row.identity_card_no_hash as string)) {
      continue;
    }
    matches.push(row.id as string);
  }

  if (matches.length === 1) {
    return { ok: true, studentId: matches[0] };
  }
  return { ok: false };
}

export async function linkStudentToProfile(
  studentId: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const svc = createServiceRoleClient();
  if (!svc) return { ok: false, error: "Sunucu yapılandırması eksik." };
  const { error } = await svc
    .from("students")
    .update({ profile_id: userId })
    .eq("id", studentId);
  if (error) return { ok: false, error: "Profil bağlantısı kurulamadı." };
  return { ok: true };
}

function normalizeLoginUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateUsername(u: string): string | null {
  if (!/^[a-z0-9_]{3,24}$/.test(u)) {
    return "username_invalid";
  }
  const reserved = new Set([
    "admin",
    "office",
    "support",
    "root",
    "karizmam",
    "system",
    "student",
    "member",
  ]);
  if (reserved.has(u)) return "username_reserved";
  return null;
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "password_short";
  return null;
}

function internalAuthEmailForStudent(studentId: string): string {
  return `st-${studentId.replace(/-/g, "")}@students.internal`;
}

export type AuthRequestMeta = { clientIp: string };

export type ActivateStudentAccountInput = VerifyStudentIdentityInput & {
  username: string;
  password: string;
};

export async function activateStudentAccount(
  input: ActivateStudentAccountInput,
  meta: AuthRequestMeta
): Promise<{ ok: true } | { ok: false; error: string }> {
  const bucket = buildIdentityRateBucket(
    input.tcNationalId,
    input.phoneLast4,
    input.identityCardSerial,
    meta.clientIp
  );

  const rate = await assertStudentIdentityRateAllowed("activate", bucket);
  if (!rate.ok) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "rate_limited",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const verified = await verifyStudentIdentity(input);
  if (!verified.ok) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "verify_failed",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const uname = normalizeLoginUsername(input.username);
  const uerr = validateUsername(uname);
  if (uerr) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: uerr,
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const perr = validatePassword(input.password);
  if (perr) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: perr,
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const svc = createServiceRoleClient();
  if (!svc) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "no_service",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const { data: student, error: sErr } = await svc
    .from("students")
    .select("id, full_name, phone, email, initial_login_used, profile_id")
    .eq("id", verified.studentId)
    .maybeSingle();

  if (sErr || !student) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "student_load",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  if (student.initial_login_used || student.profile_id) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "already_active",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const { data: taken } = await svc
    .from("profiles")
    .select("id")
    .eq("username", uname)
    .maybeSingle();
  if (taken?.id) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "username_taken",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const email = internalAuthEmailForStudent(student.id as string);

  const { data: created, error: cErr } = await svc.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: student.full_name },
  });

  if (cErr || !created.user) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "create_user",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const userId = created.user.id;

  const { error: pErr } = await svc
    .from("profiles")
    .update({
      full_name: student.full_name as string,
      phone: (student.phone as string | null) ?? null,
      role: "student",
      username: uname,
    })
    .eq("id", userId);

  if (pErr) {
    await svc.auth.admin.deleteUser(userId);
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "profile_update",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const now = new Date().toISOString();
  const { error: stErr } = await svc
    .from("students")
    .update({
      profile_id: userId,
      username: uname,
      initial_login_used: true,
      must_change_password: false,
      activated_at: now,
    })
    .eq("id", student.id);

  if (stErr) {
    await svc.auth.admin.deleteUser(userId);
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "student_update",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const browser = await createClient();
  if (!browser) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "no_browser_client",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const { error: signErr } = await browser.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (signErr) {
    await recordActivateOrResetAttempt("activate", bucket, {
      success: false,
      failureReason: "sign_in",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  await recordActivateOrResetAttempt("activate", bucket, {
    success: true,
    failureReason: null,
  });

  return { ok: true };
}

export type ResetStudentPasswordInput = VerifyStudentIdentityInput & {
  password: string;
};

export async function resetStudentPassword(
  input: ResetStudentPasswordInput,
  meta: AuthRequestMeta
): Promise<{ ok: true } | { ok: false; error: string }> {
  const bucket = buildIdentityRateBucket(
    input.tcNationalId,
    input.phoneLast4,
    input.identityCardSerial,
    meta.clientIp
  );

  const rate = await assertStudentIdentityRateAllowed("reset", bucket);
  if (!rate.ok) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: "rate_limited",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const verified = await verifyStudentIdentity(input);
  if (!verified.ok) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: "verify_failed",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const perr = validatePassword(input.password);
  if (perr) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: perr,
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const svc = createServiceRoleClient();
  if (!svc) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: "no_service",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const { data: student, error: sErr } = await svc
    .from("students")
    .select("id, profile_id, initial_login_used")
    .eq("id", verified.studentId)
    .maybeSingle();

  if (sErr || !student?.profile_id || !student.initial_login_used) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: "student_state",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const uid = student.profile_id as string;

  const { error: uErr } = await svc.auth.admin.updateUserById(uid, {
    password: input.password,
  });

  if (uErr) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: "password_update",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const now = new Date().toISOString();
  const { error: stErr } = await svc
    .from("students")
    .update({
      must_change_password: true,
      password_reset_at: now,
    })
    .eq("id", student.id);

  if (stErr) {
    await recordActivateOrResetAttempt("reset", bucket, {
      success: false,
      failureReason: "student_flags",
    });
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  await revokeAllSessionsForUser(uid);

  await recordActivateOrResetAttempt("reset", bucket, {
    success: true,
    failureReason: null,
  });

  return { ok: true };
}
