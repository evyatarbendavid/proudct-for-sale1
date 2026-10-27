// מצלם את תמונות הגלריה של כל מוצר, בכל צבע, משלוש זוויות, לתוך public/renders/<slug>/<color>-<angle>.webp
// הרצה: npm run build && npx next start -p 3200, ובטרמינל אחר: node scripts/render-products.mjs http://localhost:3200
// צריך להריץ מחדש כשמוסיפים מוצר או צבע לקטלוג (lib/catalog.ts).

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

// Playwright מותקן גלובלית ולא בפרויקט, ו-import של ESM לא קורא את NODE_PATH
const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3200";
const out = path.resolve("public/renders");

// השמות כאן הם גם שמות הקבצים, והגלריה משתמשת בהם (app/components/shop/images.ts)
const ANGLES = { front: -0.35, side: -1.4, back: 0.9 };

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 640, height: 640 }, deviceScaleFactor: 1 });
await page.goto(`${base}/render`, { waitUntil: "networkidle" });
const catalog = JSON.parse(await page.locator("#catalog").textContent());

let count = 0;
for (const p of catalog) {
  mkdirSync(path.join(out, p.slug), { recursive: true });
  for (const c of p.colors) {
    for (const [name, angle] of Object.entries(ANGLES)) {
      await page.goto(`${base}/render?slug=${p.slug}&color=${c.id}&angle=${angle}`, { waitUntil: "networkidle" });
      await page.locator('[data-ready="true"]').waitFor({ timeout: 30000 });
      await page.waitForTimeout(250);
      const png = path.join(out, p.slug, `${c.id}-${name}.png`);
      await page.locator("#stage").screenshot({ path: png, omitBackground: true });
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", "82", png.replace(/\.png$/, ".webp")]);
      rmSync(png);
      count++;
    }
  }
  console.log(`${p.slug}: ${p.colors.length} צבעים`);
}
await browser.close();
console.log(`${count} תמונות ב-${out}`);
