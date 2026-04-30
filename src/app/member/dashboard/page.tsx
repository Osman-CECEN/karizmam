import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Üye paneli",
  robots: { index: false, follow: false },
};

export default async function MemberDashboardPage() {
  await requireRole(["member", "admin"]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <h1 className="text-2xl font-bold text-[#111111]">Üye paneli</h1>
      <p className="mt-2 text-neutral-600">
        Hoş geldiniz. Bu alan size özel içerikler için hazırlanıyor.
      </p>
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#111111]">Test çözme</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Test çözme sistemi yakında aktif olacaktır. Açıldığında sonuçlarınızı
          burada görebileceksiniz.
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          Henüz bir test sonucu bulunmuyor.
        </div>
      </div>
    </div>
  );
}
