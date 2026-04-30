import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import {
  getPhoneDisplay,
  getPhoneHref,
  getWhatsAppHref,
} from "@/lib/site";

export default function HomeHero() {
  const wa = getWhatsAppHref();
  const tel = getPhoneHref();
  const display = getPhoneDisplay();

  const baseBtn =
    "inline-flex w-full min-h-[2.75rem] items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors sm:w-auto sm:min-w-[10.5rem]";
  const primaryBtn =
    `${baseBtn} bg-[#FACC15] px-6 py-3 text-[#111111] shadow-sm hover:bg-[#EAB308]`;
  const secondaryBtn = `${baseBtn} border-2 border-gray-300 bg-white px-6 py-3 text-[#111111] hover:bg-gray-50`;

  const waChild = (
    <>
      <MessageCircle className="size-[1.125rem] shrink-0" strokeWidth={2} aria-hidden />
      WhatsApp’tan Bilgi Al
    </>
  );
  const phoneChild = (
    <>
      <Phone className="size-[1.125rem] shrink-0" strokeWidth={2} aria-hidden />
      Hemen Ara
    </>
  );

  return (
    <section
      className="border-b border-gray-200 bg-[#FFFFFF] py-12 md:py-16"
      aria-labelledby="hero-title"
    >
      <div className="section-px">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <p className="text-sm font-semibold text-gray-600">Erzincan</p>
            <h1
              id="hero-title"
              className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#111111] md:text-5xl"
            >
              Karizmam Sürücü Kursu
            </h1>
            <p className="mt-6 text-base font-normal leading-relaxed text-gray-600 md:text-lg">
              Erzincan’da ehliyet almak isteyenler için net, anlaşılır ve
              güvenilir eğitim süreci.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-3 lg:justify-start">
              {wa ? (
                <a
                  href={wa}
                  className={primaryBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {waChild}
                </a>
              ) : (
                <Link href="/iletisim" className={primaryBtn}>
                  {waChild}
                </Link>
              )}
              {tel ? (
                <a
                  href={tel}
                  className={secondaryBtn}
                  aria-label={`Ara: ${display}`}
                >
                  {phoneChild}
                </a>
              ) : (
                <Link
                  href="/iletisim"
                  className={secondaryBtn}
                  aria-label="Hemen Ara: İletişim"
                >
                  {phoneChild}
                </Link>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-md">
              <SafeImage
                src="/images/hero-driving.jpg"
                alt="Kurum bahçesi ve sürücü eğitim ortamı"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                wrapperClassName="aspect-[16/10] w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
