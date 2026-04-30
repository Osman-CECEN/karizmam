import type { Metadata } from "next";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { listGalleryAdmin } from "@/app/admin/gallery/actions";

export const metadata: Metadata = {
  title: "Galeri",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const result = await listGalleryAdmin();
  return (
    <GalleryManager
      initialRows={result.data ?? []}
      listError={result.ok ? null : (result.error ?? "Liste yüklenemedi.")}
    />
  );
}
