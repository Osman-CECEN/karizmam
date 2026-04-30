import type { Metadata } from "next";
import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni şifre",
  robots: { index: false, follow: false },
};

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#0B2A4A] to-[#041018] px-4 py-12">
      <Suspense
        fallback={
          <div className="h-40 w-full max-w-md animate-pulse rounded-2xl bg-white/10" />
        }
      >
        <SetPasswordForm />
      </Suspense>
    </div>
  );
}
