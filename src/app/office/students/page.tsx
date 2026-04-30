import type { Metadata } from "next";
import { StudentsManager } from "@/components/admin/StudentsManager";
import {
  listInstructorsForStudents,
  listProfilesForStudentLink,
  listStudents,
} from "@/app/admin/students/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Öğrenciler",
  robots: { index: false, follow: false },
};

export default async function OfficeStudentsPage() {
  const [st, ins, pr] = await Promise.all([
    listStudents(),
    listInstructorsForStudents(),
    listProfilesForStudentLink(),
  ]);

  const listError =
    (!st.ok ? st.error : !ins.ok ? ins.error : !pr.ok ? pr.error : undefined) ??
    null;

  return (
    <StudentsManager
      initialRows={st.data ?? []}
      instructors={ins.data ?? []}
      profiles={pr.data ?? []}
      listError={listError}
    />
  );
}
