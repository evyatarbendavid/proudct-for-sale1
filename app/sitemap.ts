import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
import { isLive, site } from "@/lib/config";

// ריק עד שיש דומיין והאתר במצב מכירה
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isLive || !site.url) return [];
  const pages = [
    { path: "", priority: 1 },
    ...products.map((p) => ({ path: `/p/${p.slug}`, priority: 0.8 })),
    ...["/terms", "/cancel", "/privacy", "/accessibility"].map((path) => ({ path, priority: 0.3 })),
  ];
  return pages.map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    changeFrequency: priority === 0.3 ? "yearly" : "weekly",
    priority,
  }));
}
