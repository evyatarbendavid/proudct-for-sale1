"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { caseKindOf, colorById } from "@/lib/catalog";
import { Watch3D } from "../Watch3D";
import { ANGLES, renderSrc, type Angle } from "./images";
import type { ProductOrder } from "./order";

type Item = { kind: "3d" } | { kind: "image"; angle: Angle };
const ITEMS: Item[] = [{ kind: "3d" }, ...ANGLES.map((angle) => ({ kind: "image" as const, angle }))];
const ANGLE_NAMES: Record<Angle, string> = { front: "מלפנים", side: "מהצד", back: "מאחור" };

function label(item: Item) {
  return item.kind === "3d" ? "תלת-ממד, אפשר לסובב" : `הדמיה ${ANGLE_NAMES[item.angle]}`;
}

export function Gallery({ order }: { order: ProductOrder }) {
  const { product, color } = order;
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const hex = colorById(color).hex;

  // לאן גוללים כרגע אחרי לחיצה. בזמן הגלילה לא מעדכנים, כדי שהסימון לא יקפוץ דרך התמונות שבדרך
  const target = useRef<number | null>(null);

  // במובייל: החלקה. מעדכנים את הנקודה לפי מה שבמרכז
  function onScroll() {
    const el = track.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (target.current !== null) {
      if (i !== target.current) return;
      target.current = null;
    }
    setActive(i);
  }

  // רצועה אחת לשני המצבים: במובייל מחליקים, בדסקטופ התמונות הממוזערות מזיזות אותה
  function show(i: number) {
    const el = track.current;
    setActive(i);
    if (!el || Math.round(Math.abs(el.scrollLeft) / el.clientWidth) === i) return;
    target.current = i;
    el.scrollTo({ left: -i * el.clientWidth, behavior: "smooth" });
  }

  const view = (item: Item, i: number) => (
    <div key={i} className="relative aspect-square w-full shrink-0 snap-center bg-stage md:rounded-lg">
      {item.kind === "3d" ? (
        <Watch3D color={hex} caseKind={caseKindOf(product)} material={product.material} className="absolute inset-0" />
      ) : (
        <Image
          src={renderSrc(product.slug, color, item.angle)}
          alt={`${product.name}, ${colorById(color).name}, ${label(item)}`}
          fill
          unoptimized
          priority={i === 1}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain p-4"
        />
      )}
      <span className="absolute top-3 right-3 rounded bg-paper/90 px-2 py-0.5 text-xs text-graphite">
        {item.kind === "3d" ? "תלת-ממד, גררו לסיבוב" : "הדמיה"}
      </span>
    </div>
  );

  return (
    <div className="md:flex md:gap-3">
      {/* תמונות ממוזערות בטור, בדסקטופ */}
      <div className="hidden w-16 shrink-0 flex-col gap-2 md:flex" role="tablist" aria-label="תמונות המוצר">
        {ITEMS.map((item, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={label(item)}
            onClick={() => show(i)}
            className={`relative aspect-square overflow-hidden rounded-md border-2 bg-stage ${
              active === i ? "border-ink" : "border-transparent hover:border-line"
            }`}
          >
            {item.kind === "3d" ? (
              <span className="grid h-full place-items-center text-xs font-semibold">3D</span>
            ) : (
              <Image src={renderSrc(product.slug, color, item.angle)} alt="" fill unoptimized sizes="64px" className="object-contain p-1" />
            )}
          </button>
        ))}
      </div>

      {/* המציג */}
      <div className="min-w-0 flex-1">
        <div
          ref={track}
          onScroll={onScroll}
          onScrollEnd={() => {
            // אם הגלילה נעצרה לפני היעד (למשל המשתמש החליק באמצע), חוזרים לעקוב אחרי המיקום
            target.current = null;
            onScroll();
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:overflow-hidden md:rounded-lg"
        >
          {ITEMS.map(view)}
        </div>
        <div className="mt-1 flex justify-center md:hidden">
          {ITEMS.map((item, i) => (
            <button key={i} type="button" onClick={() => show(i)} aria-label={label(item)} className="grid h-8 w-7 place-items-center">
              <span className={`h-1.5 rounded-full transition-all ${active === i ? "w-5 bg-ink" : "w-1.5 bg-graphite/40"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
