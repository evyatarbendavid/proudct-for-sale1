"use client";

import Link from "next/link";
import { useState } from "react";
import {
  bandTypes,
  bundles,
  colors,
  contact,
  defaultQty,
  delivery,
  isLive,
  paymentLinks,
  type BandType,
  type ColorId,
} from "@/lib/config";
import { BandPreview } from "./BandPreview";

type DeliveryMethod = "home" | "personal";

const defaultColors: ColorId[] = ["black", "navy", "olive"];

function colorById(id: ColorId) {
  return colors.find((c) => c.id === id) ?? colors[0];
}

export function OrderForm() {
  const [type, setType] = useState<BandType>("silicone");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState<number>(defaultQty);
  const [bandColors, setBandColors] = useState<ColorId[]>(defaultColors);
  const [activeBand, setActiveBand] = useState(0);
  const [method, setMethod] = useState<DeliveryMethod>("home");
  const [agreed, setAgreed] = useState(false);

  const bundle = bundles.find((b) => b.qty === qty) ?? bundles[0];
  const sizes = bandTypes[type].sizes;
  const chosen = bandColors.slice(0, qty).map(colorById);
  const previewColor = colorById(bandColors[Math.min(activeBand, qty - 1)]);
  // בטרום השקה אין עסקה, ולכן אין צורך באישור תקנון
  const ready = size !== "" && (agreed || !isLive);

  function chooseType(next: BandType) {
    setType(next);
    if (!bandTypes[next].sizes.includes(size)) setSize("");
  }

  function chooseQty(next: number) {
    setQty(next);
    if (activeBand >= next) setActiveBand(next - 1);
  }

  function chooseColor(id: ColorId) {
    setBandColors((prev) => prev.map((c, i) => (i === activeBand ? id : c)));
  }

  const message = [
    isLive
      ? "שלום, אני רוצה להזמין:"
      : "שלום, אשמח לקבל עדכון כשהרצועות זמינות. מה שמעניין אותי:",
    `${bundle.label} – ${bandTypes[type].name}`,
    `מידה: ${size || "לא נבחרה"}`,
    `צבעים: ${chosen.map((c) => c.name).join(", ")}`,
    `${isLive ? "סה״כ" : "מחיר השקה"}: ₪${bundle.price}`,
    method === "home"
      ? `משלוח עד הבית${isLive ? " (אשלח כתובת)" : ""}`
      : `מסירה אישית באזור ${delivery.personal.area}`,
  ].join("\n");

  const whatsappHref = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`
    : "";
  const paymentHref = isLive ? (paymentLinks[qty] ?? "") : "";

  return (
    <section
      id="order"
      aria-labelledby="order-title"
      className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-8"
    >
      <h2 id="order-title" className="text-2xl font-bold">
        {isLive ? "בניית ההזמנה" : "בחירת הרצועה שלך"}
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_220px]">
        <div className="space-y-7">
          {/* סוג */}
          <fieldset>
            <legend className="mb-3 font-semibold">1. סוג רצועה</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(bandTypes) as BandType[]).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-2xl border-2 has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-2 p-4 transition ${
                    type === t
                      ? "border-accent bg-accent-soft"
                      : "border-line hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => chooseType(t)}
                    className="sr-only"
                  />
                  <span className="block font-semibold">{bandTypes[t].name}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {bandTypes[t].description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* מידה */}
          <fieldset>
            <legend className="mb-1 font-semibold">2. מידת השעון</legend>
            <p className="mb-3 text-sm text-muted">
              המידה כתובה על גב השעון.{" "}
              <a href="#faq-size" className="underline">
                איך בודקים?
              </a>
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer rounded-full border-2 has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-2 px-4 py-2 text-sm font-medium transition ${
                    size === s
                      ? "border-accent bg-accent text-white"
                      : "border-line hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    onChange={() => setSize(s)}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          {/* כמות */}
          <fieldset>
            <legend className="mb-3 font-semibold">3. כמה רצועות</legend>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {bundles.map((b) => (
                <label
                  key={b.qty}
                  className={`relative cursor-pointer rounded-2xl border-2 has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-2 p-3 text-center transition sm:p-4 ${
                    qty === b.qty
                      ? "border-accent bg-accent-soft"
                      : "border-line hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="qty"
                    value={b.qty}
                    checked={qty === b.qty}
                    onChange={() => chooseQty(b.qty)}
                    className="sr-only"
                  />
                  {"badge" in b && (
                    <span className="absolute -top-2.5 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                      {b.badge}
                    </span>
                  )}
                  <span className="block text-sm">{b.label}</span>
                  <span className="mt-1 block text-xl font-bold">₪{b.price}</span>
                  {b.qty > 1 && (
                    <span className="block text-xs text-muted">
                      ₪{Math.round(b.price / b.qty)} לרצועה
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          {/* צבעים */}
          <fieldset>
            <legend className="mb-3 font-semibold">4. צבע</legend>
            {qty > 1 && (
              <div className="mb-3 flex gap-2" role="tablist" aria-label="בחירת רצועה">
                {Array.from({ length: qty }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={activeBand === i}
                    onClick={() => setActiveBand(i)}
                    className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm transition ${
                      activeBand === i ? "border-accent" : "border-line"
                    }`}
                  >
                    <span
                      className="size-4 rounded-full border border-black/10"
                      style={{ background: colorById(bandColors[i]).hex }}
                    />
                    רצועה {i + 1}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => {
                const selected = bandColors[activeBand] === c.id;
                return (
                  <label key={c.id} className="flex cursor-pointer flex-col items-center gap-1">
                    <input
                      type="radio"
                      name={`color-${activeBand}`}
                      value={c.id}
                      checked={selected}
                      onChange={() => chooseColor(c.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={`size-10 rounded-full border border-black/10 ring-offset-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                        selected ? "ring-2 ring-accent" : ""
                      }`}
                      style={{ background: c.hex }}
                    />
                    <span className={`text-xs ${selected ? "font-semibold" : "text-muted"}`}>
                      {c.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* משלוח */}
          <fieldset>
            <legend className="mb-3 font-semibold">5. איך לקבל</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-2xl border-2 has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-2 p-4 transition ${
                  method === "home" ? "border-accent bg-accent-soft" : "border-line"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={method === "home"}
                  onChange={() => setMethod("home")}
                  className="sr-only"
                />
                <span className="block font-semibold">משלוח עד הבית, חינם</span>
                <span className="mt-1 block text-sm text-muted">
                  זמן אספקה: {delivery.homeText}
                </span>
              </label>
              {delivery.personal.enabled && (
                <label
                  className={`cursor-pointer rounded-2xl border-2 has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-2 p-4 transition ${
                    method === "personal" ? "border-accent bg-accent-soft" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={method === "personal"}
                    onChange={() => setMethod("personal")}
                    className="sr-only"
                  />
                  <span className="block font-semibold">מסירה אישית, חינם</span>
                  <span className="mt-1 block text-sm text-muted">
                    באזור {delivery.personal.area}, בתיאום בוואטסאפ
                  </span>
                </label>
              )}
            </div>
          </fieldset>
        </div>

        {/* תצוגה וסיכום */}
        <aside className="order-first rounded-2xl bg-background p-4 lg:order-none">
          <BandPreview
            hex={previewColor.hex}
            type={type}
            className="mx-auto h-48 w-auto lg:h-64"
          />
          <p className="mt-2 text-center text-xs text-muted">הדמיה. תמונות אמיתיות בקרוב</p>
        </aside>
      </div>

      {/* סיכום ופעולה */}
      <div className="mt-8 border-t border-line pt-6">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{bundle.label}</dt>
            <dd>₪{bundle.price}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">משלוח</dt>
            <dd>חינם</dd>
          </div>
          <div className="flex justify-between pt-2 text-lg font-bold">
            <dt>{isLive ? "סה״כ לתשלום" : "מחיר השקה"}</dt>
            <dd>₪{bundle.price}</dd>
          </div>
        </dl>

        {isLive && (
          <label className="mt-5 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span>
              קראתי ואני מסכים/ה ל
              <Link href="/terms" className="underline">
                תקנון
              </Link>{" "}
              ול
              <Link href="/cancel" className="underline">
                תנאי ביטול העסקה
              </Link>
            </span>
          </label>
        )}

        {!ready && (
          <p className="mt-3 text-sm text-muted" aria-live="polite">
            {size === "" ? "נשאר לבחור מידה." : "נשאר לאשר את התקנון."}
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {whatsappHref ? (
            <a
              href={ready ? whatsappHref : undefined}
              aria-disabled={!ready}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-2xl px-5 py-4 text-center font-semibold text-white transition ${
                ready ? "bg-accent hover:bg-accent-strong" : "pointer-events-none bg-muted/50"
              }`}
            >
              {isLive ? "להזמנה בוואטסאפ" : "תעדכנו אותי בהשקה"}
            </a>
          ) : (
            <span className="rounded-2xl bg-muted/40 px-5 py-4 text-center font-semibold text-white">
              וואטסאפ יחובר בקרוב
            </span>
          )}
          {paymentHref && (
            <a
              href={ready ? paymentHref : undefined}
              aria-disabled={!ready}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-2xl border-2 px-5 py-4 text-center font-semibold transition ${
                ready
                  ? "border-accent text-accent hover:bg-accent-soft"
                  : "pointer-events-none border-line text-muted"
              }`}
            >
              תשלום מאובטח באשראי
            </a>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          {isLive
            ? "אחרי שליחת ההזמנה בוואטסאפ נאשר את הפרטים ונשלח קישור לתשלום מאובטח באשראי. ההזמנה יוצאת לדרך רק אחרי התשלום."
            : "זו לא הזמנה ואין תשלום. נשלח לך הודעה כשהרצועות זמינות, ותחליט/י אז אם להזמין."}
        </p>
      </div>
    </section>
  );
}
