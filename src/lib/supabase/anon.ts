import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Public veri okumaları için anon anahtarlı istemci (çerez yok).
 * `generateStaticParams`, sitemap ve ISR ile uyumludur.
 */
export function createAnonSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
