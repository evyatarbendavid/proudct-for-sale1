"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { colorById, families } from "@/lib/catalog";
import { delivery, isLive, paymentLink, site, warrantyText } from "@/lib/config";
import { pairPrice } from "@/lib/pricing";
import { thumbSrc } from "./images";
import { MAX_QTY, whatsappHref, type ProductOrder } from "./order";

const chip =
  "rounded-md border-2 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

export function BuyBox({ order }: { order: ProductOrder }) {
  const { product, color, size, qty, method, agreed, price, total, saving, ready } = order;
  const family = families[product.family];
  const guide = useRef<HTMLDialogElement>(null);
  const href = whatsappHref(order);
  const sizeDetail = product.sizes.find((s) => s.id === size)?.detail;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-graphite">מתאים ל: {family.name}</p>
        <h1 className="mt-1 text-2xl leading-tight font-bold md:text-[1.75rem]">{product.name}</h1>
        {!isLive && (
          <p className="mt-2 inline-block rounded bg-signal-soft px-2 py-0.5 text-sm">
            טרום השקה: עוד לא מוכרים. אפשר לבקש עדכון.
          </p>
        )}
      </div>

      {/* מחיר */}
      <div className="rounded-lg bg-signal-soft p-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-signal-deep">₪{price}</span>
          <span className="text-sm">לרצועה</span>
        </div>
        <p className="mt-1 text-sm">
          זוג ב-₪{pairPrice(price)}, חוסכים ₪{2 * price - pairPrice(price)}
        </p>
        <p className="mt-1 text-sm font-semibold text-ok">משלוח חינם עד הבית</p>
      </div>

      {/* צבע */}
      <fieldset>
        <legend className="mb-2 text-sm">
          צבע: <span className="font-semibold">{colorById(color).name}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((id) => (
            <label key={id} className={`${chip} relative size-14 cursor-pointer overflow-hidden bg-stage ${color === id ? "border-ink" : "border-line hover:border-graphite"}`} title={colorById(id).name}>
              <input type="radio" name="color" checked={color === id} onChange={() => order.setColor(id)} className="sr-only" aria-label={colorById(id).name} />
              <Image src={thumbSrc(product.slug, id)} alt="" fill unoptimized sizes="56px" className="object-contain p-0.5" />
            </label>
          ))}
        </div>
      </fieldset>

      {/* מידה */}
      <fieldset id="size">
        <legend className="mb-2 flex w-full items-baseline justify-between text-sm">
          <span>
            מידה: <span className={size ? "font-semibold" : "font-semibold text-signal-deep"}>{product.sizes.find((s) => s.id === size)?.label ?? "עוד לא נבחרה"}</span>
          </span>
          <button type="button" onClick={() => guide.current?.showModal()} className="py-1 text-sm underline underline-offset-4">
            איזו מידה מתאימה?
          </button>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <label key={s.id} className={`${chip} cursor-pointer px-4 py-2 text-sm ${size === s.id ? "border-ink bg-ink text-paper" : "border-line hover:border-graphite"}`}>
              <input type="radio" name="size" checked={size === s.id} onChange={() => order.setSize(s.id)} className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        {sizeDetail && <p className="mt-2 text-sm text-graphite">{sizeDetail}</p>}
      </fieldset>

      {/* כמות */}
      <div>
        <p className="mb-2 text-sm">כמות</p>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-md border border-line">
            <button type="button" onClick={() => order.setQty(qty - 1)} disabled={qty <= 1} className="size-11 text-xl disabled:text-line" aria-label="פחות">
              −
            </button>
            <span className="w-8 text-center font-semibold" aria-live="polite">
              {qty}
            </span>
            <button type="button" onClick={() => order.setQty(qty + 1)} disabled={qty >= MAX_QTY} className="size-11 text-xl disabled:text-line" aria-label="עוד אחת">
              +
            </button>
          </div>
          <p className="text-sm">
            סה״כ <span className="font-bold">₪{total}</span>
            {saving > 0 && <span className="text-ok"> (חוסכים ₪{saving})</span>}
          </p>
        </div>
      </div>

      {/* קבלה */}
      {delivery.personal.enabled && (
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="mb-2 text-sm">איך לקבל</legend>
          {(["home", "personal"] as const).map((m) => (
            <label key={m} className={`${chip} cursor-pointer px-3 py-2 text-sm ${method === m ? "border-ink" : "border-line"}`}>
              <input type="radio" name="delivery" checked={method === m} onChange={() => order.setMethod(m)} className="sr-only" />
              <span className="font-semibold">{m === "home" ? "משלוח עד הבית" : "מסירה אישית"}</span>
              <span className="block text-graphite">{m === "home" ? delivery.homeText : `באזור ${delivery.personal.area}`}</span>
            </label>
          ))}
        </fieldset>
      )}

      {isLive && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => order.setAgreed(e.target.checked)} className="mt-1 size-4 accent-[var(--ink)]" />
          <span>
            קראתי ואני מסכים/ה ל<Link href="/terms" className="underline">תקנון</Link> ול<Link href="/cancel" className="underline">תנאי ביטול העסקה</Link>
          </span>
        </label>
      )}

      {/* פעולה */}
      <div className="grid gap-2">
        {!ready && <p className="text-sm text-signal-deep" aria-live="polite">{size === "" ? "נשאר לבחור מידה." : "נשאר לאשר את התקנון."}</p>}
        {href ? (
          <a
            href={ready ? href : undefined}
            aria-disabled={!ready}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-12 items-center justify-center rounded-full px-6 text-lg font-semibold ${ready ? "bg-signal text-ink hover:brightness-95" : "pointer-events-none bg-line text-graphite"}`}
          >
            {isLive ? "להזמנה בוואטסאפ" : "תעדכנו אותי בהשקה"}
          </a>
        ) : (
          <span className="flex min-h-12 items-center justify-center rounded-full bg-line px-6 font-semibold text-graphite">וואטסאפ יחובר בקרוב</span>
        )}
        {isLive && paymentLink && (
          <a href={ready ? paymentLink : undefined} aria-disabled={!ready} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-full border-2 border-ink px-6 font-semibold">
            תשלום מאובטח באשראי
          </a>
        )}
        <p className="text-xs text-graphite">
          {isLive
            ? "אחרי שליחת ההזמנה בוואטסאפ נאשר את הפרטים ונשלח קישור לתשלום. ההזמנה יוצאת לדרך רק אחרי התשלום."
            : "זו לא הזמנה ואין תשלום. נשלח לך הודעה כשהמוצר זמין."}
        </p>
      </div>

      {/* משלוח והחזרות */}
      <ul className="divide-y divide-line rounded-lg border border-line text-sm">
        <li className="p-3">
          <span className="font-semibold text-ok">משלוח חינם</span> עד הבית, {delivery.homeText}, עם מספר מעקב בוואטסאפ.
        </li>
        <li className="p-3">
          ביטול עסקה תוך 14 יום מקבלת המוצר. <Link href="/cancel" className="underline">התנאים</Link>
        </li>
        <li className="p-3">{warrantyText}</li>
      </ul>

      <p className="text-sm text-graphite">
        נמכר על ידי <span className="font-semibold text-ink">{site.brandName}</span>, ונשלח מהספק ישירות אליך.
      </p>

      <dialog ref={guide} className="m-auto w-[min(92vw,520px)] rounded-lg p-0 backdrop:bg-black/40" aria-labelledby="size-guide-title">
        <div className="p-5">
          <h2 id="size-guide-title" className="text-lg font-bold">איזו מידה מתאימה?</h2>
          <p className="mt-2 text-sm">{family.sizeHelp}</p>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y divide-line">
              {product.sizes.map((s) => (
                <tr key={s.id}>
                  <th scope="row" className="py-2 ps-0 pe-3 text-start font-semibold whitespace-nowrap">{s.label}</th>
                  <td className="py-2 text-graphite">{s.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-graphite">לא בטוחים? שלחו לנו בוואטסאפ תמונה של השעון ונבדוק.</p>
          <button type="button" onClick={() => guide.current?.close()} className="mt-4 min-h-11 w-full rounded-full border-2 border-ink font-semibold">
            סגירה
          </button>
        </div>
      </dialog>
    </div>
  );
}
