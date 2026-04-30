import type { Metadata } from "next";
import { OfficeSidebar } from "@/components/office/OfficeSidebar";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OfficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["office", "admin"]);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#f5f5f5] text-[#111111] md:flex-row">
      <OfficeSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
