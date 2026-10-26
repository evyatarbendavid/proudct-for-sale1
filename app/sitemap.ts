import type { MetadataRoute } from "next";
import { isLive, site } from "@/lib/config";

// ריק עד שיש דומיין והאתר במצב מכירה
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isLive || !site.url) return [];
  return ["", "/terms", "/cancel", "/privacy", "/accessibility"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path ? "yearly" : "weekly",
    priority: path ? 0.3 : 1,
  }));
}
