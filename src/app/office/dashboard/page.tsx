import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ofis paneli",
  robots: { index: false, follow: false },
};

export default async function OfficeDashboardPage() {
  await requireRole(["office", "admin"]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <h1 className="text-2xl font-bold text-[#111111]">Ofis paneli</h1>
      <p className="mt-2 text-neutral-600">
        Öğrenci kayıt, evrak ve süreç takibi burada yönetilecek.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
        Operasyon modülleri hazır olduğunda bu ekrandan devam edebileceksiniz.
      </div>
    </div>
  );
}
