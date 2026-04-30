import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireRole } from "@/lib/auth/requireRole";
import { signOutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["admin"]);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#f5f5f5] text-[#111111] md:flex-row">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:px-6">
          <p className="text-sm text-neutral-500 md:hidden">Menüyü kaydırın</p>
          <form action={signOutAction} className="ml-auto">
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#111111] transition hover:bg-neutral-50"
            >
              Çıkış
            </button>
          </form>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
