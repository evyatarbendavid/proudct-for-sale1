"use client";

import { useEffect, useRef, useState } from "react";
import type { BandType } from "@/lib/config";
import type { WatchScene } from "./watchScene";
import { BandPreview } from "./BandPreview";

// שעון תלת-ממדי שמסתובב. עד שהוא נטען, או אם אין WebGL, מוצגת הדמיה שטוחה
export function Watch3D({
  color,
  type,
  className = "",
}: {
  color: string;
  type: BandType;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<WatchScene | null>(null);
  const initial = useRef({ color, type });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    initial.current = { color, type };
    scene.current?.setColor(color);
  }, [color, type]);

  useEffect(() => {
    scene.current?.setType(type);
  }, [type]);

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
    >
      <div
        className={`absolute inset-0 grid place-items-center transition-opacity duration-500 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <BandPreview hex={color} type={type} className="h-3/4 w-auto" />
      </div>
      {!failed && (
        <div
          ref={host}
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
