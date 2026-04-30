import type { Metadata } from "next";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { getPublicBlogPostsList } from "@/lib/blog/getPublicBlogPosts";
import { site } from "@/lib/site";
import { getSiteOrigin } from "@/lib/site/origin";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Blog",
  description: `${site.name} — ${site.city} sürücü kursu duyuruları, ehliyet süreci ve eğitim notları.`,
  alternates: { canonical: `${getSiteOrigin()}/blog` },
  openGraph: {
    title: `Blog | ${site.name}`,
    description: `${site.city} sürücü kursu haber ve bilgilendirme yazıları.`,
  },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublicBlogPostsList();

  return (
    <main className="w-full min-h-0 flex-1">
      <div className="border-b border-gray-200 bg-surface shadow-sm">
        <div className="section-px mx-auto max-w-3xl py-10 md:py-12">
          <p className="text-sm font-semibold text-gray-600">{site.name}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Blog
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Ehliyet süreci, duyurular ve eğitimle ilgili güncel yazılar.
          </p>
        </div>
      </div>

      <div className="section-px section-y mx-auto max-w-3xl">
        {posts.length === 0 ? (
          <p className="text-base text-gray-600">
            Henüz yayınlanmış yazı bulunmuyor. Güncel bilgi için{" "}
            <Link
              href="/iletisim"
              className="font-semibold text-[#111111] underline underline-offset-2"
            >
              iletişim
            </Link>{" "}
            sayfasını kullanabilirsiniz.
          </p>
        ) : (
          <ul className="space-y-10" role="list">
            {posts.map((post) => {
              const dateLabel = formatDate(post.published_at);
              const cover = post.cover_image_url?.trim() ?? "";
              const desc =
                post.excerpt?.trim() ||
                "Ehliyet ve sürücü eğitimi hakkında bilgilendirme yazısı.";
              const imgAlt = `${post.title} kapak görseli`;

              return (
                <li key={post.id}>
                  <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {cover ? (
                      <Link href={`/blog/${post.slug}`} className="block">
                        <SafeImage
                          src={cover}
                          alt={imgAlt}
                          sizes="(max-width: 768px) 100vw, 42rem"
                          wrapperClassName="aspect-[16/9] w-full"
                        />
                      </Link>
                    ) : null}
                    <div className="p-5 sm:p-6">
                      {dateLabel ? (
                        <p className="text-sm text-gray-500">
                          <time dateTime={post.published_at ?? undefined}>
                            {dateLabel}
                          </time>
                        </p>
                      ) : null}
                      <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#111111] sm:text-2xl">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                        {desc}
                      </p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-4 inline-flex text-sm font-bold text-[#111111] underline underline-offset-2"
                      >
                        Yazıyı oku
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
