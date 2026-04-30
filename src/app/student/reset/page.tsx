import type { Metadata } from "next";
import { StudentResetForm } from "@/components/student/StudentResetForm";

export const metadata: Metadata = {
  title: "Öğrenci şifre sıfırlama",
  robots: { index: false, follow: false },
};

export default function StudentResetPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#0B2A4A] to-[#041018] px-4 py-12">
      <StudentResetForm />
    </div>
  );
}
