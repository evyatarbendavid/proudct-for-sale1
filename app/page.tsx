import type { Metadata } from "next";
import { Suspense } from "react";
import { colorById, products } from "@/lib/catalog";
import { delivery } from "@/lib/config";
import { coverFor } from "@/lib/photos";
import { priceFor } from "@/lib/pricing";
import { canonical } from "@/lib/seo";
import { CatalogGrid, CatalogGridStatic } from "./components/shop/CatalogGrid";
import { renderSrc } from "./components/shop/images";
import { DraftBanner, SiteFooter, SiteHeader } from "./components/SiteChrome";
import { Watch3D } from "./components/Watch3D";

export const metadata: Metadata = {
  ...canonical("/"),
};

const minPrice = Math.min(...products.map((p) => priceFor(p.cost)));
const covers = Object.fromEntries(products.map((p) => [p.slug, coverFor(p)]));

// השעון בפתיחה: רצועת סיליקון ספורט בכחול כהה. ממנה גם התמונה שמוצגת עד שהתלת-ממד נטען
const HERO = { slug: "apple-silicone-sport", color: "navy" } as const;

const promises = [
  { title: "משלוח חינם", text: `עד הבית, ${delivery.homeText}` },
  { title: "תשלום רק אחרי אישור", text: "קודם מאשרים איתך מידה וצבע" },
  { title: "ביטול עד 14 יום", text: "לפי חוק הגנת הצרכן" },
];

export default function Home() {
  return (
    <>
      <DraftBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pt-3 pb-12 md:px-4">
        <section className="grid items-center gap-4 rounded-lg border border-line bg-paper p-4 md:grid-cols-[1fr_360px] md:p-8">
          <div>
            <h1 className="text-3xl leading-tight font-bold md:text-4xl">רצועות לשעון חכם, מ-₪{minPrice}</h1>
            <p className="mt-2 max-w-prose text-graphite">
              ל-Apple Watch, Samsung, Garmin, Huawei, Amazfit, וצמידי Xiaomi ו-Fitbit. סיליקון, ניילון, עור ומתכת.
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-3">
              {promises.map((p) => (
                <li key={p.title} className="rounded-md bg-stage px-3 py-2 text-sm">
                  <span className="block font-semibold">{p.title}</span>
                  <span className="text-graphite">{p.text}</span>
                </li>
              ))}
            </ul>
            <a href="#catalog" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-signal px-6 font-semibold text-ink hover:brightness-95">
              לכל הרצועות
            </a>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[360px] rounded-lg bg-stage">
            <Watch3D
              color={colorById(HERO.color).hex}
              caseKind="apple"
              material="silicone"
              poster={renderSrc(HERO.slug, HERO.color)}
              className="absolute inset-0"
            />
            <span className="absolute top-3 right-3 rounded bg-paper/90 px-2 py-0.5 text-xs text-graphite">תלת-ממד, גררו לסיבוב</span>
          </div>
        </section>

        <section id="catalog" aria-labelledby="catalog-title" className="mt-6 scroll-mt-4">
          <h2 id="catalog-title" className="mb-3 text-xl font-bold">כל הרצועות</h2>
          <Suspense fallback={<CatalogGridStatic covers={covers} />}>
            <CatalogGrid covers={covers} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
