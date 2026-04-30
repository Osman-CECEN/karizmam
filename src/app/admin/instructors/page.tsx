import type { Metadata } from "next";
import { InstructorsManager } from "@/components/admin/InstructorsManager";
import { listInstructorsAdmin } from "@/app/admin/instructors/actions";

export const metadata: Metadata = {
  title: "Eğitmenler",
  robots: { index: false, follow: false },
};

export default async function AdminInstructorsPage() {
  const result = await listInstructorsAdmin();
  return (
    <InstructorsManager
      initialRows={result.data ?? []}
      listError={result.ok ? null : (result.error ?? "Liste yüklenemedi.")}
    />
  );
}
