import Link from "next/link";
import { business, isLive, site } from "@/lib/config";

export function DraftBanner() {
  if (isLive) return null;
  return (
    <div className="bg-warn-soft px-4 py-2 text-center text-sm">
      טרום השקה: עדיין לא מוכרים ולא גובים כסף. אפשר להשאיר פרטים ולקבל עדכון כשמתחילים.
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          {site.brandName}
        </Link>
        <Link
          href="/#order"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
        >
          {isLive ? "להזמנה" : "לבחירת רצועה"}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <Link
          href="/cancel"
          className="inline-block rounded-xl border-2 border-foreground px-4 py-2 font-semibold"
        >
          ביטול עסקה
        </Link>

        <nav aria-label="מידע משפטי" className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/terms" className="underline">
            תקנון
          </Link>
          <Link href="/privacy" className="underline">
            מדיניות פרטיות
          </Link>
          <Link href="/accessibility" className="underline">
            הצהרת נגישות
          </Link>
        </nav>

        {isLive ? (
          <address className="mt-5 not-italic text-muted">
            {business.ownerName} · {business.status} מס׳ {business.businessId}
            <br />
            {business.address} · {business.phone} · {business.email}
          </address>
        ) : (
          <p className="mt-5 text-muted">
            האתר בשלב טרום השקה. פרטי העוסק יפורסמו כאן עם תחילת המכירה.
          </p>
        )}

        <p className="mt-4 text-xs text-muted">
          Apple Watch הוא סימן מסחר של Apple Inc. העסק אינו קשור ל-Apple, והרצועות אינן
          מוצר מקורי של Apple.
        </p>
      </div>
    </footer>
  );
}
