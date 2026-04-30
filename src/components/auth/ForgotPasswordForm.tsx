"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);

  if (!supabase) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <p className="text-sm text-neutral-600">Oturum yapılandırması eksik.</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-[#0B2A4A] underline">
          Girişe dön
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const em = email.trim();
    if (!em) {
      setError("E-posta adresinizi girin.");
      return;
    }
    startTransition(async () => {
      const client = createClient();
      if (!client) {
        setError("Oturum yapılandırması eksik.");
        return;
      }
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetErr } = await client.auth.resetPasswordForEmail(em, {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/set-password")}`,
      });
      if (resetErr) {
        setError("İşlem tamamlanamadı. E-posta adresinizi kontrol edin.");
        return;
      }
      setMessage(
        "E-posta adresinize bir bağlantı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin."
      );
    });
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold text-[#111111]">Üye şifremi unuttum</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilir.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-[#111111]">
          E-posta
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            disabled={pending}
            required
          />
        </label>
        {error ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-800" role="status">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#eab308] disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Bağlantı gönder"}
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
