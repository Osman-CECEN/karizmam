import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site ayarları",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111111]">Site ayarları</h1>
      <p className="mt-3 text-neutral-600">
        Bu modül yakında eklenecek. Genel site yapılandırması buradan
        yapılacak.
      </p>
    </div>
  );
}
