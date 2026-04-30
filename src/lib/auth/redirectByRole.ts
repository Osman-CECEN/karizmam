import type { UserRole } from "@/types/database";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  office: "/office/dashboard",
  instructor: "/instructor/dashboard",
  student: "/student/dashboard",
  member: "/member/dashboard",
};

export function redirectPathForRole(role: UserRole): string {
  return ROLE_HOME[role];
}

/** Central alias: panel home path for a role. */
export const redirectByRole = redirectPathForRole;
