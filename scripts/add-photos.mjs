// מוסיף תמונות אמיתיות למוצר: מסובב לפי המצלמה, מקטין ל-1600 פיקסלים לכל היותר, שומר כ-webp
// ומוחק את המידע שבקובץ (כולל מיקום GPS מטלפון). התוצאה ב-public/photos/<slug>/<color>-<n>.webp
//
// הרצה: node scripts/add-photos.mjs <slug> <color|all> <קבצים...>
// למשל:  node scripts/add-photos.mjs apple-silicone-sport navy ~/Downloads/IMG_1201.jpg ~/Downloads/IMG_1202.jpg
// all = תמונה שמתאימה לכל הצבעים (אריזה, קרוב על הסוגר וכו').
// אחרי ההוספה: npm run build. הגלריה והכרטיס בקטלוג מציגים את התמונות לפני ההדמיות.
// קבצי HEIC מאייפון לא נתמכים: מייצאים כ-JPG (או מגדירים במצלמה "התאמה מרבית").

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const sharp = createRequire(import.meta.url)("sharp");

const [slug, color, ...files] = process.argv.slice(2);
if (!slug || !color || !files.length) {
  console.error("שימוש: node scripts/add-photos.mjs <slug> <color|all> <קבצים...>");
  process.exit(1);
}

// המוצרים והצבעים הקיימים: לפי ההדמיות שכבר צולמו לכל מוצר וצבע
const renders = path.resolve("public/renders", slug);
if (!existsSync(renders)) {
  console.error(`אין מוצר בשם ${slug}. המוצרים: ${readdirSync(path.resolve("public/renders")).join(", ")}`);
  process.exit(1);
}
const colors = readdirSync(renders)
  .filter((f) => f.endsWith("-front.webp"))
  .map((f) => f.replace("-front.webp", ""));
if (color !== "all" && !colors.includes(color)) {
  console.error(`אין צבע ${color} במוצר הזה. הצבעים: ${colors.join(", ")}, או all`);
  process.exit(1);
}

const out = path.resolve("public/photos", slug);
mkdirSync(out, { recursive: true });
const taken = readdirSync(out)
  .map((f) => new RegExp(`^${color}-(\\d+)\\.`).exec(f))
  .filter(Boolean)
  .map((m) => Number(m[1]));
let n = taken.length ? Math.max(...taken) : 0;

for (const file of files) {
  n++;
  const target = path.join(out, `${color}-${n}.webp`);
  await sharp(file)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(target);
  console.log(`${file} -> ${path.relative(process.cwd(), target)}`);
}
