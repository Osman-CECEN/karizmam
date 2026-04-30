import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsappCta from "@/components/WhatsappCta";
import { site } from "@/lib/site";

const dmSans = DM_Sans({
  variable: "--font-sans-override",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.city}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.city} merkezde sürücü kursu, ehliyet ve direksiyon eğitimi. Net bilgi ve iletişimle süreci birlikte planlayın.`,
  openGraph: {
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={dmSans.variable}>
      <body
        className={`${dmSans.className} flex min-h-dvh flex-col antialiased text-ink bg-surface`}
      >
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <SiteFooter />
        <WhatsappCta />
      </body>
    </html>
  );
}
