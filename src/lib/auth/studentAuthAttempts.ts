import type { SupabaseClient } from "@supabase/supabase-js";
import { hashAuditIp, hashSensitiveValue } from "@/lib/auth/sensitiveHash";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import {
  normalizeIdentitySerial,
  normalizeNationalIdDigits,
  normalizePhoneLast4,
} from "@/lib/auth/studentIdentityNormalize";

export type StudentAuthActionType = "activate" | "reset" | "login";

const MS_HOUR = 60 * 60 * 1000;
const MS_30M = 30 * 60 * 1000;

const STRONG_FAIL_MAX = 5;
const STRONG_WINDOW_MS = MS_HOUR;
const STRONG_LOCK_MS = MS_HOUR;

const WEAK_SCORE_MAX = 10;
const WEAK_WINDOW_MS = MS_HOUR;
const WEAK_LOCK_MS = 45 * 60 * 1000;

const IP_FAIL_MAX = 30;
const IP_FAIL_WINDOW_MS = MS_HOUR;
const IP_LOCK_MS = MS_HOUR;

const LOGIN_USER_FAIL_MAX = 10;
const LOGIN_USER_WINDOW_MS = MS_30M;
const LOGIN_USER_LOCK_MS = MS_30M;

const LOGIN_IP_FAIL_MAX = 20;
const LOGIN_IP_WINDOW_MS = MS_HOUR;
const LOGIN_IP_LOCK_MS = MS_HOUR;

const SCORE_TC_ONLY = 4;
const SCORE_PHONE_ONLY = 2;
const SCORE_SERIAL_ONLY = 2;

type AttemptIdentityRow = {
  id: string;
  tc_hash: string | null;
  ip_hash: string | null;
  phone_last4_hash: string | null;
  identity_serial_hash: string | null;
  locked_until?: string | null;
};

/** Rate-limit bucket for activate / reset (hashed dimensions). */
export type IdentityRateBucket = {
  tcHash: string | null;
  ipHash: string;
  phoneLast4Hash: string | null;
  identitySerialHash: string | null;
};

export function buildIdentityRateBucket(
  tcNationalId: string,
  phoneLast4Raw: string,
  identityCardSerial: string,
  clientIp: string
): IdentityRateBucket {
  const ipHash = hashAuditIp(clientIp);
  const tcDigits = normalizeNationalIdDigits(tcNationalId);
  const tcHash = tcDigits ? hashSensitiveValue(tcDigits) : null;
  const p4 = normalizePhoneLast4(phoneLast4Raw);
  const phoneLast4Hash = p4 ? hashSensitiveValue(p4) : null;
  const serial = normalizeIdentitySerial(identityCardSerial);
  const identitySerialHash = serial ? hashSensitiveValue(serial) : null;
  return { tcHash, ipHash, phoneLast4Hash, identitySerialHash };
}

