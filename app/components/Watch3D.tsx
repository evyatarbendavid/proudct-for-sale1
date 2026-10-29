"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseKind, Material } from "@/lib/catalog";
import type { WatchScene } from "./watchScene";

// שעון תלת-ממדי שמסתובב. עד שהוא נטען, או אם אין WebGL, מוצגת התמונה של אותו שעון (poster)
export function Watch3D({
  color,
  caseKind,
  material,
  poster,
  className = "",
  still,
}: {
  color: string;
  caseKind: CaseKind;
  material: Material;
  /** התמונה המצולמת של אותו מוצר וצבע מלפנים (renderSrc). התלת-ממד מתחיל באותה זווית ובאותו גודל */
  poster?: string;
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
      {/* עד הפריים הראשון: התמונה של אותו שעון, כך שמהרגע הראשון רואים שעון אמיתי. בצילום אין תמונה ואין מעבר */}
      {still === undefined && poster && (
        // eslint-disable-next-line @next/next/no-img-element -- תמונה מקומית שכבר מוקטנת, בלי צורך באופטימיזציה
        <img
          src={poster}
          alt=""
          aria-hidden
          decoding="async"
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
        />
      )}
      {!failed && (
        <div
          ref={host}
          className={`absolute inset-0 ${still === undefined ? "transition-opacity duration-300" : ""} ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
