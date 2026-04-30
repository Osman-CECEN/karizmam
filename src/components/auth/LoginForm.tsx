"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithIdentifierAction } from "@/app/auth/loginActions";

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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const supabaseConfigured = useMemo(() => createClient() !== null, []);

  if (!supabaseConfigured) {
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
    const id = identifier.trim();
    if (!id || !password) {
      setError("E-posta veya kullanıcı adı ile şifre zorunludur.");
      return;
    }
    startTransition(async () => {
      const result = await signInWithIdentifierAction(id, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
        Giriş yap
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        E-posta veya kullanıcı adınız ve şifrenizle Karizmam paneline giriş
        yapın.
      </p>

      {reason === "inactive" ? (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Hesabınız devre dışı bırakılmış. Lütfen ofisle iletişime geçin.
        </p>
      ) : null}
      {reason === "recovery_failed" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir talep
          oluşturun.
        </p>
      ) : null}
      {reason === "student_password_updated" ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-[#111111]"
          >
            E-posta veya kullanıcı adı
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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

      <ul className="mt-6 space-y-2 border-t border-neutral-100 pt-5 text-sm">
        <li>
          <Link
            href="/student/activate"
            className="font-medium text-[#0B2A4A] underline-offset-4 hover:underline"
          >
            Öğrenci ilk giriş
          </Link>
        </li>
        <li>
          <Link
            href="/student/reset"
            className="font-medium text-[#0B2A4A] underline-offset-4 hover:underline"
          >
            Öğrenci şifre sıfırlama
          </Link>
        </li>
        <li>
          <Link
            href="/auth/forgot"
            className="font-medium text-[#0B2A4A] underline-offset-4 hover:underline"
          >
            Üye şifremi unuttum
          </Link>
        </li>
      </ul>

      <Link
        href="/"
        className="mt-6 inline-flex text-sm font-medium text-neutral-600 underline-offset-4 hover:underline"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
