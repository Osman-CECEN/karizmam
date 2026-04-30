"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { STUDENT_IDENTITY_PUBLIC_ERROR } from "@/lib/auth/constants";
import { activateStudentAccount } from "@/lib/auth/studentAccount";
import { clientIpFromHeaders } from "@/lib/auth/studentAuthAttempts";

export type StudentActivateFormState = { error: string | null };

export async function submitStudentActivation(
  _prev: StudentActivateFormState,
  formData: FormData
): Promise<StudentActivateFormState> {
  const tcNationalId = String(formData.get("tc") ?? "");
  const phoneLast4 = String(formData.get("phone_last4") ?? "");
  const identityCardSerial = String(formData.get("identity_serial") ?? "");
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password_confirm") ?? "");

  if (password !== password2) {
    return { error: STUDENT_IDENTITY_PUBLIC_ERROR };
  }

  const h = await headers();
  const clientIp = clientIpFromHeaders(h);

  const result = await activateStudentAccount(
    {
      tcNationalId,
      phoneLast4,
      identityCardSerial,
      username,
      password,
    },
    { clientIp }
  );

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/student/dashboard");
}
