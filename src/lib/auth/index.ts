export { hashSensitiveValue } from "@/lib/auth/sensitiveHash";
export {
  verifyStudentIdentity,
  linkStudentToProfile,
  activateStudentAccount,
  resetStudentPassword,
} from "@/lib/auth/studentAccount";
export type {
  VerifyStudentIdentityInput,
  VerifyStudentIdentityResult,
  ActivateStudentAccountInput,
  ResetStudentPasswordInput,
  AuthRequestMeta,
} from "@/lib/auth/studentAccount";
export { buildIdentityRateBucket } from "@/lib/auth/studentAuthAttempts";
export type { IdentityRateBucket } from "@/lib/auth/studentAuthAttempts";
export { redirectPathForRole, redirectByRole } from "@/lib/auth/redirectByRole";
export { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
export type { CurrentProfile } from "@/lib/auth/getCurrentProfile";
export { requireRole, requireSession } from "@/lib/auth/requireRole";
