"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { familyOrder, families, products, type Family } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

// סינון לפי משפחה (?family=) וחיפוש (?q=), שניהם מהכתובת, כדי שקישור לקטגוריה יעבוד מכל מקום
export function CatalogGrid() {
  const params = useSearchParams();
  const family = params.get("family") as Family | null;
  const q = (params.get("q") ?? "").trim();
  const list = products.filter(
    (p) =>
      (!family || p.family === family) &&
      (!q || `${p.name} ${families[p.family].name}`.toLowerCase().includes(q.toLowerCase())),
  );

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-graphite"
    }`;

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <Link href="/#catalog" scroll={false} className={chip(!family)}>
          הכל
        </Link>
        {familyOrder.map((f) => (
          <Link key={f} href={`/?family=${f}#catalog`} scroll={false} className={chip(family === f)}>
            {families[f].short}
          </Link>
        ))}
      </div>
      {q && (
        <p className="mb-3 text-sm text-graphite">
          {list.length} תוצאות ל״{q}״.{" "}
          <Link href="/#catalog" className="underline">לכל הרצועות</Link>
        </p>
      )}
      {list.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-line bg-paper p-6 text-center">
          לא מצאנו רצועה כזאת. נסו מילה אחרת, או שלחו לנו בוואטסאפ את דגם השעון.
        </p>
      )}
    </>
  );
}

// גרסה בלי סינון, למצב לפני שהדפדפן קורא את הכתובת
export function CatalogGridStatic() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
