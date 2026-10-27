"use client";

import { useState } from "react";
import { colorById, families, priceOf, type ColorId, type Product } from "@/lib/catalog";
import { contact, delivery, isLive } from "@/lib/config";
import { savingFor, totalFor } from "@/lib/pricing";

export type DeliveryMethod = "home" | "personal";
export const MAX_QTY = 5;

// מה שהלקוח בחר בדף מוצר אחד. הגלריה, תיבת הקנייה והפס התחתון משתמשים באותו מצב
export function useProductOrder(product: Product) {
  const [color, setColor] = useState<ColorId>(product.colors[0]);
  // כשיש מידה אחת בלבד בוחרים אותה מראש
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0].id : "");
  const [qty, setQtyState] = useState(1);
  const [method, setMethod] = useState<DeliveryMethod>("home");
  const [agreed, setAgreed] = useState(false);

  const price = priceOf(product);
  const total = totalFor(price, qty);
  const saving = savingFor(price, qty);
  // בטרום השקה אין עסקה, ולכן אין צורך באישור תקנון
  const ready = size !== "" && (agreed || !isLive);

  return {
    product,
    color,
    size,
    qty,
    method,
    agreed,
    price,
    total,
    saving,
    ready,
    setColor,
    setSize,
    setQty: (n: number) => setQtyState(Math.min(MAX_QTY, Math.max(1, n))),
    setMethod,
    setAgreed,
  };
}

export type ProductOrder = ReturnType<typeof useProductOrder>;

export function whatsappHref(o: ProductOrder) {
  if (!contact.whatsappNumber) return "";
  const sizeLabel = o.product.sizes.find((s) => s.id === o.size)?.label ?? "לא נבחרה";
  const lines = [
    isLive ? "שלום, אני רוצה להזמין:" : "שלום, אשמח לקבל עדכון כשהמוצר זמין:",
    o.product.name,
    `מתאים ל: ${families[o.product.family].name}`,
    `צבע: ${colorById(o.color).name}`,
    `מידה: ${sizeLabel}`,
    `כמות: ${o.qty}`,
    `${isLive ? "סה״כ" : "מחיר השקה"}: ₪${o.total}`,
    o.method === "home"
      ? `משלוח עד הבית${isLive ? " (אשלח כתובת)" : ""}`
      : `מסירה אישית באזור ${delivery.personal.area}`,
  ];
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
