import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsappCta from "@/components/WhatsappCta";

export default function SiteChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <SiteFooter />
      <WhatsappCta />
    </>
  );
}
