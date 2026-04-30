"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/panel";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const supabase = useMemo(() => createClient(), []);

  if (!supabase) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-amber-200/80 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-[#111111]">Giriş</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Oturum sistemi yapılandırılmamış. Ortam değişkenlerinde{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          ve{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          tanımlanmalıdır.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-semibold text-[#0B2A4A] underline-offset-4 hover:underline"
        >
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const em = email.trim();
    if (!em || !password) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }
    startTransition(async () => {
      const client = createClient();
      if (!client) {
        setError("Oturum yapılandırması eksik.");
        return;
      }
      const { error: signError } = await client.auth.signInWithPassword({
        email: em,
        password,
      });
      if (signError) {
        setError(
          signError.message.includes("Invalid login")
            ? "E-posta veya şifre hatalı."
            : signError.message
        );
        return;
      }
      router.replace(nextPath);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
        Giriş yap
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Karizmam paneline erişmek için e-posta ve şifrenizi girin.
      </p>

      {reason === "inactive" ? (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Hesabınız devre dışı bırakılmış. Lütfen ofisle iletişime geçin.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#111111]"
          >
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[#111111] outline-none ring-[#FACC15] focus:border-[#FACC15] focus:ring-2"
            disabled={pending}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#111111]"
          >
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[#111111] outline-none ring-[#FACC15] focus:border-[#FACC15] focus:ring-2"
            disabled={pending}
          />
        </div>

        {error ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-[#eab308] disabled:opacity-60"
        >
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-6 inline-flex text-sm font-medium text-[#0B2A4A] underline-offset-4 hover:underline"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
