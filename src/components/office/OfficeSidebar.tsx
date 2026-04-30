import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";

const nav = [
  { href: "/office/dashboard", label: "Özet" },
  { href: "/office/students", label: "Öğrenciler" },
] as const;

export function OfficeSidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-neutral-200 bg-[#1a1a1a] text-white md:h-auto md:min-h-dvh md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="border-b border-white/10 px-4 py-4">
        <Link href="/office/dashboard" className="text-lg font-bold text-[#FACC15]">
          Karizmam
        </Link>
        <p className="mt-1 text-xs text-white/60">Ofis paneli</p>
      </div>
      <nav className="flex flex-wrap gap-1 p-2 md:flex-col md:flex-nowrap md:gap-0 md:p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 md:py-2.5"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-3">
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Çıkış
          </button>
        </form>
        <Link
          href="/"
          className="mt-2 block text-xs font-medium text-white/50 underline-offset-4 hover:text-white hover:underline"
        >
          Siteyi görüntüle
        </Link>
      </div>
    </aside>
  );
}
