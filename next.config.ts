import type { NextConfig } from "next";

function supabaseStorageRemotePattern():
  | { protocol: "https"; hostname: string; pathname: string }
  | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  try {
    return {
      protocol: "https",
      hostname: new URL(raw).hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return undefined;
  }
}

const supabaseRemote = supabaseStorageRemotePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseRemote ? [supabaseRemote] : [],
  },
};

export default nextConfig;
