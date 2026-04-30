import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Üyeler",
  robots: { index: false, follow: false },
};

export default function AdminMembersPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111111]">Üyeler</h1>
      <p className="mt-3 text-neutral-600">
        Bu modül yakında eklenecek. Kayıtlı üyeler burada listelenecek.
      </p>
    </div>
  );
}
