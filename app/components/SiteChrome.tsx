import Link from "next/link";
import { business, isLive, site } from "@/lib/config";

export function DraftBanner() {
  if (isLive) return null;
  return (
    <div className="bg-signal-soft px-4 py-2 text-center text-sm">
      טרום השקה: עדיין לא מוכרים ולא גובים כסף. אפשר להשאיר פרטים ולקבל עדכון כשמתחילים.
    </div>
  );
}

export function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-3xl leading-none font-bold">
          {site.brandName}
        </Link>
        <Link
          href="/#order"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-5 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
        >
          {isLive ? "להזמנה" : "לבחירת רצועה"}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <Link
          href="/cancel"
          className="inline-flex min-h-11 items-center rounded-full bg-signal px-5 font-semibold text-ink"
        >
          ביטול עסקה
        </Link>

        <nav aria-label="מידע משפטי" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/terms" className="underline underline-offset-4">
            תקנון
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            מדיניות פרטיות
          </Link>
          <Link href="/accessibility" className="underline underline-offset-4">
            הצהרת נגישות
          </Link>
        </nav>

        {isLive ? (
          <address className="mt-6 not-italic text-paper/70">
            {business.ownerName} · {business.status} מס׳ {business.businessId}
            <br />
            {business.address} · {business.phone} · {business.email}
          </address>
        ) : (
          <p className="mt-6 text-paper/70">
            האתר בשלב טרום השקה. פרטי העוסק יפורסמו כאן עם תחילת המכירה.
          </p>
        )}

        <p className="mt-4 text-xs text-paper/60">
          Apple Watch הוא סימן מסחר של Apple Inc. העסק אינו קשור ל-Apple, והרצועות אינן
          מוצר מקורי של Apple.
        </p>
      </div>
    </footer>
  );
}
