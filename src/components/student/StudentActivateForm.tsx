"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  submitStudentActivation,
  type StudentActivateFormState,
} from "@/app/student/activate/actions";

const initialState: StudentActivateFormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-[#eab308] disabled:opacity-60"
    >
      {pending ? "İşleniyor…" : "Hesabı oluştur ve giriş yap"}
    </button>
  );
}

export function StudentActivateForm() {
  const [state, formAction] = useFormState(submitStudentActivation, initialState);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold text-[#111111]">Öğrenci ilk giriş</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        Kurs kaydınızı doğrulayın, kullanıcı adı ve şifre belirleyin. T.C.
        kimlik ve kimlik kartı bilgileri düz metin olarak saklanmaz.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block text-xs font-medium text-neutral-700">
          T.C. kimlik numarası (11 hane)
          <input
            name="tc"
            type="password"
            autoComplete="off"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-700">
          Telefon son 4 hane
          <input
            name="phone_last4"
            inputMode="numeric"
            maxLength={4}
            pattern="\d{4}"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-700">
          Kimlik kartı seri / numarası
          <input
            name="identity_serial"
            type="password"
            autoComplete="off"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-700">
          Kullanıcı adı (küçük harf, rakam, alt çizgi)
          <input
            name="username"
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={24}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-700">
          Şifre
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-700">
          Şifre tekrar
          <input
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        {state.error ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-[#0B2A4A] underline-offset-4 hover:underline">
          Giriş sayfasına dön
        </Link>
      </p>
    </div>
  );
}
