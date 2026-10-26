import type { MetadataRoute } from "next";
import { isLive, site } from "@/lib/config";

// בטרום השקה חוסמים הכל. במכירה פותחים ומפנים ל-sitemap
export default function robots(): MetadataRoute.Robots {
  if (!isLive) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(site.url ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}
