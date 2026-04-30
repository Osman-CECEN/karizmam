"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createStudent,
  deleteStudent,
  updateStudent,
  type StudentInput,
} from "@/app/admin/students/actions";
import type {
  InstructorOption,
  ProfileLinkOption,
  StudentRow,
  UserRole,
} from "@/types/database";

const REGISTRATION_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Pasif" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal" },
] as const;

const DOCUMENT_OPTIONS = [
  { value: "pending", label: "Beklemede" },
  { value: "received", label: "Teslim alındı" },
  { value: "in_review", label: "İncelemede" },
  { value: "complete", label: "Tamam" },
  { value: "incomplete", label: "Eksik" },
] as const;

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Beklemede" },
  { value: "partial", label: "Kısmi" },
  { value: "paid", label: "Ödendi" },
  { value: "waived", label: "Muaf / diğer" },
] as const;

const LICENSE_OPTIONS = [
  { value: "", label: "Tümü / belirtilmedi" },
  { value: "B", label: "B" },
  { value: "A", label: "A" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "D", label: "D" },
];

function registrationLabel(code: string) {
  return REGISTRATION_OPTIONS.find((o) => o.value === code)?.label ?? code;
}
function documentLabel(code: string) {
  return DOCUMENT_OPTIONS.find((o) => o.value === code)?.label ?? code;
}
function paymentLabel(code: string) {
  return PAYMENT_OPTIONS.find((o) => o.value === code)?.label ?? code;
}

function emptyForm(): StudentInput {
  return {
    student_code: "",
    use_auto_code: true,
    full_name: "",
    phone: "",
    email: "",
    tc_last4: "",
    tc_full: "",
    identity_card_serial: "",
    license_class: "",
    registration_status: "active",
    document_status: "pending",
    payment_status: "pending",
    theory_exam_date: null,
    driving_exam_date: null,
    assigned_instructor_id: null,
    notes: "",
    manual_profile_id: "",
  };
}

function rowToInput(row: StudentRow): StudentInput {
  return {
    student_code: row.student_code,
    use_auto_code: false,
    full_name: row.full_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    tc_last4: row.tc_last4 ?? "",
    tc_full: "",
    identity_card_serial: "",
    license_class: row.license_class ?? "",
    registration_status: row.registration_status,
    document_status: row.document_status,
    payment_status: row.payment_status,
    theory_exam_date: row.theory_exam_date,
    driving_exam_date: row.driving_exam_date,
    assigned_instructor_id: row.assigned_instructor_id,
    notes: row.notes ?? "",
    manual_profile_id: row.profile_id ?? "",
  };
}

function profileLabel(p: ProfileLinkOption) {
  const name =
    (p.full_name && p.full_name.trim()) ||
    `(İsimsiz — ${String(p.id).slice(0, 8)}…)`;
  const handle =
    p.username && p.username.trim() ? ` @${p.username.trim()}` : "";
  return `${name}${handle} — ${p.role}`;
}

function instructorLabel(i: InstructorOption) {
  return `${i.name} (${i.role_title})`;
}

