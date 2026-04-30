import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Öğrenci paneli",
  robots: { index: false, follow: false },
};

export default async function StudentDashboardPage() {
  await requireRole(["student", "admin"]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <h1 className="text-2xl font-bold text-[#111111]">Öğrenci paneli</h1>
      <p className="mt-2 text-neutral-600">
        Kurs sürecinize ait özet bilgiler burada toplanacaktır.
      </p>
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#111111]">
          Süreç bilgileri
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Ders, sınav, evrak ve ödeme durumlarınız burada
          görüntülenebilecek. Kayıtlarınız güncellendikçe bu ekran otomatik
          olarak dolacaktır.
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          Bilgileriniz ofis tarafından işlendikçe bu sayfada yer alır.
        </p>
      </div>
    </div>
  );
}
