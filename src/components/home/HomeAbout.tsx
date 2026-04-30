import { SafeImage } from "@/components/SafeImage";
import { site } from "@/lib/site";

export default function HomeAbout() {
  return (
    <section
      className="section-y border-b border-gray-200 bg-surface"
      aria-labelledby="about-title"
    >
      <div className="section-px">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          <div>
            <h2
              id="about-title"
              className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl"
            >
              Hakkımızda
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {site.name}, {site.city} merkezinde sürücü adaylarına teorik ve
              uygulamalı eğitim sunar. Kayıt, ders planı ve sınav süreçlerinde
              net iletişimi ön planda tutar; her adımda sizi bilgilendiririz.
            </p>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              B sınıfı ve motosiklet ehliyeti ile direksiyon derslerinde,
              deneyimli eğitmenlerle güvenli ve ölçülü bir ilerleme hedefleriz.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <SafeImage
              src="/images/about.jpg"
              alt={`${site.name} ${site.city} — kurs binası ve eğitim ortamı`}
              sizes="(max-width: 1024px) 100vw, 45vw"
              wrapperClassName="aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
