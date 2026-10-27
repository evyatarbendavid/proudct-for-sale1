// מצלם את תמונות הגלריה של כל מוצר, בכל צבע, משלוש זוויות, לתוך public/renders/<slug>/<color>-<angle>.webp
// הרצה: npm run build && npx next start -p 3200, ובטרמינל אחר: node scripts/render-products.mjs http://localhost:3200 [--concurrency 2]
// צריך להריץ מחדש כשמוסיפים מוצר או צבע לקטלוג (lib/catalog.ts).

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

// Playwright מותקן גלובלית ולא בפרויקט, ו-import של ESM לא קורא את NODE_PATH
const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3200";
// --concurrency N: כמה דפים מצלמים במקביל (ברירת מחדל 2)
const ci = process.argv.indexOf("--concurrency");
const concurrency = ci > 0 ? Number(process.argv[ci + 1]) : 2;
const out = path.resolve("public/renders");

// השמות כאן הם גם שמות הקבצים, והגלריה משתמשת בהם (app/components/shop/images.ts).
// back: מבט מאחור בשלושה רבעים, שמראה את הסוגר של הרצועה
const ANGLES = { front: -0.35, side: -1.4, back: 2.5 };

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
// פי 2, כדי שהתמונות יהיו חדות במסכי רטינה (1280 פיקסלים)
const newPage = () => browser.newPage({ viewport: { width: 640, height: 640 }, deviceScaleFactor: 2 });
const first = await newPage();
await first.goto(`${base}/render`, { waitUntil: "networkidle" });
const catalog = JSON.parse(await first.locator("#catalog").textContent());
await first.close();

const jobs = [];
for (const p of catalog) {
  mkdirSync(path.join(out, p.slug), { recursive: true });
  for (const c of p.colors) for (const [name, angle] of Object.entries(ANGLES)) jobs.push({ slug: p.slug, color: c.id, name, angle });
}

let done = 0;
async function worker() {
  const page = await newPage();
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    await page.goto(`${base}/render?slug=${job.slug}&color=${job.color}&angle=${job.angle}`, { waitUntil: "load" });
    await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 });
    const png = path.join(out, job.slug, `${job.color}-${job.name}.png`);
    await page.locator("#stage").screenshot({ path: png, omitBackground: true });
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", "82", png.replace(/\.png$/, ".webp")]);
    // גרסה קטנה של התמונה מלפנים, לכרטיסים ולבחירת הצבע (app/components/shop/images.ts)
    if (job.name === "front") {
      const thumb = path.join(out, job.slug, `${job.color}-thumb.webp`);
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=480:-1", "-c:v", "libwebp", "-quality", "80", thumb]);
    }
    rmSync(png);
    if (++done % 15 === 0) console.log(`${done} תמונות`);
  }
  await page.close();
}
await Promise.all(Array.from({ length: concurrency }, worker));
await browser.close();
console.log(`${done} תמונות ב-${out}`);
