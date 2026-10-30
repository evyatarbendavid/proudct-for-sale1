"use client";

import { useLayoutEffect } from "react";

// מתי היה ניווט אחורה או קדימה בתוך האתר. שם הדפדפן ו-Next משחזרים את הגלילה, ולא נוגעים בה
let poppedAt = -Infinity;
let firstRun = true;
if (typeof window !== "undefined") window.addEventListener("popstate", () => (poppedAt = performance.now()));

/** כשנכנסים לדף מוצר, גם מההמלצות בתחתית של דף אחר, הוא נפתח מלמעלה, אצל התמונה הגדולה */
export function ScrollToTop({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const restoring = firstRun ? nav?.type === "back_forward" : performance.now() - poppedAt < 1500;
    firstRun = false;
    // קישור לחלק מסוים בדף (#size וכו') מקבל את הגלילה שלו
    if (restoring || location.hash) return;
    window.scrollTo(0, 0);
    // גם מכיל חיצוני שגולל, למשל תצוגה מקדימה שמוצגת בתוך מסגרת
    document.documentElement.scrollIntoView({ block: "start", behavior: "instant" });
  }, [slug]);
  return null;
}
