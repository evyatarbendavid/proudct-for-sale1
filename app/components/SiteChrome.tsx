import Link from "next/link";
import { familyOrder, families } from "@/lib/catalog";
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
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-3 py-3 md:px-4">
        <Link href="/" className="font-display text-3xl leading-none font-bold">
          {site.brandName}
        </Link>
        <form action="/" role="search" className="order-last flex w-full md:order-none md:w-auto md:flex-1">
          <label htmlFor="site-search" className="sr-only">
            חיפוש רצועה
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="חיפוש לפי שעון או חומר, למשל Galaxy או עור"
            className="min-h-11 w-full min-w-0 rounded-s-full border-2 border-e-0 border-ink bg-paper px-4 text-sm outline-none"
          />
          <button type="submit" className="min-h-11 rounded-e-full bg-ink px-5 text-sm font-semibold text-paper">
            חיפוש
          </button>
        </form>
        <nav aria-label="קטגוריות" className="hidden gap-4 text-sm lg:flex">
          {familyOrder.map((f) => (
            <Link key={f} href={`/?family=${f}#catalog`} className="py-2 hover:underline">
              {families[f].short}
            </Link>
          ))}
        </nav>
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

        <nav aria-label="מידע משפטי" className="mt-4 flex flex-wrap gap-x-6">
          <Link href="/terms" className="inline-block py-3 underline underline-offset-4">
            תקנון
          </Link>
          <Link href="/privacy" className="inline-block py-3 underline underline-offset-4">
            מדיניות פרטיות
          </Link>
          <Link href="/accessibility" className="inline-block py-3 underline underline-offset-4">
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
          Apple Watch, Samsung Galaxy Watch, Garmin, Huawei, Amazfit, Xiaomi ו-Fitbit הם סימני מסחר של בעליהם.
          העסק אינו קשור אליהם, והרצועות הן מוצרים תואמים ולא מקוריים. השמות מופיעים רק כדי לתאר תאימות.
        </p>
      </div>
    </footer>
  );
}
