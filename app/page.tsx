import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { bandTypes, bundles, delivery, isLive, site, warrantyText } from "@/lib/config";
import { DraftBanner, SiteFooter, SiteHeader } from "./components/SiteChrome";
import { Storefront } from "./components/Storefront";

const steps = [
  { title: "בוחרים", text: "סוג, מידה, כמות וצבע לכל רצועה." },
  { title: "שולחים בוואטסאפ", text: "ההזמנה נשלחת אלינו עם כל הפרטים, ואנחנו מאשרים מידה וצבע." },
  isLive
    ? { title: "משלמים ומקבלים", text: `תשלום בקישור מאובטח, והרצועות מגיעות עד הבית תוך ${delivery.homeText}.` }
    : { title: "מקבלים עדכון", text: "כשהרצועות זמינות נשלח לך הודעה, ותחליט/י אז אם להזמין." },
];

export const metadata: Metadata = {
  ...canonical("/"),
};

// נתונים מובנים למוצר. רק במצב מכירה, כשיש באמת הצעה למכירה
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "רצועה לשעון חכם, סיליקון או מגנטית",
  description: "רצועות סיליקון ומגנטיות לשעון חכם, תואמות ל-Apple Watch.",
  brand: { "@type": "Brand", name: site.brandName },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "ILS",
    lowPrice: bundles[0].price,
    highPrice: bundles[bundles.length - 1].price,
    offerCount: bundles.length,
    availability: "https://schema.org/InStock",
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "ILS" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "IL" },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "IL",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
    },
  },
};

const faq = [
  {
    id: "faq-size",
    q: "איך יודעים איזו מידה מתאימה?",
    a: "המידה כתובה על גב השעון, במילימטרים (למשל 41mm או 45mm). בוחרים את הקבוצה שהמספר שלך נמצא בה. אם לא בטוחים, שולחים לנו בוואטסאפ תמונה של גב השעון ונבדוק.",
  },
  {
    id: "faq-fit",
    q: "לאילו שעונים זה מתאים?",
    a: "הרצועות תואמות לשעוני Apple Watch בגדלים שמופיעים בבחירת המידה. הן לא מוצר מקורי של Apple.",
  },
  {
    id: "faq-delivery",
    q: "כמה זמן לוקח המשלוח?",
    a: `${delivery.homeText} מרגע התשלום. הרצועות נשלחות מהספק ישירות אליך, ומספר מעקב נשלח אליך בוואטסאפ.`,
  },
  {
    id: "faq-return",
    q: "מה אם המידה לא מתאימה או שאני רוצה לבטל?",
    a: "אפשר לבטל עסקה תוך 14 יום מקבלת הרצועה, לפי חוק הגנת הצרכן. כל הפרטים בעמוד ביטול עסקה.",
  },
  { id: "faq-warranty", q: "מה האחריות?", a: warrantyText },
];

export default function Home() {
  return (
    <>
      <DraftBanner />
      <SiteHeader />

      <main className="flex-1">
        {isLive && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
          />
        )}
        <Storefront>
          <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <h2 id="how-title" className="reveal font-display text-[clamp(3rem,8vw,4.5rem)] leading-[0.9] font-bold">
              איך זה עובד
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="reveal flex gap-4">
                  <span className="font-display text-7xl leading-[0.75] font-bold text-[#e2470f]">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-graphite">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </Storefront>

        <section aria-labelledby="specs-title" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 id="specs-title" className="reveal font-display text-[clamp(3rem,8vw,4.5rem)] leading-[0.9] font-bold">
            מפרט
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
            {Object.values(bandTypes).map((t) => (
              <div key={t.name} className="bg-paper p-6">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="mt-1 text-graphite">{t.description}</p>
                <dl className="mt-4 flex gap-3 text-sm">
                  <dt className="text-graphite">מידות</dt>
                  <dd className="font-mono">{t.sizes.join(" · ")}</dd>
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 pb-20">
          <h2 id="faq-title" className="reveal font-display text-[clamp(3rem,8vw,4.5rem)] leading-[0.9] font-bold">
            שאלות
          </h2>
          <div className="mt-8 border-t border-line">
            {faq.map((item) => (
              <details
                key={item.id}
                id={item.id}
                open={item.id === "faq-size"}
                className="group scroll-mt-4 border-b border-line py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {item.q}
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-line font-mono text-graphite transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-prose text-graphite">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
