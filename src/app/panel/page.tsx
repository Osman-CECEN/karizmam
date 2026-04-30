import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { redirectByRole } from "@/lib/auth/redirectByRole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PanelPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=%2Fpanel");
  }
  if (!profile.is_active) {
    redirect("/login?reason=inactive");
  }
  redirect(redirectByRole(profile.role));
}