function formatDateTimeTr(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

type Props = {
  initialRows: StudentRow[];
  instructors: InstructorOption[];
  profiles: ProfileLinkOption[];
  listError: string | null;
};

export function StudentsManager({
  initialRows,
  instructors,
  profiles,
  listError,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; row: StudentRow } | null
  >(null);
  const [form, setForm] = useState<StudentInput>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [fReg, setFReg] = useState("");
  const [fDoc, setFDoc] = useState("");
  const [fPay, setFPay] = useState("");
  const [fLic, setFLic] = useState("");

  const mergedProfiles = useMemo(() => {
    if (dialog?.mode !== "edit") return profiles;
    const pid = dialog.row.profile_id;
    if (!pid) return profiles;
    const found = profiles.some((p) => p.id === pid);
    if (found) return profiles;
    const placeholder: ProfileLinkOption = {
      id: pid,
      full_name: dialog.row.full_name ?? null,
      username: dialog.row.username ?? null,
      role: "student" satisfies UserRole,
    };
    return [placeholder, ...profiles];
  }, [profiles, dialog]);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialRows.filter((row) => {
      if (fReg && row.registration_status !== fReg) return false;
      if (fDoc && row.document_status !== fDoc) return false;
      if (fPay && row.payment_status !== fPay) return false;
      if (fLic && (row.license_class ?? "") !== fLic) return false;
      if (!q) return true;
      const hay =
        `${row.full_name} ${row.phone ?? ""} ${row.student_code} ${row.username ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [initialRows, query, fReg, fDoc, fPay, fLic]);

  function openCreate() {
    setForm(emptyForm());
    setFormError(null);
    setDialog({ mode: "create" });
  }

  function openEdit(row: StudentRow) {
    setForm(rowToInput(row));
    setFormError(null);
    setDialog({ mode: "edit", row });
  }

  function closeDialog() {
    setDialog(null);
    setFormError(null);
  }

  function validateForm(): string | null {
    if (!form.full_name.trim()) return "Ad soyad zorunludur.";
    if (form.tc_last4.trim() && !/^\d{4}$/.test(form.tc_last4.trim())) {
      return "T.C. kimlik için yalnızca son 4 rakam girilebilir.";
    }
    if (dialog?.mode === "create" && !form.use_auto_code && !form.student_code.trim()) {
      return "Öğrenci kodunu yazın ya da otomatik oluşturmayı seçin.";
    }
    return null;
  }

  function save() {
    const v = validateForm();
    if (v) {
      setFormError(v);
      return;
    }

    startTransition(async () => {
      if (!dialog) return;
      if (dialog.mode === "create") {
        const result = await createStudent(form);
        if (!result.ok) {
          setFormError(result.error ?? "Kayıt oluşturulamadı.");
          return;
        }
      } else {
        const result = await updateStudent(dialog.row.id, form);
        if (!result.ok) {
          setFormError(result.error ?? "Kayıt güncellenemedi.");
          return;
        }
      }
      closeDialog();
      router.refresh();
    });
  }

  function confirmDelete(row: StudentRow) {
    const ok = window.confirm(
      `"${row.full_name}" öğrenci kaydı silinsin mi? Bu işlem geri alınamaz.`
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteStudent(row.id);
      if (!result.ok) {
        window.alert(result.error ?? "Kayıt silinemedi.");
        return;
      }
      router.refresh();
    });
  }

  function instructorName(id: string | null) {
    if (!id) return "—";
    return instructors.find((i) => i.id === id)?.name ?? "(Eğitmen)";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Öğrenciler</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Kurs öğrencilerini yönetin. Kayıtlar Supabase üzerindedir (Akınsoft
            bağlantısı yoktur).
          </p>
          {listError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {listError}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Yeni öğrenci
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block text-xs font-medium text-neutral-600">
            Ara (ad, tel, kod)
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-[#111111]/10 focus:border-[#111111] focus:ring-2"
              placeholder="Ara..."
            />
          </label>
          <label className="block text-xs font-medium text-neutral-600">
            Kayıt durumu
            <select
              value={fReg}
              onChange={(e) => setFReg(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-[#111111]/10 focus:border-[#111111] focus:ring-2"
            >
              <option value="">Tümü</option>
              {REGISTRATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-neutral-600">
            Belge durumu
            <select
              value={fDoc}
              onChange={(e) => setFDoc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-[#111111]/10 focus:border-[#111111] focus:ring-2"
            >
              <option value="">Tümü</option>
              {DOCUMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-neutral-600">
            Ödeme durumu
            <select
              value={fPay}
              onChange={(e) => setFPay(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-[#111111]/10 focus:border-[#111111] focus:ring-2"
            >
              <option value="">Tümü</option>
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-neutral-600">
            Ehliyet sınıfı
            <select
              value={fLic}
              onChange={(e) => setFLic(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-[#111111]/10 focus:border-[#111111] focus:ring-2"
            >
              {LICENSE_OPTIONS.map((o) => (
                <option key={o.value || "ALL"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 font-semibold text-neutral-800">Kod</th>
              <th className="px-3 py-2 font-semibold text-neutral-800">Ad</th>
              <th className="px-3 py-2 font-semibold text-neutral-800">Tel</th>
              <th className="px-3 py-2 font-semibold text-neutral-800">
                Ehliyet
              </th>
              <th className="px-3 py-2 font-semibold text-neutral-800">
                Kayıt / belge / ödeme
              </th>
              <th className="px-3 py-2 font-semibold text-neutral-800">
                Eğitmen
              </th>
              <th className="px-3 py-2 font-semibold text-neutral-800">
                Hesap
              </th>
              <th className="px-3 py-2 font-semibold text-neutral-800 w-36">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {displayed.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-8 text-center text-neutral-600"
                  colSpan={8}
                >
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              displayed.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 font-medium text-neutral-900">
                    {row.student_code}
                  </td>
                  <td className="px-3 py-2 text-neutral-800">{row.full_name}</td>
                  <td className="px-3 py-2 text-neutral-600">
                    {row.phone ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-neutral-600">
                    {row.license_class ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-neutral-600">
                    <div className="space-y-0.5 leading-tight">
                      <span>{registrationLabel(row.registration_status)}</span>
                      <span className="text-neutral-400"> · </span>
                      <span>{documentLabel(row.document_status)}</span>
                      <span className="text-neutral-400"> · </span>
                      <span>{paymentLabel(row.payment_status)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-neutral-700">
                    {instructorName(row.assigned_instructor_id)}
                  </td>
                  <td className="px-3 py-2 text-neutral-700">
                    <div className="space-y-0.5 text-xs leading-tight">
                      <div>
                        İlk giriş:{" "}
                        {row.initial_login_used === true ? (
                          <span className="text-emerald-700">Kullanıldı</span>
                        ) : (
                          <span className="text-amber-800">Bekliyor</span>
                        )}
                      </div>
                      <div className="text-neutral-600">
                        Aktivasyon: {formatDateTimeTr(row.activated_at)}
                      </div>
                      <div className="text-neutral-600">
                        Parola sıf.:{" "}
                        {formatDateTimeTr(row.password_reset_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        disabled={pending}
                        className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-neutral-50"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(row)}
                        disabled={pending}
                        className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {dialog ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-dialog-title"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h2
                id="student-dialog-title"
                className="text-lg font-bold text-[#111111]"
              >
                {dialog.mode === "create"
                  ? "Yeni öğrenci"
                  : "Öğrenciyi düzenle"}
              </h2>
            </div>
            <div className="space-y-4 px-5 py-4">
              {dialog.mode === "create" ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.use_auto_code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, use_auto_code: e.target.checked }))
                    }
                  />
                  Öğrenci kodunu otomatik üret (KRM-YYYY-0001)
                </label>
              ) : null}
              {!form.use_auto_code || dialog.mode === "edit" ? (
                <label className="block text-xs font-medium text-neutral-600">
                  Öğrenci kodu
                  <input
                    value={form.student_code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, student_code: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="Örn. KRM-2026-0001"
                  />
                </label>
              ) : null}

              <label className="block text-xs font-medium text-neutral-600">
                Ad soyad{" "}
                <span className="text-red-600" aria-hidden>
                  *
                </span>
                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Telefon
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  E-posta (hesap eşlemesi için)
                  <input
                    type="email"
                    autoComplete="off"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-xs font-medium text-neutral-600">
                T.C. son 4 hane (görüntüleme)
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={form.tc_last4}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      tc_last4: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Örn. 1234"
                />
              </label>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
                <p className="font-semibold text-neutral-800">
                  Kimlik doğrulama (yalnızca kayıt)
                </p>
                <p className="mt-1 leading-relaxed">
                  Tam T.C. ve kimlik kartı seri/no düz metin olarak saklanmaz; yalnızca
                  sunucuda özetlenir. Kimlik seri/no bu ekranda gösterilmez. Öğrenci
                  ilk girişi için bu alanların doğru girilmiş olması gerekir.
                </p>
                <label className="mt-3 block font-medium text-neutral-700">
                  Tam T.C. kimlik (11 hane, isteğe bağlı)
                  <input
                    type="password"
                    name="tc_full_masked"
                    autoComplete="off"
                    value={form.tc_full}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tc_full: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
                    placeholder="Kayıt sırasında bir kez"
                  />
                </label>
                <label className="mt-2 block font-medium text-neutral-700">
                  Kimlik kartı seri / no (isteğe bağlı)
                  <input
                    type="password"
                    autoComplete="off"
                    value={form.identity_card_serial}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        identity_card_serial: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
                    placeholder="Kayıt sırasında bir kez"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Hesaba bağlı profil — veya elle seçin
                  <select
                    value={form.manual_profile_id}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        manual_profile_id: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    <option value="">
                      Sadece e-posta ile eşleştir / bağlama yok
                    </option>
                    {mergedProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {profileLabel(p)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Ehliyet sınıfı
                  <select
                    value={form.license_class}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        license_class: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    <option value="">—</option>
                    {LICENSE_OPTIONS.filter((x) => x.value).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-xs font-medium text-neutral-600">
                  Kayıt durumu
                  <select
                    value={form.registration_status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        registration_status: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    {REGISTRATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Belge durumu
                  <select
                    value={form.document_status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        document_status: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    {DOCUMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Ödeme durumu (ödeme entegrasyonu yoktur)
                  <select
                    value={form.payment_status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        payment_status: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  >
                    {PAYMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Teorik sınav tarihi
                  <input
                    type="date"
                    value={form.theory_exam_date ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        theory_exam_date:
                          e.target.value.length > 0 ? e.target.value : null,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-neutral-600">
                  Direksiyon sınav tarihi
                  <input
                    type="date"
                    value={form.driving_exam_date ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        driving_exam_date:
                          e.target.value.length > 0 ? e.target.value : null,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-xs font-medium text-neutral-600">
                Atanan eğitmen
                <select
                  value={form.assigned_instructor_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      assigned_instructor_id:
                        e.target.value.length > 0 ? e.target.value : null,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="">— Atanmadı —</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {instructorLabel(i)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-medium text-neutral-600">
                Notlar
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </label>

              {formError ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {formError}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {pending ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
