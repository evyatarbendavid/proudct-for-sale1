import { readdirSync } from "node:fs";
import path from "node:path";
import type { ColorId, Product } from "./catalog";

// תמונות אמיתיות של המוצר (מהדגימות, או של המוכר באישורו) נמצאות ב-public/photos/<slug>/.
// שם הקובץ: <צבע>-<מספר>.webp לתמונה של צבע מסוים, או all-<מספר>.webp לתמונה שמתאימה לכל הצבעים.
// מוסיפים אותן עם scripts/add-photos.mjs. הקבצים נקראים בזמן הבנייה, ואין צורך לשנות קוד.
// רק לקוד של השרת: קורא מהדיסק.

export type Photo = { src: string; color: ColorId | "all" };

const DIR = path.join(process.cwd(), "public", "photos");
const NAME = /^([a-z]+)-(\d+)\.(webp|jpe?g|png|avif)$/i;

export function photosFor(product: Product): Photo[] {
  let files: string[];
  try {
    files = readdirSync(path.join(DIR, product.slug));
  } catch {
    return [];
  }
  const known = new Set<string>([...product.colors, "all"]);
  return files
    .map((file) => ({ file, m: NAME.exec(file) }))
    .filter((x): x is { file: string; m: RegExpExecArray } => !!x.m && known.has(x.m[1].toLowerCase()))
    .sort((a, b) => a.m[1].localeCompare(b.m[1]) || Number(a.m[2]) - Number(b.m[2]))
    .map(({ file, m }) => ({ src: `/photos/${product.slug}/${file}`, color: m[1].toLowerCase() as Photo["color"] }));
}

/** התמונה לכרטיס בקטלוג: תמונה אמיתית של צבע ברירת המחדל, ואם אין, תמונה כללית */
export function coverFor(product: Product) {
  const photos = photosFor(product);
  return (photos.find((p) => p.color === product.colors[0]) ?? photos.find((p) => p.color === "all"))?.src;
}
