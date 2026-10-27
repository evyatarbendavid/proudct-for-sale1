import type { ColorId } from "@/lib/catalog";

// תמונות הגלריה נוצרות בסקריפט scripts/render-products.mjs. השמות שם ופה חייבים להתאים
export const ANGLES = ["front", "side", "back"] as const;
export type Angle = (typeof ANGLES)[number];

export function renderSrc(slug: string, color: ColorId, angle: Angle = "front") {
  return `/renders/${slug}/${color}-${angle}.webp`;
}
