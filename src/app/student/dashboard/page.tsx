import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/requireRole";
import type { InstructorRow, StudentRow } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Öğrenci paneli",
  robots: { index: false, follow: false },
};

const REG_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const DOC_LABEL: Record<string, string> = {
  pending: "Beklemede",
  received: "Teslim alındı",
  in_review: "İncelemede",
  complete: "Tamam",
  incomplete: "Eksik",
};

const PAY_LABEL: Record<string, string> = {
  pending: "Beklemede",
  partial: "Kısmi",
  paid: "Ödendi",
  waived: "Muaf / diğer",
};

function label(m: Record<string, string>, key: string) {
  return m[key] ?? key;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeZone: "Europe/Istanbul",
    }).format(new Date(d + "T12:00:00Z"));
  } catch {
    return d;
  }
}

export default async function StudentDashboardPage() {
  const profile = await requireRole(["student"]);

  const supabase = await createClient();
  let student: StudentRow | null = null;
  let instructor: Pick<InstructorRow, "name"> | null = null;
  let loadError: string | null = null;

  if (supabase) {
    const { data: s, error: sErr } = await supabase
      .from("students")
      .select(
        "id, profile_id, student_code, full_name, phone, email, tc_last4, phone_last4, username, license_class, registration_status, document_status, payment_status, theory_exam_date, driving_exam_date, assigned_instructor_id, notes, initial_login_used, must_change_password, activated_at, created_at, updated_at"
      )
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (sErr) {
      loadError = sErr.message;
    } else {
      student = s as StudentRow | null;
    }

    if (student?.assigned_instructor_id) {
      const { data: ins } = await supabase
        .from("instructors")
        .select("name")
        .eq("id", student.assigned_instructor_id)
        .maybeSingle();
      instructor = ins;
    }
  } else {
    loadError = "Veritabanı bağlantısı yapılandırılmamış.";
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <h1 className="text-2xl font-bold text-[#111111]">Öğrenci paneli</h1>
      <p className="mt-2 text-neutral-600">
        Kurs sürecinize ait bilgiler aşağıdadır. Sorularınız için ofisle
        iletişime geçebilirsiniz.
      </p>

      {loadError ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Veriler yüklenirken bir hata oluştu: {loadError}
        </p>
      ) : null}

      {!loadError && !student ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
          <p className="font-semibold">Kayıt bulunamadı</p>
          <p className="mt-2">
            Öğrenci bilgileriniz henüz sisteme tanımlanmamış. Lütfen kurs ile
            iletişime geçin.
          </p>
        </div>
      ) : null}

      {student ? (
        <dl className="mt-8 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Öğrenci kodu
            </dt>
            <dd className="text-sm font-semibold text-[#111111]">
              {student.student_code}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Ehliyet sınıfı
            </dt>
            <dd className="text-sm text-neutral-900">
              {student.license_class ?? "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Kayıt durumu
            </dt>
            <dd className="text-sm text-neutral-900">
              {label(REG_LABEL, student.registration_status)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Evrak durumu
            </dt>
            <dd className="text-sm text-neutral-900">
              {label(DOC_LABEL, student.document_status)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Ödeme durumu
            </dt>
            <dd className="text-sm text-neutral-900">
              {label(PAY_LABEL, student.payment_status)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Teorik sınav tarihi
            </dt>
            <dd className="text-sm text-neutral-900">
              {formatDate(student.theory_exam_date)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Direksiyon sınav tarihi
            </dt>
            <dd className="text-sm text-neutral-900">
              {formatDate(student.driving_exam_date)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-neutral-500">
              Atanmış eğitmen
            </dt>
            <dd className="text-sm text-neutral-900">{instructor?.name ?? "—"}</dd>
          </div>
          <div className="border-t border-neutral-100 pt-4">
            <dt className="text-sm font-medium text-neutral-500">Notlar</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">
              {(student.notes && student.notes.trim()) ||
                "Not bulunmuyor."}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
