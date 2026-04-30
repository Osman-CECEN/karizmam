import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { ContactActionButtons } from "@/components/ContactActionButtons";
import {
  getAddressDisplay,
  getPhoneDisplay,
  getPhoneHref,
  getWhatsAppHref,
  site,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${site.name} ${site.city} iletişim. Telefon, WhatsApp veya ziyaret için aşağıdaki bilgileri kullanın; eksik alanlar kurum tarafından doldurulacaktır.`,
  openGraph: { title: `İletişim | ${site.name}` },
};

export default function IletisimPage() {
  const address = getAddressDisplay();
  const phoneText = getPhoneDisplay();
  const phoneHref = getPhoneHref();
  const wa = getWhatsAppHref();

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <div className="border-b border-gray-200 bg-surface shadow-sm">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            İletişim
          </h1>
          <p className="mt-4 text-base font-normal leading-relaxed text-gray-600">
            Sorularınız, kayıt ve ders planı için aşağıdaki kanallardan
            bize ulaşabilirsiniz. Aşağıdaki alanlarda metin, kurumun
            kendi numara ve adresini siteye eklediğinde otomatik
            güncellenir; şu an doldurulmamışsa açık bilgi metni
            gösterilir.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6 md:py-10">
        <ul className="space-y-4" role="list">
          <li className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <MapPin
              className="mt-0.5 size-5 shrink-0 text-[#111111]"
              strokeWidth={2}
              aria-hidden
            />
            <div>
              <h2 className="text-sm font-extrabold text-[#111111]">Adres</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {address}
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <Phone
              className="mt-0.5 size-5 shrink-0 text-[#111111]"
              strokeWidth={2}
              aria-hidden
            />
            <div>
              <h2 className="text-sm font-extrabold text-[#111111]">Telefon</h2>
              {phoneHref ? (
                <a
                  href={phoneHref}
                  className="mt-1 inline-block text-sm font-medium text-[#111111] underline-offset-2 hover:underline"
                >
                  {phoneText}
                </a>
              ) : (
                <p className="mt-1 text-sm text-gray-600">{phoneText}</p>
              )}
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <MessageCircle
              className="mt-0.5 size-5 shrink-0 text-[#111111]"
              strokeWidth={2}
              aria-hidden
            />
            <div>
              <h2 className="text-sm font-extrabold text-[#111111]">WhatsApp</h2>
              {wa ? (
                <a
                  href={wa}
                  className="mt-1 inline-block text-sm font-medium text-[#111111] underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp ile yazın
                </a>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  WhatsApp numarası site ayarlarına eklendikten sonra
                  bu satır tıklanabilir hale getirilecektir.
                </p>
              )}
            </div>
          </li>
        </ul>

        <h2 className="mt-10 text-base font-extrabold text-[#111111]">
          Hızlı hareket
        </h2>
        <div className="mt-4">
          <ContactActionButtons size="md" />
        </div>
        <p className="mt-8 text-sm text-gray-600">
          <Link
            href="/"
            className="font-semibold text-[#111111] underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            Ana sayfaya dön
          </Link>
        </p>
      </div>
    </main>
  );
}
