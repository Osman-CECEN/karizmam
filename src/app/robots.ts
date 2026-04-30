import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site/origin";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/panel",
        "/login",
        "/student",
        "/member",
        "/office",
        "/instructor",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
