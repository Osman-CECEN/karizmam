import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ofis paneli",
  robots: { index: false, follow: false },
};

export default async function OfficeDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <h1 className="text-2xl font-bold text-[#111111]">Ofis paneli</h1>
      <p className="mt-2 text-neutral-600">
        Öğrenci kayıt, evrak ve süreç takibi burada yönetilecek.
      </p>
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-700">
        <p className="font-semibold text-[#111111]">Öğrenciler</p>
        <p className="mt-2 text-neutral-600">
          Öğrenci listesi ve süreç yönetimi için{" "}
          <Link
            href="/office/students"
            className="font-medium text-[#111111] underline underline-offset-2"
          >
            Öğrenciler
          </Link>{" "}
          sayfasına gidin.
        </p>
      </div>
    </div>
  );
}
