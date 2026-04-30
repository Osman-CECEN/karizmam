import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { getPhoneDisplay, getPhoneHref, getWhatsAppHref } from "@/lib/site";

type Size = "md" | "lg";

const sizeClasses: Record<
  Size,
  { wrap: string; base: string; primary: string; secondary: string; icon: string }
> = {
  md: {
    wrap: "flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-4",
    base: "inline-flex w-full min-h-[3.25rem] items-center justify-center gap-2 rounded-lg px-6 text-base font-bold transition-all duration-200 ease-out sm:w-auto sm:min-w-[12rem] motion-safe:active:scale-[0.99]",
    primary: "",
    secondary: "",
    icon: "size-[1.125rem] shrink-0",
  },
  lg: {
    wrap: "flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-4",
    base: "inline-flex w-full min-h-[3.5rem] items-center justify-center gap-2.5 rounded-lg px-7 text-base font-bold transition-all duration-200 ease-out sm:w-auto sm:min-w-[15rem] md:min-h-[3.75rem] md:px-10 md:text-lg motion-safe:active:scale-[0.99]",
    primary: "shadow-sm hover:shadow-md",
    secondary: "",
    icon: "size-5 shrink-0",
  },
};

export function ContactActionButtons({ size = "md" }: { size?: Size }) {
  const wa = getWhatsAppHref();
  const tel = getPhoneHref();
  const display = getPhoneDisplay();
  const s = sizeClasses[size];

  const primary = `${s.base} ${s.primary} border border-black/10 bg-[#FACC15] text-[#111111] hover:bg-[#EAB308]`;
  const secondary = `${s.base} ${s.secondary} border-2 border-gray-300 bg-white text-[#111111] hover:border-gray-400 hover:bg-gray-50`;

  const whatsappInner = (
    <>
      <MessageCircle className={s.icon} strokeWidth={2} aria-hidden />
      WhatsApp’tan Bilgi Al
    </>
  );

  const phoneInner = (
    <>
      <Phone className={s.icon} strokeWidth={2} aria-hidden />
      Hemen Ara
    </>
  );

  return (
    <div className={s.wrap}>
      {wa ? (
        <a
          href={wa}
          className={primary}
          target="_blank"
          rel="noopener noreferrer"
        >
          {whatsappInner}
        </a>
      ) : (
        <Link href="/iletisim" className={primary}>
          {whatsappInner}
        </Link>
      )}

      {tel ? (
        <a href={tel} className={secondary} aria-label={`Ara: ${display}`}>
          {phoneInner}
        </a>
      ) : (
        <Link href="/iletisim" className={secondary} aria-label="Hemen Ara: İletişim">
          {phoneInner}
        </Link>
      )}
    </div>
  );
}
