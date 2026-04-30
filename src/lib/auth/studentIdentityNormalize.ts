/** Turkish ID card serial: one letter, two digits, one letter, five digits. */
export const IDENTITY_SERIAL_REGEX = /^[A-Z][0-9]{2}[A-Z][0-9]{5}$/;

export function normalizeNationalIdDigits(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 11) return null;
  return d;
}

export function normalizePhoneLast4(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 4) return null;
  return d;
}

export function normalizeIdentitySerial(raw: string): string | null {
  const u = raw.trim().replace(/\s+/g, "").toUpperCase();
  if (!IDENTITY_SERIAL_REGEX.test(u)) return null;
  return u;
}
