"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { LOGIN_CREDENTIALS_PUBLIC_ERROR } from "@/lib/auth/constants";
import { hashAuditIp } from "@/lib/auth/sensitiveHash";
import {
  assertLoginRateAllowed,
  clientIpFromHeaders,
  hashLoginIdentifier,
  recordLoginAttempt,
} from "@/lib/auth/studentAuthAttempts";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

const MIN_AUTH_WALL_MS = 220;

async function wallClock(started: number): Promise<void> {
  const elapsed = Date.now() - started;
  const wait = MIN_AUTH_WALL_MS - elapsed;
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
}

export type SignInResult = { ok: true } | { ok: false; error: string };

export async function signInWithIdentifierAction(
  identifier: string,
  password: string
): Promise<SignInResult> {
  const started = Date.now();
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const ipHash = hashAuditIp(ip);

  const raw = identifier.trim();
  if (!raw || !password) {
    await wallClock(started);
    return {
      ok: false,
      error: LOGIN_CREDENTIALS_PUBLIC_ERROR,
    };
  }

  const loginKeyHash = hashLoginIdentifier(raw);
  const rate = await assertLoginRateAllowed(loginKeyHash, ipHash);
  if (!rate.ok) {
    await recordLoginAttempt({
      loginKeyHash,
      ipHash,
      success: false,
      failureReason: "rate_limited",
    });
    await wallClock(started);
    return { ok: false, error: LOGIN_CREDENTIALS_PUBLIC_ERROR };
  }

  const supabase = await createClient();
  if (!supabase) {
    await recordLoginAttempt({
      loginKeyHash,
      ipHash,
      success: false,
      failureReason: "no_client",
    });
    await wallClock(started);
    return { ok: false, error: LOGIN_CREDENTIALS_PUBLIC_ERROR };
  }

  let email = raw;
  if (!raw.includes("@")) {
    const admin = createServiceRoleClient();
    if (!admin) {
      await recordLoginAttempt({
        loginKeyHash,
        ipHash,
        success: false,
        failureReason: "no_service",
      });
      await wallClock(started);
      return { ok: false, error: LOGIN_CREDENTIALS_PUBLIC_ERROR };
    }
    const uname = raw.toLowerCase();
    const { data: prof, error: pErr } = await admin
      .from("profiles")
      .select("id")
      .eq("username", uname)
      .maybeSingle();
    if (pErr || !prof?.id) {
      const junk = `${randomUUID()}@students.invalid`;
      await supabase.auth.signInWithPassword({
        email: junk,
        password: `${password}_reject_${randomUUID()}`,
      });
      await recordLoginAttempt({
        loginKeyHash,
        ipHash,
        success: false,
        failureReason: "user_not_found",
      });
      await wallClock(started);
      return { ok: false, error: LOGIN_CREDENTIALS_PUBLIC_ERROR };
    }
    const { data: authData, error: aErr } = await admin.auth.admin.getUserById(
      prof.id
    );
    if (aErr || !authData.user?.email) {
      const junk = `${randomUUID()}@students.invalid`;
      await supabase.auth.signInWithPassword({
        email: junk,
        password: `${password}_reject_${randomUUID()}`,
      });
      await recordLoginAttempt({
        loginKeyHash,
        ipHash,
        success: false,
        failureReason: "user_no_email",
      });
      await wallClock(started);
      return { ok: false, error: LOGIN_CREDENTIALS_PUBLIC_ERROR };
    }
    email = authData.user.email;
  }

  const { error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signErr) {
    await recordLoginAttempt({
      loginKeyHash,
      ipHash,
      success: false,
      failureReason: "sign_in_failed",
    });
    await wallClock(started);
    return { ok: false, error: LOGIN_CREDENTIALS_PUBLIC_ERROR };
  }

  await recordLoginAttempt({
    loginKeyHash,
    ipHash,
    success: true,
    failureReason: null,
  });

  await wallClock(started);
  return { ok: true };
}
