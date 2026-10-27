import type { ColorId } from "@/lib/catalog";

// תמונות הגלריה נוצרות בסקריפט scripts/render-products.mjs. השמות שם ופה חייבים להתאים
export const ANGLES = ["front", "side", "back"] as const;
export type Angle = (typeof ANGLES)[number];

/** תמונה מלאה, 1280 פיקסלים */
export function renderSrc(slug: string, color: ColorId, angle: Angle = "front") {
  return `/renders/${slug}/${color}-${angle}.webp`;
}

/** גרסה קטנה (480 פיקסלים) של התמונה מלפנים, לכרטיסים בקטלוג ולבחירת הצבע */
export function thumbSrc(slug: string, color: ColorId) {
  return `/renders/${slug}/${color}-thumb.webp`;
}
