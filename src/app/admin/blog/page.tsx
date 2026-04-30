import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

export default function AdminBlogPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111111]">Blog</h1>
      <p className="mt-3 text-neutral-600">
        Bu modül yakında eklenecek. Yazılar ve duyurular buradan
        yayınlanacak.
      </p>
    </div>
  );
}