export function clientIpFromHeaders(h: Headers): string {
  const xf = h.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function isoSince(msAgo: number): string {
  return new Date(Date.now() - msAgo).toISOString();
}

function strongIdentityMatch(
  row: AttemptIdentityRow,
  b: IdentityRateBucket
): boolean {
  if (!b.tcHash || !b.phoneLast4Hash || !b.identitySerialHash) return false;
  return (
    row.tc_hash === b.tcHash &&
    row.phone_last4_hash === b.phoneLast4Hash &&
    row.identity_serial_hash === b.identitySerialHash
  );
}

function weakIdentityScore(row: AttemptIdentityRow, b: IdentityRateBucket): number {
  // Strong bucket (tc+phone+serial exact) is governed by STRONG_* thresholds.
  // Do not let weak scoring lock this bucket before the 5-fail threshold.
  if (strongIdentityMatch(row, b)) return 0;

  let score = 0;
  if (b.tcHash && row.tc_hash === b.tcHash) score += SCORE_TC_ONLY;
  if (b.phoneLast4Hash && row.phone_last4_hash === b.phoneLast4Hash) {
    score += SCORE_PHONE_ONLY;
  }
  if (
    b.identitySerialHash &&
    row.identity_serial_hash === b.identitySerialHash
  ) {
    score += SCORE_SERIAL_ONLY;
  }
  return score;
}

async function listRecentIdentityRows(
  svc: SupabaseClient,
  action: "activate" | "reset",
  bucket: IdentityRateBucket,
  sinceIso: string,
  includeLocks: boolean
): Promise<AttemptIdentityRow[]> {
  const parts = [`ip_hash.eq.${bucket.ipHash}`];
  if (bucket.tcHash) parts.push(`tc_hash.eq.${bucket.tcHash}`);
  if (bucket.phoneLast4Hash) {
    parts.push(`phone_last4_hash.eq.${bucket.phoneLast4Hash}`);
  }
  if (bucket.identitySerialHash) {
    parts.push(`identity_serial_hash.eq.${bucket.identitySerialHash}`);
  }

  let q = svc
    .from("student_auth_attempts")
    .select("id, tc_hash, ip_hash, phone_last4_hash, identity_serial_hash, locked_until")
    .eq("action_type", action)
    .gte("created_at", sinceIso)
    .or(parts.join(","));

  if (!includeLocks) {
    q = q.eq("success", false);
  }

  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}

/** Weighted hybrid lock: strong identity or IP; weak matches need aggregate score. */
async function hasActiveIdentityLock(
  svc: SupabaseClient,
  action: "activate" | "reset",
  bucket: IdentityRateBucket,
  nowIso: string
): Promise<boolean> {
  const rows = await listRecentIdentityRows(
    svc,
    action,
    bucket,
    isoSince(STRONG_WINDOW_MS),
    true
  );
  const active = rows.filter((r) => r.locked_until && r.locked_until > nowIso);
  if (active.length === 0) return false;

  if (active.some((r) => r.ip_hash === bucket.ipHash)) return true;
  if (active.some((r) => strongIdentityMatch(r, bucket))) return true;

  let weakScore = 0;
  for (const r of active) {
    weakScore += weakIdentityScore(r, bucket);
    if (weakScore >= WEAK_SCORE_MAX) return true;
  }
  return false;
}

/** Login lock path remains straightforward (username/ip). */
async function hasActiveLoginLock(
  svc: SupabaseClient,
  loginKeyHash: string,
  ipHash: string,
  nowIso: string
): Promise<boolean> {
  const { data, error } = await svc
    .from("student_auth_attempts")
    .select("id")
    .eq("action_type", "login")
    .not("locked_until", "is", null)
    .gt("locked_until", nowIso)
    .or(`username_hash.eq.${loginKeyHash},ip_hash.eq.${ipHash}`)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

async function listRecentLoginFailures(
  svc: SupabaseClient,
  loginKeyHash: string,
  ipHash: string,
  sinceIso: string
): Promise<{ id: string; username_hash: string | null; ip_hash: string | null }[]> {
  const { data, error } = await svc
    .from("student_auth_attempts")
    .select("id, username_hash, ip_hash")
    .eq("action_type", "login")
    .eq("success", false)
    .gte("created_at", sinceIso)
    .or(`username_hash.eq.${loginKeyHash},ip_hash.eq.${ipHash}`);
  if (error || !data) return [];
  return data;
}

export async function assertStudentIdentityRateAllowed(
  action: "activate" | "reset",
  bucket: IdentityRateBucket
): Promise<{ ok: true } | { ok: false }> {
  const svc = createServiceRoleClient();
  if (!svc) return { ok: false };

  const nowIso = new Date().toISOString();
  if (await hasActiveIdentityLock(svc, action, bucket, nowIso)) {
    return { ok: false };
  }

  const sinceIso = isoSince(Math.max(STRONG_WINDOW_MS, IP_FAIL_WINDOW_MS, WEAK_WINDOW_MS));
  const rows = await listRecentIdentityRows(svc, action, bucket, sinceIso, false);

  const ipHits = rows.filter((r) => r.ip_hash === bucket.ipHash).length;
  const strongHits = rows.filter((r) => strongIdentityMatch(r, bucket)).length;
  let weakScore = 0;
  for (const r of rows) weakScore += weakIdentityScore(r, bucket);

  if (ipHits >= IP_FAIL_MAX) return { ok: false };
  if (strongHits >= STRONG_FAIL_MAX) return { ok: false };
  if (weakScore >= WEAK_SCORE_MAX) return { ok: false };

  return { ok: true };
}

export async function assertLoginRateAllowed(
  loginKeyHash: string,
  ipHash: string
): Promise<{ ok: true } | { ok: false }> {
  const svc = createServiceRoleClient();
  if (!svc) return { ok: false };
  const nowIso = new Date().toISOString();
  if (await hasActiveLoginLock(svc, loginKeyHash, ipHash, nowIso)) {
    return { ok: false };
  }
  const rows = await listRecentLoginFailures(
    svc,
    loginKeyHash,
    ipHash,
    isoSince(Math.max(LOGIN_USER_WINDOW_MS, LOGIN_IP_WINDOW_MS))
  );
  const userHits = rows.filter((r) => r.username_hash === loginKeyHash).length;
  const ipHits = rows.filter((r) => r.ip_hash === ipHash).length;
  if (userHits >= LOGIN_USER_FAIL_MAX || ipHits >= LOGIN_IP_FAIL_MAX) {
    return { ok: false };
  }
  return { ok: true };
}

function isRateLimitDbError(err: { message?: string } | null): boolean {
  if (!err) return false;
  return (err.message ?? "").includes("student_auth_rate_limited");
}

async function applyPostInsertIdentityLock(
  svc: SupabaseClient,
  action: "activate" | "reset",
  insertId: string,
  bucket: IdentityRateBucket
): Promise<void> {
  const rows = await listRecentIdentityRows(
    svc,
    action,
    bucket,
    isoSince(Math.max(STRONG_WINDOW_MS, IP_FAIL_WINDOW_MS, WEAK_WINDOW_MS)),
    false
  );
  const ipHits = rows.filter((r) => r.ip_hash === bucket.ipHash).length;
  const strongHits = rows.filter((r) => strongIdentityMatch(r, bucket)).length;
  let weakScore = 0;
  for (const r of rows) weakScore += weakIdentityScore(r, bucket);

  let lockMs = 0;
  if (strongHits >= STRONG_FAIL_MAX) lockMs = Math.max(lockMs, STRONG_LOCK_MS);
  if (ipHits >= IP_FAIL_MAX) lockMs = Math.max(lockMs, IP_LOCK_MS);
  if (weakScore >= WEAK_SCORE_MAX) lockMs = Math.max(lockMs, WEAK_LOCK_MS);
  if (lockMs <= 0) return;

  await svc
    .from("student_auth_attempts")
    .update({ locked_until: new Date(Date.now() + lockMs).toISOString() })
    .eq("id", insertId);
}

async function applyPostInsertLoginLock(
  svc: SupabaseClient,
  insertId: string,
  loginKeyHash: string,
  ipHash: string
): Promise<void> {
  const rows = await listRecentLoginFailures(
    svc,
    loginKeyHash,
    ipHash,
    isoSince(Math.max(LOGIN_USER_WINDOW_MS, LOGIN_IP_WINDOW_MS))
  );
  const userHits = rows.filter((r) => r.username_hash === loginKeyHash).length;
  const ipHits = rows.filter((r) => r.ip_hash === ipHash).length;
  let lockMs = 0;
  if (userHits >= LOGIN_USER_FAIL_MAX) lockMs = Math.max(lockMs, LOGIN_USER_LOCK_MS);
  if (ipHits >= LOGIN_IP_FAIL_MAX) lockMs = Math.max(lockMs, LOGIN_IP_LOCK_MS);
  if (lockMs <= 0) return;

  await svc
    .from("student_auth_attempts")
    .update({ locked_until: new Date(Date.now() + lockMs).toISOString() })
    .eq("id", insertId);
}

export async function recordActivateOrResetAttempt(
  action: "activate" | "reset",
  bucket: IdentityRateBucket,
  opts: {
    success: boolean;
    failureReason: string | null;
  }
): Promise<void> {
  const svc = createServiceRoleClient();
  if (!svc) return;
  const { data, error } = await svc
    .from("student_auth_attempts")
    .insert({
      action_type: action,
      tc_hash: bucket.tcHash,
      username_hash: null,
      ip_hash: bucket.ipHash,
      phone_last4_hash: bucket.phoneLast4Hash,
      identity_serial_hash: bucket.identitySerialHash,
      success: opts.success,
      failure_reason: opts.failureReason,
      locked_until: null,
    })
    .select("id")
    .limit(1);

  if (error) {
    if (isRateLimitDbError(error)) return;
    return;
  }
  const insertId = data?.[0]?.id;
  if (!opts.success && insertId) {
    await applyPostInsertIdentityLock(svc, action, insertId, bucket);
  }
}

export async function recordLoginAttempt(opts: {
  loginKeyHash: string;
  ipHash: string;
  success: boolean;
  failureReason: string | null;
}): Promise<void> {
  const svc = createServiceRoleClient();
  if (!svc) return;
  const { data, error } = await svc
    .from("student_auth_attempts")
    .insert({
      action_type: "login",
      tc_hash: null,
      username_hash: opts.loginKeyHash,
      ip_hash: opts.ipHash,
      phone_last4_hash: null,
      identity_serial_hash: null,
      success: opts.success,
      failure_reason: opts.failureReason,
      locked_until: null,
    })
    .select("id")
    .limit(1);

  if (error) {
    if (isRateLimitDbError(error)) return;
    return;
  }
  const insertId = data?.[0]?.id;
  if (!opts.success && insertId) {
    await applyPostInsertLoginLock(svc, insertId, opts.loginKeyHash, opts.ipHash);
  }
}

export function hashLoginIdentifier(raw: string): string {
  const t = raw.trim().toLowerCase();
  return hashSensitiveValue(`login:${t}`);
}
