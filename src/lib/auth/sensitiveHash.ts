import { createHmac, timingSafeEqual } from "node:crypto";

function getPepper(): string {
  const p = process.env.IDENTITY_HASH_PEPPER?.trim();
  if (p && p.length >= 16) return p;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "IDENTITY_HASH_PEPPER must be set (min 16 chars) in production."
    );
  }
  return "dev-only-insecure-pepper-do-not-use-in-prod";
}

/**
 * Server-only HMAC for national ID / ID card serial. Never log `value`.
 */
export function hashSensitiveValue(value: string): string {
  const normalized = value.trim().replace(/\s+/g, "");
  return createHmac("sha512", getPepper()).update(normalized).digest("hex");
}

/** HMAC for client IP (never store raw IP). */
export function hashAuditIp(ip: string): string {
  const first = ip.split(",")[0]?.trim() ?? "";
  return hashSensitiveValue(`ip:${first}`);
}

export function verifySensitiveHash(value: string, storedHash: string | null): boolean {
  if (!storedHash) return false;
  try {
    const a = Buffer.from(hashSensitiveValue(value), "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
