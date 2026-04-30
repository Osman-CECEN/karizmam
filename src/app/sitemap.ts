import type { MetadataRoute } from "next";
import { getPublishedBlogSlugs } from "@/lib/blog/getPublicBlogPosts";
import { getSiteOrigin } from "@/lib/site/origin";

const staticPaths = [
  "/",
  "/b-sinifi-ehliyet",
  "/motosiklet-ehliyeti",
  "/direksiyon-dersi",
  "/iletisim",
  "/blog",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const now = new Date();
  const blogSlugs = await getPublishedBlogSlugs();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${origin}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
