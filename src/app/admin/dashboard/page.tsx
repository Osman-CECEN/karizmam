import type { Metadata } from "next";
import Link from "next/link";
import {
  Car,
  FileText,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yönetim özeti",
  robots: { index: false, follow: false },
};

const modules = [
  {
    href: "/admin/instructors",
    title: "Eğitmenler",
    desc: "Liste, fotoğraf ve ana sayfa görünürlüğü",
    icon: Users,
  },
  {
    href: "/admin/vehicles",
    title: "Araçlar",
    desc: "Filo ve tanıtım içerikleri",
    icon: Car,
  },
  {
    href: "/admin/gallery",
    title: "Galeri",
    desc: "Görsel galeri yönetimi",
    icon: ImageIcon,
  },
  {
    href: "/admin/blog",
    title: "Blog",
    desc: "Yazılar ve duyurular",
    icon: FileText,
  },
  {
    href: "/admin/members",
    title: "Üyeler",
    desc: "Kayıtlı üyeler",
    icon: UserCircle,
  },
  {
    href: "/admin/students",
    title: "Öğrenciler",
    desc: "Kurs öğrencileri",
    icon: GraduationCap,
  },
  {
    href: "/admin/settings",
    title: "Site ayarları",
    desc: "Genel yapılandırma",
    icon: Settings,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start gap-3">
        <LayoutDashboard className="mt-1 size-8 shrink-0 text-[#0B2A4A]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Yönetim özeti
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Modüllere buradan geçiş yapabilirsiniz.
          </p>
        </div>
      </div>

      <ul className="mt-8 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <li key={m.href}>
            <Link
              href={m.href}
              className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-[#FACC15]/60 hover:shadow-md"
            >
              <m.icon className="size-8 text-[#FACC15]" aria-hidden />
              <span className="mt-3 text-lg font-semibold text-[#111111]">
                {m.title}
              </span>
              <span className="mt-1 text-sm text-neutral-600">{m.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
