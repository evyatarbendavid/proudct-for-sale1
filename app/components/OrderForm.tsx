"use client";

import Link from "next/link";
import {
  bandTypes,
  bundles,
  colors,
  contact,
  delivery,
  isLive,
  paymentLinks,
  type BandType,
} from "@/lib/config";
import { Bezel } from "./Bezel";
import { colorById, type OrderState } from "./orderState";
import { StrapSwatch } from "./StrapSwatch";
import { Watch3D } from "./Watch3D";

const option =
  "cursor-pointer rounded-md border-2 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const on = "border-ink bg-paper";
const off = "border-line bg-paper/60 hover:border-graphite";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6">
      <legend className="float-start mb-4 flex w-full items-baseline gap-3">
        <span className="font-mono text-sm text-graphite">{n}/5</span>
        <span className="text-lg font-semibold">{title}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function OrderForm({ order }: { order: OrderState }) {
  const { type, size, qty, bandColors, activeBand, method, agreed } = order;
  const bundle = bundles.find((b) => b.qty === qty) ?? bundles[0];
  const sizes = bandTypes[type].sizes;
  const chosen = bandColors.slice(0, qty).map(colorById);
  const previewColor = colorById(bandColors[Math.min(activeBand, qty - 1)]);
  // בטרום השקה אין עסקה, ולכן אין צורך באישור תקנון
  const ready = size !== "" && (agreed || !isLive);

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
    <section id="order" aria-labelledby="order-title" className="scroll-mt-4 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h2 id="order-title" className="reveal font-display text-[clamp(3.5rem,10vw,6rem)] leading-[0.85] font-bold">
          {isLive ? "ההזמנה שלך" : "הרצועה שלך"}
        </h2>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_minmax(280px,420px)]">
          <div className="space-y-8">
            <Step n={1} title="סוג">
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(bandTypes) as BandType[]).map((t) => (
                  <label key={t} className={`${option} p-4 ${type === t ? on : off}`}>
                    <input
                      type="radio"
                      name="type"
                      checked={type === t}
                      onChange={() => order.setType(t)}
                      className="sr-only"
                    />
                    <span className="block font-semibold">{bandTypes[t].name}</span>
                    <span className="mt-1 block text-sm text-graphite">{bandTypes[t].description}</span>
                  </label>
                ))}
              </div>
            </Step>

            <Step n={2} title="מידת השעון">
              <p className="-mt-2 mb-3 text-sm text-graphite">
                המידה כתובה על גב השעון.{" "}
                <a href="#faq-size" className="underline underline-offset-4">
                  איך בודקים
                </a>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <label
                    key={s}
                    className={`${option} !rounded-full px-5 py-2.5 font-mono text-sm ${
                      size === s ? "border-ink bg-ink text-paper" : off
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      checked={size === s}
                      onChange={() => order.setSize(s)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </Step>

            <Step n={3} title="כמה רצועות">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {bundles.map((b) => (
                  <label
                    key={b.qty}
                    className={`${option} relative px-2 py-4 text-center ${qty === b.qty ? on : off}`}
                  >
                    <input
                      type="radio"
                      name="qty"
                      checked={qty === b.qty}
                      onChange={() => order.setQty(b.qty)}
                      className="sr-only"
                    />
                    {"badge" in b && (
                      <span className="absolute -top-3 right-1/2 translate-x-1/2 rounded-full bg-signal px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-ink">
                        {b.badge}
                      </span>
                    )}
                    <span className="block text-sm">{b.label}</span>
                    <span className="mt-1 block font-display text-4xl leading-none font-bold">
                      ₪{b.price}
                    </span>
                    {b.qty > 1 && (
                      <span className="mt-1 block font-mono text-xs text-graphite">
                        ₪{Math.round(b.price / b.qty)} לרצועה
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </Step>

            <Step n={4} title="צבע">
              {qty > 1 && (
                <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="בחירת רצועה">
                  {Array.from({ length: qty }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={activeBand === i}
                      onClick={() => order.setActiveBand(i)}
                      className={`flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm transition-colors ${
                        activeBand === i ? "border-ink" : "border-line hover:border-graphite"
                      }`}
                    >
                      <span
                        className="size-3.5 rounded-full border border-black/10"
                        style={{ background: colorById(bandColors[i]).hex }}
                      />
                      רצועה {i + 1}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {colors.map((c) => {
                  const selected = bandColors[activeBand] === c.id;
                  return (
                    <label key={c.id} className="group flex w-16 cursor-pointer flex-col items-center gap-1 py-1">
                      <input
                        type="radio"
                        name={`color-${activeBand}`}
                        checked={selected}
                        onChange={() => order.setColor(c.id)}
                        className="peer sr-only"
                      />
                      <span className="rounded-full peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                        <StrapSwatch hex={c.hex} selected={selected} />
                      </span>
                      <span className={`text-xs ${selected ? "font-semibold" : "text-graphite"}`}>{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </Step>

            <Step n={5} title="איך לקבל">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`${option} p-4 ${method === "home" ? on : off}`}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={method === "home"}
                    onChange={() => order.setMethod("home")}
                    className="sr-only"
                  />
                  <span className="block font-semibold">משלוח עד הבית, חינם</span>
                  <span className="mt-1 block text-sm text-graphite">{delivery.homeText}</span>
                </label>
                {delivery.personal.enabled && (
                  <label className={`${option} p-4 ${method === "personal" ? on : off}`}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={method === "personal"}
                      onChange={() => order.setMethod("personal")}
                      className="sr-only"
                    />
                    <span className="block font-semibold">מסירה אישית, חינם</span>
                    <span className="mt-1 block text-sm text-graphite">
                      באזור {delivery.personal.area}, בתיאום בוואטסאפ
                    </span>
                  </label>
                )}
              </div>
            </Step>
          </div>

          {/* תצוגה וסיכום. בדסקטופ נשאר במקום בזמן הגלילה */}
          <aside className="order-first md:order-none">
            <div className="md:sticky md:top-6">
              <div className="relative mx-auto aspect-square w-full max-w-[360px] md:max-w-none">
                <Bezel className="absolute inset-[6%] h-[88%] w-[88%]" />
                <Watch3D color={previewColor.hex} type={type} className="absolute inset-0" />
              </div>

              <div className="mt-4 rounded-md border border-line bg-steel/60 p-5">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-graphite">{bandTypes[type].name}</dt>
                    <dd className="font-mono">{size || "מידה?"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-graphite">צבעים</dt>
                    <dd className="flex gap-1">
                      {chosen.map((c, i) => (
                        <span
                          key={i}
                          title={c.name}
                          className="size-4 rounded-full border border-black/10"
                          style={{ background: c.hex }}
                        />
                      ))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-graphite">משלוח</dt>
                    <dd>חינם</dd>
                  </div>
                  <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
                    <dt className="font-semibold">{isLive ? "סה״כ לתשלום" : "מחיר השקה"}</dt>
                    <dd className="font-display text-5xl leading-none font-bold">₪{bundle.price}</dd>
                  </div>
                </dl>

                {isLive && (
                  <label className="mt-5 flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => order.setAgreed(e.target.checked)}
                      className="mt-1 size-4 accent-[var(--ink)]"
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
                  <p className="mt-4 text-sm text-graphite" aria-live="polite">
                    {size === "" ? "נשאר לבחור מידה." : "נשאר לאשר את התקנון."}
                  </p>
                )}

                <div className="mt-4 grid gap-3">
                  {whatsappHref ? (
                    <a
                      href={ready ? whatsappHref : undefined}
                      aria-disabled={!ready}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex min-h-13 items-center justify-center rounded-full px-6 text-lg font-semibold transition ${
                        ready
                          ? "bg-signal text-ink hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_var(--signal)]"
                          : "pointer-events-none bg-line text-graphite"
                      }`}
                    >
                      {isLive ? "להזמנה בוואטסאפ" : "תעדכנו אותי בהשקה"}
                    </a>
                  ) : (
                    <span className="flex min-h-13 items-center justify-center rounded-full bg-line px-6 font-semibold text-graphite">
                      וואטסאפ יחובר בקרוב
                    </span>
                  )}
                  {paymentHref && (
                    <a
                      href={ready ? paymentHref : undefined}
                      aria-disabled={!ready}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex min-h-13 items-center justify-center rounded-full border-2 px-6 font-semibold transition ${
                        ready ? "border-ink hover:bg-ink hover:text-paper" : "pointer-events-none border-line text-graphite"
                      }`}
                    >
                      תשלום מאובטח באשראי
                    </a>
                  )}
                </div>
                <p className="mt-3 text-xs text-graphite">
                  {isLive
                    ? "אחרי שליחת ההזמנה בוואטסאפ נאשר את הפרטים ונשלח קישור לתשלום מאובטח באשראי. ההזמנה יוצאת לדרך רק אחרי התשלום."
                    : "זו לא הזמנה ואין תשלום. נשלח לך הודעה כשהרצועות זמינות, ותחליט/י אז אם להזמין."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
