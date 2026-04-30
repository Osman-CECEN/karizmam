/**
 * Security sign-off: synthetic rate-limit + RPC role matrix + RLS smoke checks.
 * Loads secrets from .env.local only into process.env (never printed).
 * Creates temporary auth users for RPC matrix; deletes them at end.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  assertLoginRateAllowed,
  assertStudentIdentityRateAllowed,
  buildIdentityRateBucket,
  hashLoginIdentifier,
  recordActivateOrResetAttempt,
  recordLoginAttempt,
} from "../src/lib/auth/studentAuthAttempts";
import { createServiceRoleClient } from "../src/lib/supabase/serviceRole";

type Row = { name: string; pass: boolean; detail?: string };

const rows: Row[] = [];

function loadDotEnvLocal(): void {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) {
    throw new Error("Missing .env.local (NEXT_PUBLIC_SUPABASE_URL, keys, pepper).");
  }
  const txt = fs.readFileSync(p, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (k && v && process.env[k] === undefined) process.env[k] = v;
  }
}

function push(name: string, pass: boolean, detail?: string): void {
  rows.push({ name, pass, detail });
}

/** TEST-NET + unique octet — avoids collision with production traffic. */
function testIp(ns: string): string {
  const h = Math.abs(
    [...ns].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
  );
  return `198.51.100.${(h % 200) + 20}`;
}

function syntheticBucket(ns: string) {
  const stamp = Date.now().toString();
  const tc = ("6" + stamp + "0000000000").slice(0, 11);
  const phone = stamp.slice(-4).padStart(4, "0");
  const serial = "A12B" + stamp.slice(-5).padStart(5, "0");
  const ip = testIp(ns + stamp);
  return buildIdentityRateBucket(tc, phone, serial, ip);
}

async function testActivateReset56(
  svc: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  action: "activate" | "reset",
  bucket: ReturnType<typeof buildIdentityRateBucket>,
  prefix: string
): Promise<void> {
  let first4 = true;
  for (let i = 0; i < 4; i++) {
    const a = await assertStudentIdentityRateAllowed(action, bucket);
    if (!a.ok) first4 = false;
    await recordActivateOrResetAttempt(action, bucket, {
      success: false,
      failureReason: "verify_failed",
    });
  }
  push(`${prefix}.first4_allowed`, first4);

  const a5 = await assertStudentIdentityRateAllowed(action, bucket);
  push(`${prefix}.5th_assert_before_record`, a5.ok === true, `assert_ok=${a5.ok}`);
  await recordActivateOrResetAttempt(action, bucket, {
    success: false,
    failureReason: "verify_failed",
  });

  const a6 = await assertStudentIdentityRateAllowed(action, bucket);
  push(`${prefix}.6th_assert_rejects`, a6.ok === false, `assert_ok=${a6.ok}`);
  await recordActivateOrResetAttempt(action, bucket, {
    success: false,
    failureReason: "rate_limited",
  });

  const { data, error } = await svc
    .from("student_auth_attempts")
    .select("failure_reason,locked_until,success")
    .eq("action_type", action)
    .eq("tc_hash", bucket.tcHash!)
    .order("created_at", { ascending: false })
    .limit(12);

  const list = data ?? [];
  push(
    `${prefix}.5th_row_has_locked_until`,
    list.some((r) => r.failure_reason === "verify_failed" && r.locked_until),
    error?.message
  );
  push(
    `${prefix}.rate_limited_audit`,
    list.some((r) => r.failure_reason === "rate_limited" && r.success === false),
    error?.message
  );
}

async function testLogin1011(
  svc: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  ipHash: string,
  loginNs: string
): Promise<void> {
  const loginKeyHash = hashLoginIdentifier(`sec-signoff-${loginNs}-${Date.now()}`);
  for (let i = 0; i < 9; i++) {
    await recordLoginAttempt({
      loginKeyHash,
      ipHash,
      success: false,
      failureReason: "sign_in_failed",
    });
  }
  const a9 = await assertLoginRateAllowed(loginKeyHash, ipHash);
  push("login.9th_assert_still_ok", a9.ok === true, `assert_ok=${a9.ok}`);
  await recordLoginAttempt({
    loginKeyHash,
    ipHash,
    success: false,
    failureReason: "sign_in_failed",
  });
  const a10 = await assertLoginRateAllowed(loginKeyHash, ipHash);
  push("login.10th_assert_rejects", a10.ok === false, `assert_ok=${a10.ok}`);
  await recordLoginAttempt({
    loginKeyHash,
    ipHash,
    success: false,
    failureReason: "rate_limited",
  });
  const a11 = await assertLoginRateAllowed(loginKeyHash, ipHash);
  push("login.11th_assert_still_rejects", a11.ok === false, `assert_ok=${a11.ok}`);

  const { data, error } = await svc
    .from("student_auth_attempts")
    .select("failure_reason,locked_until,success")
    .eq("action_type", "login")
    .eq("username_hash", loginKeyHash)
    .order("created_at", { ascending: false })
    .limit(15);
  const list = data ?? [];
  push(
    "login.lock_or_audit_present",
    list.some((r) => r.locked_until) ||
      list.some((r) => r.failure_reason === "rate_limited"),
    error?.message
  );
}

