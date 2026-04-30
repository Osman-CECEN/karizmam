import { SafeImage } from "@/components/SafeImage";

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
              Kısa kurumsal özet. Karizmam Sürücü Kursu, sürücü adaylarına
              yönelik örnek açıklama cümleleri burada durur; tüm metinler
              sonra resmi bilgilerle güncellenecektir.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Amaç, kayıt ve eğitim hakkında sade bir vitrin. Bu paragraf da
              yalnızca şablon niteliğindedir.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <SafeImage
              src="/images/about.jpg"
              alt="Hakkımızda bölümü tanıtım görseli"
              sizes="(max-width: 1024px) 100vw, 45vw"
              wrapperClassName="aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
