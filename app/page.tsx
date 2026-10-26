import { bandTypes, bundles, colors, delivery, warrantyText } from "@/lib/config";
import { BandPreview } from "./components/BandPreview";
import { OrderForm } from "./components/OrderForm";
import { DraftBanner, SiteFooter, SiteHeader } from "./components/SiteChrome";

const benefits = [
  {
    title: "החלפה בשנייה",
    text: "נכנסת ויוצאת מהשעון בלחיצה, בלי כלים.",
  },
  {
    title: "צבע לכל מצב",
    text: "אחת לאימון, אחת לעבודה, אחת לערב.",
  },
  {
    title: "משלוח חינם",
    text: `עד הבית, ${delivery.homeText}. כתוב מראש, בלי הפתעות.`,
  },
  {
    title: "תשלום רק אחרי אישור",
    text: "קודם מאשרים איתך מידה וצבע, ורק אז משלמים.",
  },
];

const faq = [
  {
    id: "faq-size",
    q: "איך יודעים איזו מידה מתאימה?",
    a: "המידה של השעון כתובה על הגב שלו, במילימטרים (למשל 41mm או 45mm). בוחרים את הקבוצה שהמספר שלך נמצא בה. אם לא בטוחים, שולחים לנו תמונה של גב השעון בוואטסאפ ונבדוק.",
  },
  {
    id: "faq-fit",
    q: "לאילו שעונים זה מתאים?",
    a: "הרצועות תואמות לשעוני Apple Watch בגדלים שמופיעים בבחירת המידה. הן לא מוצר מקורי של Apple.",
  },
  {
    id: "faq-delivery",
    q: "כמה זמן לוקח המשלוח?",
    a: `${delivery.homeText} מרגע התשלום. הרצועות נשלחות מהספק ישירות אליך עם מספר מעקב, שנשלח אליך בוואטסאפ.`,
  },
  {
    id: "faq-return",
    q: "מה אם המידה לא מתאימה או שאני רוצה לבטל?",
    a: "אפשר לבטל עסקה בתוך 14 יום מקבלת הרצועה, לפי חוק הגנת הצרכן. כל הפרטים בעמוד ביטול עסקה.",
  },
  {
    id: "faq-warranty",
    q: "מה האחריות?",
    a: warrantyText,
  },
];

const minPrice = bundles[0].price;
const pair = bundles.find((b) => b.qty === 2);

export default function Home() {
  return (
    <>
      <DraftBanner />
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        {/* פתיח */}
        <section className="grid items-center gap-8 py-10 sm:py-14 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              שעון אחד,
              <br />
              צבע לכל יום.
            </h1>
            <p className="mt-4 text-lg text-muted">
              רצועות סיליקון ומגנטיות לשעון חכם, ב-{colors.length} צבעים ובכל המידות. מחליפים בשנייה.
            </p>
            <p className="mt-6 text-lg">
              מ-<strong className="text-2xl">₪{minPrice}</strong>
              {pair && (
                <>
                  {" "}
                  · זוג ב-<strong className="text-2xl">₪{pair.price}</strong>
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted">משלוח חינם · {delivery.homeText}</p>
            <a
              href="#order"
              className="mt-6 inline-block rounded-2xl bg-accent px-6 py-4 font-semibold text-white hover:bg-accent-strong"
            >
              לבחירת רצועה
            </a>
          </div>

          {/* TODO: להחליף בסרטון קצר של הרצועות על היד, מהדגימות */}
          <div className="flex aspect-square items-center justify-center gap-4 rounded-3xl bg-accent-soft p-6">
            <BandPreview hex="#1e2b4a" type="silicone" className="h-56 w-auto sm:h-72" />
            <BandPreview hex="#e8a5b5" type="magnetic" className="hidden h-56 w-auto sm:block sm:h-72" />
          </div>
        </section>

        {/* יתרונות */}
        <section aria-label="יתרונות" className="grid gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-semibold">{b.title}</h2>
              <p className="mt-1 text-sm text-muted">{b.text}</p>
            </div>
          ))}
        </section>

        <OrderForm />

        {/* מפרט */}
        <section aria-labelledby="specs-title" className="py-12">
          <h2 id="specs-title" className="text-2xl font-bold">
            מפרט
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Object.values(bandTypes).map((t) => (
              <div key={t.name} className="rounded-2xl border border-line bg-surface p-5">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted">{t.description}</p>
                <p className="mt-3 text-sm">
                  <span className="text-muted">מידות: </span>
                  {t.sizes.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* שאלות נפוצות */}
        <section aria-labelledby="faq-title" className="pb-14">
          <h2 id="faq-title" className="text-2xl font-bold">
            שאלות נפוצות
          </h2>
          <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faq.map((item) => (
              <details key={item.id} id={item.id} open={item.id === "faq-size"} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}
                  <span aria-hidden className="text-muted transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