async function testMonitoringRpcMatrix(
  url: string,
  anonKey: string
): Promise<void> {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svcKey) {
    push("monitoring.skip", false, "SUPABASE_SERVICE_ROLE_KEY missing");
    return;
  }
  const admin = createClient(url, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const pub = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const stamp = Date.now();
  const basePwd = `P@ssw0rd!${stamp}`;
  const specs = [
    { role: "admin" as const, suffix: "a" },
    { role: "office" as const, suffix: "o" },
    { role: "student" as const, suffix: "s" },
    { role: "member" as const, suffix: "m" },
  ];
  const createdIds: string[] = [];

  async function rpcWithToken(token: string) {
    return fetch(`${url}/rest/v1/rpc/get_student_auth_monitoring_last_hour`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit_rows: 2 }),
    });
  }

  try {
    for (const s of specs) {
      const email = `sec-so-${stamp}-${s.suffix}@example.com`;
      const password = `${basePwd}${s.suffix}`;
      const c = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: `SO ${s.role}` },
      });
      if (c.error || !c.data.user) {
        push(`monitoring.create_${s.role}`, false, c.error?.message);
        continue;
      }
      createdIds.push(c.data.user.id);
      const p = await admin
        .from("profiles")
        .update({ role: s.role, full_name: `SO ${s.role}` })
        .eq("id", c.data.user.id);
      if (p.error) {
        push(`monitoring.profile_${s.role}`, false, p.error.message);
        continue;
      }
      const login = await pub.auth.signInWithPassword({ email, password });
      if (login.error || !login.data.session?.access_token) {
        push(`monitoring.login_${s.role}`, false, login.error?.message);
        continue;
      }
      const res = await rpcWithToken(login.data.session.access_token);
      const okBody = res.status === 200;
      if (s.role === "admin" || s.role === "office") {
        push(`monitoring.rpc_${s.role}_allows`, okBody, `status=${res.status}`);
      } else {
        push(
          `monitoring.rpc_${s.role}_denies`,
          res.status >= 400,
          `status=${res.status}`
        );
      }
    }

    const anonRes = await rpcWithToken(anonKey);
    push(
      "monitoring.rpc_anon_not_success",
      anonRes.status !== 200,
      `status=${anonRes.status}`
    );
  } finally {
    for (const id of createdIds) {
      try {
        await admin.auth.admin.deleteUser(id);
      } catch {
        /* ignore */
      }
    }
  }
}

async function testRlsHashBlocked(url: string, anonKey: string): Promise<void> {
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const r = await anon.from("students").select("tc_hash").limit(1);
  push(
    "rls.anon_no_tc_hash_select",
    Boolean(r.error),
    r.error?.message ?? (r.data ? "unexpected data" : undefined)
  );
}

async function main(): Promise<void> {
  loadDotEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / ANON_KEY required");
  }

  const svc = createServiceRoleClient();
  if (!svc) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY required for sign-off tests");
  }

  const ns = `so-${Date.now()}`;
  const bucketA = syntheticBucket(`act-${ns}`);
  const bucketR = syntheticBucket(`rst-${ns}`);

  await testActivateReset56(svc, "activate", bucketA, "activate");
  await testActivateReset56(svc, "reset", bucketR, "reset");
  await testLogin1011(svc, bucketA.ipHash, ns);
  await testMonitoringRpcMatrix(url, anonKey);
  await testRlsHashBlocked(url, anonKey);

  let failed = 0;
  for (const r of rows) {
    const mark = r.pass ? "PASS" : "FAIL";
    const tail = r.detail ? ` — ${r.detail}` : "";
    console.log(`${mark}\t${r.name}${tail}`);
    if (!r.pass) failed++;
  }
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("FAIL\tfatal", e instanceof Error ? e.message : e);
  process.exit(1);
});
