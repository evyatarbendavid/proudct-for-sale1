"use client";

import { useEffect, useState } from "react";
import type { CaseKind, Material } from "@/lib/catalog";
import { Watch3D } from "../components/Watch3D";

type Entry = { slug: string; caseKind: CaseKind; material: Material; colors: { id: string; hex: string }[] };

// מציג שעון אחד בזווית קבועה לפי ?slug=&color=&angle=
export function RenderStage({ catalog }: { catalog: Entry[] }) {
  const [shot, setShot] = useState<{ entry: Entry; hex: string; angle: number } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const entry = catalog.find((e) => e.slug === q.get("slug"));
    const color = entry?.colors.find((c) => c.id === q.get("color")) ?? entry?.colors[0];
    // מעדכנים state פעם אחת מתוך הכתובת, אחרי שהדף נטען בדפדפן
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (entry && color) setShot({ entry, hex: color.hex, angle: Number(q.get("angle") ?? -0.35) });
  }, [catalog]);

  if (!shot) return null;
  return (
    <div id="stage" style={{ width: 640, height: 640, position: "relative" }}>
      <Watch3D
        color={shot.hex}
        caseKind={shot.entry.caseKind}
        material={shot.entry.material}
        still={shot.angle}
        className="absolute inset-0"
      />
    </div>
  );
}
