"use client";

import type { Product } from "@/lib/catalog";
import { isLive } from "@/lib/config";
import { BuyBox } from "./BuyBox";
import { Gallery } from "./Gallery";
import { useProductOrder, whatsappHref } from "./order";

export function ProductView({ product }: { product: Product }) {
  const order = useProductOrder(product);
  const href = whatsappHref(order);

  return (
    <>
      <div className="grid gap-6 rounded-lg border border-line bg-paper p-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8 md:p-6">
        <Gallery order={order} />
        <BuyBox order={order} />
      </div>

      {/* במובייל: פס קנייה קבוע בתחתית */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="leading-tight">
            <span className="block text-xl font-bold text-signal-deep">₪{order.total}</span>
            <span className="text-xs text-graphite">
              {order.qty > 1 ? `${order.qty} רצועות` : "משלוח חינם"}
            </span>
          </div>
          {order.size === "" ? (
            <a href="#size" className="ms-auto inline-flex min-h-11 items-center rounded-full bg-signal px-5 font-semibold text-ink">
              לבחירת מידה
            </a>
          ) : href && order.ready ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="ms-auto inline-flex min-h-11 items-center rounded-full bg-signal px-5 font-semibold text-ink">
              {isLive ? "להזמנה בוואטסאפ" : "תעדכנו אותי"}
            </a>
          ) : (
            <span className="ms-auto inline-flex min-h-11 items-center rounded-full bg-line px-5 font-semibold text-graphite">
              {href ? "נשאר לאשר את התקנון" : "וואטסאפ בקרוב"}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
