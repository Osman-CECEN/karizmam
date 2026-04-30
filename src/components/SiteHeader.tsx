"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { getPhoneHref } from "@/lib/site";

const nav = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/b-sinifi-ehliyet", label: "B Sınıfı Ehliyet" },
  { href: "/motosiklet-ehliyeti", label: "Motosiklet Ehliyeti" },
  { href: "/direksiyon-dersi", label: "Direksiyon Dersi" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
] as const;

function CallCta() {
  const href = getPhoneHref();
  const className =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-black/10 bg-[#FACC15] px-5 text-sm font-bold text-[#111111] transition-colors duration-200 ease-out hover:bg-[#EAB308] active:scale-[0.99]";
  if (href) {
    return (
      <a href={href} className={className} aria-label="Hemen Ara">
        <Phone className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
        Hemen Ara
      </a>
    );
  }
  return (
    <Link
      href="/iletisim"
      className={className}
      aria-label="Hemen Ara: İletişim sayfası"
    >
      <Phone className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
      Hemen Ara
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-ink md:text-xl">
          Karizmam Sürücü Kursu
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex lg:gap-2"
          aria-label="Ana menü"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink/90 transition-colors hover:bg-soft hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <CallCta />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span className="sr-only">Menüyü aç veya kapat</span>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-surface px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1" role="list">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink/90 hover:bg-soft"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <div className="w-full" onClick={() => setOpen(false)} role="presentation">
                <CallCta />
              </div>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
