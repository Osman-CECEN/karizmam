import Link from "next/link";
import {
  Car,
  Hand,
  Motorbike,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

const services = [
  {
    id: "b" as const,
    title: "B Sınıfı Ehliyet",
    href: "/b-sinifi-ehliyet" as const,
    desc: "Binek otomobiller için gerekli teorik ve uygulamaya yönelik sürücü kursu süreci. Koşulları ve planı birlikte değerlendirelim.",
    icon: Car,
  },
  {
    id: "a" as const,
    title: "Motosiklet Ehliyeti",
    href: "/motosiklet-ehliyeti" as const,
    desc: "Motosiklet ehliyeti kapsamında, mevcut yönetmelikler çerçevesinde aşamalar hakkında bilgi; kayıt öncesi tüm adımları açıkça anlatıyoruz.",
    icon: Motorbike,
  },
  {
    id: "d" as const,
    title: "Direksiyon Dersi",
    href: "/direksiyon-dersi" as const,
    desc: "Birebir direksiyon uygulaması, ihtiyaca göre ders planı. Yoğunluğunuz ve tecrübenize göre ilerleme hızı birlikte belirlenir.",
    icon: Hand,
  },
  {
    id: "t" as const,
    title: "Teorik Eğitim",
    href: "/iletisim" as const,
    desc: "Yöntem sınıf planı, örnek özet. Gerçeğe dönük içerik ve takvim için iletişime geçin.",
    icon: BookOpen,
  },
  {
    id: "s" as const,
    title: "Sınav Hazırlığı",
    href: "/iletisim" as const,
    desc: "Örnek hazırlık paketi. Deneme ve takvim bilgileri ayrıca teyit edilebilir.",
    icon: GraduationCap,
  },
] as const;

export default function HomeServices() {
  return (
    <section
      id="hizmetler"
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="services-title"
    >
      <div className="section-px">
        <h2
          id="services-title"
          className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
        >
          Hizmetler
        </h2>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Seçtiğiniz sınıf için süreç, kayıt ve derslere dair ayrıntıları
          inceleyebilir veya doğrudan iletişimden bilgi alabilirsiniz.
        </p>

        <ul
          className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-7"
          role="list"
        >
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.id} className="h-full">
                <Link
                  href={s.href}
                  className="group block h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out will-change-transform sm:p-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                >
                  <article className="flex h-full min-h-0 flex-col text-left">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-[#FACC15]/30 text-[#111111] transition-opacity group-hover:opacity-100"
                    >
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-[#111111] sm:text-xl">
                      {s.title}
                    </h3>
                    <p className="mt-2 grow text-sm font-normal leading-relaxed text-gray-600 sm:text-sm">
                      {s.desc}
                    </p>
                    <span
                      className="mt-6 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#111111] bg-surface text-sm font-bold text-[#111111] transition-colors group-hover:bg-[#111111] group-hover:text-white"
                    >
                      Detaylı Bilgi Al
                      <ArrowUpRight
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </span>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
