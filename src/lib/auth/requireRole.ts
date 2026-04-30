import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import type { UserRole } from "@/types/database";

/** Admin may access any dashboard route. */
function isAllowed(
  profileRole: UserRole,
  allowed: readonly UserRole[]
): boolean {
  if (profileRole === "admin") return true;
  return allowed.includes(profileRole);
}

/**
 * Server-only guard. Redirects to /login if unauthenticated or inactive.
 * Redirects to role home if role not allowed.
 */
export async function requireRole(
  allowed: readonly UserRole[]
): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=" + encodeURIComponent("/panel"));
  }
  if (!profile.is_active) {
    redirect("/login?reason=inactive");
  }
  if (!isAllowed(profile.role, allowed)) {
    redirect("/panel");
  }
  return profile;
}

export async function requireSession(): Promise<
  NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=" + encodeURIComponent("/panel"));
  }
  if (!profile.is_active) {
    redirect("/login?reason=inactive");
  }
  return profile;
}
