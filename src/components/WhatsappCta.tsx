"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppHref } from "@/lib/site";

const label = "Bilgi almak için WhatsApp";

export default function WhatsappCta() {
  const href = getWhatsAppHref();
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0a0a0a] text-brand shadow-md ring-2 ring-brand/60 transition-shadow hover:shadow-lg md:bottom-6 md:right-6 md:h-14 md:w-14"
        aria-label={label}
        title="WhatsApp"
      >
        <MessageCircle className="size-6 md:size-7" strokeWidth={1.75} />
      </a>
    );
  }
  return (
    <Link
      href="/iletisim"
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-md transition-shadow hover:bg-soft md:bottom-6 md:right-6 md:h-14 md:w-14"
      aria-label="WhatsApp: İletişim sayfası"
      title="İletişim"
    >
      <MessageCircle className="size-6 text-brand md:size-7" strokeWidth={1.75} />
    </Link>
  );
}
