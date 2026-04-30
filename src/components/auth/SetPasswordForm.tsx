"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!supabase) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 shadow-lg text-sm text-neutral-600">
        Oturum yapılandırması eksik.
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    startTransition(async () => {
      const client = createClient();
      if (!client) {
        setError("Oturum yapılandırması eksik.");
        return;
      }
      const { error: uErr } = await client.auth.updateUser({ password });
      if (uErr) {
        setError("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.");
        return;
      }
      await client.auth.signOut();
      router.replace("/login?reason=student_password_updated");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold text-[#111111]">Yeni şifre belirle</h1>
      <p className="mt-2 text-sm text-neutral-600">
        E-posta bağlantısıyla geldiyseniz, yeni şifrenizi aşağıdan kaydedin.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-[#111111]">
          Yeni şifre
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            disabled={pending}
            minLength={8}
            required
          />
        </label>
        <label className="block text-sm font-medium text-[#111111]">
          Yeni şifre tekrar
          <input
            type="password"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            disabled={pending}
            minLength={8}
            required
          />
        </label>
        {error ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#eab308] disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : "Şifreyi kaydet"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-[#0B2A4A] underline-offset-4 hover:underline">
          Girişe dön
        </Link>
      </p>
    </div>
  );
}
