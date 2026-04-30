import { createAnonSupabaseClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BlogPostRow } from "@/types/database";

const select =
  "id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at";

/** Listing fields only (lighter payload for index page). */
export type BlogPostListRow = Pick<
  BlogPostRow,
  "id" | "title" | "slug" | "excerpt" | "cover_image_url" | "published_at"
>;

export async function getPublicBlogPostsList(): Promise<BlogPostListRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAnonSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) return [];
  return (data ?? []) as BlogPostListRow[];
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAnonSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");

  if (error) return [];
  return (data ?? []).map((r) => (r as { slug: string }).slug).filter(Boolean);
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAnonSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select(select)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as BlogPostRow;
}
