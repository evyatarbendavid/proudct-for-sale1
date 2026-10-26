"use client";

import { useState } from "react";
import { bandTypes, colors, defaultQty, type BandType, type ColorId } from "@/lib/config";

export type DeliveryMethod = "home" | "personal";

export function colorById(id: ColorId) {
  return colors.find((c) => c.id === id) ?? colors[0];
}

// מצב ההזמנה, משותף לפתיח ולטופס כדי שצבע שנבחר למעלה יופיע גם בטופס
export function useOrderState() {
  const [type, setTypeState] = useState<BandType>("silicone");
  const [size, setSize] = useState("");
  const [qty, setQtyState] = useState<number>(defaultQty);
  const [bandColors, setBandColors] = useState<ColorId[]>(["black", "navy", "olive"]);
  const [activeBand, setActiveBand] = useState(0);
  const [method, setMethod] = useState<DeliveryMethod>("home");
  const [agreed, setAgreed] = useState(false);

  function setType(next: BandType) {
    setTypeState(next);
    if (!bandTypes[next].sizes.includes(size)) setSize("");
  }

  function setQty(next: number) {
    setQtyState(next);
    if (activeBand >= next) setActiveBand(next - 1);
  }

  function setColor(id: ColorId, band = activeBand) {
    setBandColors((prev) => prev.map((c, i) => (i === band ? id : c)));
  }

  return {
    type,
    size,
    qty,
    bandColors,
    activeBand,
    method,
    agreed,
    setType,
    setSize,
    setQty,
    setColor,
    setActiveBand,
    setMethod,
    setAgreed,
  };
}

export type OrderState = ReturnType<typeof useOrderState>;
