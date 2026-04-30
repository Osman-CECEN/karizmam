import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Şifremi unuttum",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#0B2A4A] to-[#041018] px-4 py-12">
      <Suspense
        fallback={
          <div className="h-40 w-full max-w-md animate-pulse rounded-2xl bg-white/10" />
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
