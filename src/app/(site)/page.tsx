import type { Metadata } from "next";
import HomeAbout from "@/components/home/HomeAbout";
import HomeContactCta from "@/components/home/HomeContactCta";
import HomeFaq from "@/components/home/HomeFaq";
import HomeGallery from "@/components/home/HomeGallery";
import HomeHero from "@/components/home/HomeHero";
import HomeInstructors from "@/components/home/HomeInstructors";
import HomeProcess from "@/components/home/HomeProcess";
import HomeServices from "@/components/home/HomeServices";
import HomeTrust from "@/components/home/HomeTrust";
import HomeVehicles from "@/components/home/HomeVehicles";
import HomeWhy from "@/components/home/HomeWhy";
import { site } from "@/lib/site";
import { getSiteOrigin } from "@/lib/site/origin";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description: `${site.city}’da sürücü kursu, B sınıfı, motosiklet ve direksiyon eğitimi. Net ve güvenilir süreç, iletişimle dönüşüme yönelik bilgilendirme.`,
  alternates: { canonical: `${getSiteOrigin()}/` },
  openGraph: { title: `${site.name} | ${site.city}` },
};

export default function HomePage() {
  return (
    <main className="w-full min-h-0 flex-1">
      <HomeHero />
      <HomeServices />
      <HomeAbout />
      <HomeInstructors />
      <HomeVehicles />
      <HomeGallery />
      <HomeTrust />
      <HomeProcess />
      <HomeWhy />
      <HomeFaq />
      <HomeContactCta />
    </main>
  );
}
