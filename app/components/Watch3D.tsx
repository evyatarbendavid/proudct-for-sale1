"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseKind, Material } from "@/lib/catalog";
import type { WatchScene } from "./watchScene";
import { BandPreview } from "./BandPreview";

// שעון תלת-ממדי שמסתובב. עד שהוא נטען, או אם אין WebGL, מוצגת הדמיה שטוחה
export function Watch3D({
  color,
  caseKind,
  material,
  className = "",
  still,
}: {
  color: string;
  caseKind: CaseKind;
  material: Material;
  className?: string;
  /** זווית קבועה בלי תנועה, לצילום תמונות */
  still?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<WatchScene | null>(null);
  const initial = useRef({ color, caseKind, material, still });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    initial.current = { ...initial.current, color };
    scene.current?.setColor(color);
  }, [color]);

  // גוף או חומר אחר: בונים את המודל מחדש (רק אם השתנו מהמצב הנוכחי)
  const spec = useRef({ caseKind, material });
  useEffect(() => {
    if (spec.current.caseKind === caseKind && spec.current.material === material) return;
    spec.current = { caseKind, material };
    initial.current = { ...initial.current, caseKind, material };
    scene.current?.setSpec(caseKind, material);
  }, [caseKind, material]);

  useEffect(() => {
    let cancelled = false;
    import("./watchScene").then(({ createWatchScene }) => {
      if (cancelled || !host.current) return;
      const created = createWatchScene(host.current, {
        ...initial.current,
        onReady: () => setReady(true),
      });
      if (!created) setFailed(true);
      scene.current = created;
    });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  return (
    <div
      className={className || "relative"}
      role="img"
      aria-label="שעון חכם עם הרצועה בצבע שנבחר. אפשר לגרור כדי לסובב."
      data-ready={ready}
    >
      {/* בצילום תמונות אין הדמיה שטוחה ואין מעבר, כדי שלא תישאר שכבה חצי שקופה בתמונה */}
      {still === undefined && (
        <div
          className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        >
          <BandPreview hex={color} type={material === "magnetic" ? "magnetic" : "silicone"} className="h-3/4 w-auto" />
        </div>
      )}
      {!failed && (
        <div
          ref={host}
          className={`absolute inset-0 ${still === undefined ? "transition-opacity duration-700" : ""} ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
