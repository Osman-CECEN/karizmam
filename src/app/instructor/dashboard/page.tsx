import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eğitmen paneli",
  robots: { index: false, follow: false },
};

export default async function InstructorDashboardPage() {
  await requireRole(["instructor", "admin"]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <h1 className="text-2xl font-bold text-[#111111]">Eğitmen paneli</h1>
      <p className="mt-2 text-neutral-600">
        Size atanmış öğrenciler ve ders programınız burada yer alacak.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
        Atamalar ve program yayınlandığında bu alan güncellenecektir.
      </div>
    </div>
  );
}
