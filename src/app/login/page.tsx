import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile?.is_active) {
    redirect("/panel");
  }
  if (profile && !profile.is_active) {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    redirect("/login?reason=inactive");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#0B2A4A] to-[#041018] px-4 py-12">
      <Suspense
        fallback={
          <div className="h-40 w-full max-w-md animate-pulse rounded-2xl bg-white/10" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
