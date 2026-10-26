"use client";

import { useEffect, useState, type ReactNode } from "react";
import { bandTypes, bundles, colors, delivery, type BandType } from "@/lib/config";
import { Bezel } from "./Bezel";
import { OrderForm } from "./OrderForm";
import { colorById, useOrderState } from "./orderState";
import { StrapSwatch } from "./StrapSwatch";
import { Watch3D } from "./Watch3D";

const single = bundles[0];
const pair = bundles.find((b) => b.qty === 2);

export function Storefront({ children }: { children?: ReactNode }) {
  const order = useOrderState();
  const heroColor = colorById(order.bandColors[0]);
  const showBar = useMobileBar();

  return (
    <>
      <section id="hero" className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:pt-10 md:pb-16">
        <div className="grid gap-x-10 [grid-template-areas:'head'_'stage'_'controls'] md:grid-cols-[1.05fr_1fr] md:[grid-template-areas:'head_stage'_'controls_stage']">
          <div className="[grid-area:head] md:self-end">
            {/* avoid-ai-design-ignore: SD5 — השורה הכתומה היא צבע המותג, וחוזרת גם בסרטון */}
            <h1>
              <span className="rise block text-base font-semibold text-graphite">
                רצועות לשעון חכם, בגדלים 38 עד 49 מ״מ
              </span>
              <span className="mt-2 block font-display text-[clamp(5.2rem,21vw,11rem)] leading-[0.8] font-bold">
                <span className="rise block">צבע חדש</span>
                <span className="rise block text-[#e2470f] [animation-delay:120ms]">לשעון שלך</span>
              </span>
            </h1>
            <p className="rise mt-5 max-w-md text-lg text-graphite [animation-delay:240ms]">
              רצועות סיליקון ומגנטיות. נכנסות לשעון ויוצאות ממנו בלחיצה, בלי כלים.
            </p>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[560px] [grid-area:stage] md:self-center">
            <Bezel className="absolute inset-[6%] h-[88%] w-[88%]" />
            {/* גל בצבע שנבחר, בכל החלפת צבע */}
            <span
              key={heroColor.id}
              aria-hidden
              className="pulse-ring pointer-events-none absolute inset-[6%] rounded-full border-[6px]"
              style={{ borderColor: heroColor.hex }}
            />
            <Watch3D
              color={heroColor.hex}
              type={order.type}
              className="absolute inset-0"
            />
            <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-xs text-graphite">
              גררו כדי לסובב
            </p>
          </div>

          <div className="mt-2 [grid-area:controls] md:mt-8 md:self-start">
            <div
              role="radiogroup"
              aria-label="סוג רצועה"
              className="inline-flex rounded-full border border-line bg-paper p-1"
            >
              {(Object.keys(bandTypes) as BandType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={order.type === t}
                  onClick={() => order.setType(t)}
                  className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors ${
                    order.type === t ? "bg-ink text-paper" : "text-graphite hover:text-ink"
                  }`}
                >
                  {bandTypes[t].short}
                </button>
              ))}
            </div>

            <fieldset className="mt-5">
              <legend className="font-mono text-xs text-graphite">
                נסו צבע: <span className="text-ink">{heroColor.name}</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                {colors.map((c) => {
                  const selected = order.bandColors[0] === c.id;
                  return (
                    <label key={c.id} className="group cursor-pointer p-1" title={c.name}>
                      <input
                        type="radio"
                        name="hero-color"
                        checked={selected}
                        onChange={() => {
                          order.setColor(c.id, 0);
                          order.setActiveBand(0);
                        }}
                        className="peer sr-only"
                        aria-label={c.name}
                      />
                      <span className="block rounded-full peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                        <StrapSwatch hex={c.hex} selected={selected} />
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="#step-size"
                className="inline-flex min-h-13 items-center rounded-full bg-signal px-7 text-lg font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_var(--signal)]"
              >
                לבחירת מידה
              </a>
              <p className="flex gap-4 text-sm text-graphite">
                <span>
                  <span className="font-mono text-ink">₪{single.price}</span> לרצועה
                </span>
                {pair && (
                  <span>
                    <span className="font-mono text-ink">₪{pair.price}</span> לזוג
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SpecStrip />
      {children}
      <OrderForm order={order} />
      <MobileBar order={order} visible={showBar} />
    </>
  );
}

function SpecStrip() {
  const items = [
    "38–49 מ״מ",
    `${colors.length} צבעים`,
    "משלוח חינם",
    `${delivery.homeText}`,
    "ביטול עד 14 יום",
  ];
  return (
    <div className="bg-ink text-paper">
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-4 font-mono text-sm">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-6">
            {i > 0 && <span aria-hidden className="size-1.5 rounded-full bg-signal" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// במובייל: פס תחתון עם המחיר והכפתור, כשהפתיח והסיכום לא על המסך
function useMobileBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const summary = document.getElementById("summary");
    if (!hero || !summary) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setVisible(!seen.get(hero) && !seen.get(summary));
    });
    io.observe(hero);
    io.observe(summary);
    return () => io.disconnect();
  }, []);
  return visible;
}

function MobileBar({ order, visible }: { order: ReturnType<typeof useOrderState>; visible: boolean }) {
  const bundle = bundles.find((b) => b.qty === order.qty) ?? bundles[0];
  const chosen = order.bandColors.slice(0, order.qty).map(colorById);
  const needsSize = order.size === "";
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-20 bg-ink pb-[env(safe-area-inset-bottom)] text-paper shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.5)] transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex -space-x-1.5 space-x-reverse" aria-hidden>
          {chosen.map((c, i) => (
            <span key={i} className="size-5 rounded-full border-2 border-ink" style={{ background: c.hex }} />
          ))}
        </div>
        <div className="leading-tight">
          <span className="block text-xs text-paper/70">{bundle.label}</span>
          <span className="font-mono text-lg">₪{bundle.price}</span>
        </div>
        <a
          href={needsSize ? "#step-size" : "#summary"}
          tabIndex={visible ? 0 : -1}
          className="ms-auto inline-flex min-h-11 items-center rounded-full bg-signal px-5 font-semibold text-ink"
        >
          {needsSize ? "לבחירת מידה" : "לסיום"}
        </a>
      </div>
    </div>
  );
}
