/**
 * Best-effort global sign-out for a user via GoTrue admin (service role only).
 * Endpoint availability varies by hosted Supabase version; failures are ignored.
 */
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return;

  const endpoints = [
    `${base}/auth/v1/admin/users/${userId}/logout`,
    `${base}/auth/v1/admin/users/${userId}/signout`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "global" }),
      });
      if (res.ok || res.status === 204) return;
    } catch {
      /* ignore */
    }
  }
}
