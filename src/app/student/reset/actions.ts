"use server";

import { headers } from "next/headers";
import { STUDENT_IDENTITY_PUBLIC_ERROR } from "@/lib/auth/constants";
import { resetStudentPassword } from "@/lib/auth/studentAccount";
import { clientIpFromHeaders } from "@/lib/auth/studentAuthAttempts";

export type StudentResetFormState =
  | { ok: true }
  | { ok: false; error: string };

export async function submitStudentPasswordReset(
  formData: FormData
): Promise<StudentResetFormState> {
  const tcNationalId = String(formData.get("tc") ?? "");
  const phoneLast4 = String(formData.get("phone_last4") ?? "");
  const identityCardSerial = String(formData.get("identity_serial") ?? "");
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password_confirm") ?? "");

  if (password !== password2) {
    return { ok: false, error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const h = await headers();
  const clientIp = clientIpFromHeaders(h);

  const result = await resetStudentPassword(
    {
      tcNationalId,
      phoneLast4,
      identityCardSerial,
      password,
    },
    { clientIp }
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}
