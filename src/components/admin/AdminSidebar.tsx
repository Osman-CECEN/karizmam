import Link from "next/link";

const nav = [
  { href: "/admin/dashboard", label: "Özet" },
  { href: "/admin/instructors", label: "Eğitmenler" },
  { href: "/admin/vehicles", label: "Araçlar" },
  { href: "/admin/gallery", label: "Galeri" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/members", label: "Üyeler" },
  { href: "/admin/students", label: "Öğrenciler" },
  { href: "/admin/settings", label: "Site ayarları" },
] as const;

export function AdminSidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-neutral-200 bg-[#111111] text-white md:h-auto md:min-h-dvh md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="border-b border-white/10 px-4 py-4">
        <Link href="/admin/dashboard" className="text-lg font-bold text-[#FACC15]">
          Karizmam
        </Link>
        <p className="mt-1 text-xs text-white/60">Yönetim paneli</p>
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
      <div className="mt-auto hidden border-t border-white/10 p-3 md:block">
        <Link
          href="/"
          className="text-xs font-medium text-white/50 underline-offset-4 hover:text-white hover:underline"
        >
          Siteyi görüntüle
        </Link>
      </div>
    </aside>
  );
}
