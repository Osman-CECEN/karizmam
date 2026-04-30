import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { SafeImage } from "@/components/SafeImage";
import {
  getBlogPostBySlug,
  getPublishedBlogSlugs,
} from "@/lib/blog/getPublicBlogPosts";
import { site } from "@/lib/site";
import { getSiteOrigin } from "@/lib/site/origin";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Yazı bulunamadı", robots: { index: false, follow: false } };
  }

  const origin = getSiteOrigin();
  const path = `/blog/${post.slug}`;
  const description =
    post.excerpt?.trim() ||
    `${post.title} — ${site.name}, ${site.city} sürücü kursu blog yazısı.`;

  const ogImages = post.cover_image_url?.trim()
    ? [{ url: post.cover_image_url.trim(), alt: `${post.title} kapak görseli` }]
    : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `${origin}${path}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: ogImages,
    },
  };
}

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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const dateLabel = formatDate(post.published_at);
  const cover = post.cover_image_url?.trim() ?? "";
  const coverAlt = `${post.title} kapak görseli`;

  return (
    <main className="w-full min-h-0 flex-1">
      <article className="border-b border-gray-200 bg-surface shadow-sm">
        <div className="section-px mx-auto max-w-3xl py-10 md:py-12">
          <p className="text-sm font-medium text-gray-600">
            <Link
              href="/blog"
              className="font-semibold text-[#111111] underline underline-offset-2 hover:opacity-80"
            >
              Blog
            </Link>
            <span aria-hidden> · </span>
            {site.name}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl md:leading-tight">
            {post.title}
          </h1>
          {dateLabel && post.published_at ? (
            <p className="mt-3 text-sm text-gray-500">
              <time dateTime={post.published_at}>{dateLabel}</time>
            </p>
          ) : null}
        </div>
      </article>

      {cover ? (
        <div className="section-px mx-auto max-w-3xl pt-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <SafeImage
              src={cover}
              alt={coverAlt}
              priority
              sizes="(max-width: 768px) 100vw, 42rem"
              wrapperClassName="aspect-[16/9] w-full"
            />
          </div>
        </div>
      ) : null}

      <div className="section-px section-y mx-auto max-w-3xl">
        <BlogPostBody text={post.content} />

        <section
          className="mt-12 border-t border-gray-200 pt-10"
          aria-labelledby="blog-post-cta"
        >
          <h2
            id="blog-post-cta"
            className="text-lg font-extrabold text-[#111111]"
          >
            Soru ve kayıt
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Bu yazı genel bilgilendirme amaçlıdır. Kişisel durumunuz için{" "}
            <Link
              href="/iletisim"
              className="font-semibold text-[#111111] underline underline-offset-2"
            >
              iletişim
            </Link>{" "}
            üzerinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}
