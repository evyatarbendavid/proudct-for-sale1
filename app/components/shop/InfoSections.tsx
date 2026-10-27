import Link from "next/link";
import { colorById, families, materials, type Product } from "@/lib/catalog";
import { delivery, warrantyText } from "@/lib/config";

const SECTIONS = [
  { id: "description", title: "תיאור" },
  { id: "specs", title: "מפרט" },
  { id: "sizes", title: "מידות" },
  { id: "faq", title: "שאלות" },
  { id: "reviews", title: "ביקורות" },
] as const;

export function InfoSections({ product }: { product: Product }) {
  const family = families[product.family];
  const material = materials[product.material];
  const faq = [
    { q: "כמה זמן לוקח המשלוח?", a: `${delivery.homeText} מרגע התשלום. הרצועה נשלחת מהספק ישירות אליך, ומספר מעקב נשלח אליך בוואטסאפ.` },
    { q: "מה אם המידה לא מתאימה?", a: "אפשר לבטל עסקה תוך 14 יום מקבלת המוצר, לפי חוק הגנת הצרכן. הפרטים בעמוד ביטול עסקה." },
    { q: "זה מוצר מקורי של היצרן?", a: `לא. זו רצועה תואמת, שמתאימה ל${family.name} במידות שבדף. היא לא מיוצרת על ידי יצרן השעון.` },
    { q: "מה האחריות?", a: warrantyText },
  ];

  return (
    <div className="mt-6 rounded-lg border border-line bg-paper">
      <nav aria-label="חלקי הדף" className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-line bg-paper px-3 [scrollbar-width:none]">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 px-3 py-3 text-sm font-semibold text-graphite hover:text-ink">
            {s.title}
          </a>
        ))}
      </nav>

      <div className="divide-y divide-line px-4 md:px-6">
        <section id="description" className="scroll-mt-14 py-6">
          <h2 className="text-lg font-bold">תיאור</h2>
          <p className="mt-2 max-w-prose">{product.description}</p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
            {product.features.map((f) => (
              <li key={f} className="rounded-md bg-stage px-3 py-2 text-sm">{f}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-graphite">טיפול: {material.care}</p>
        </section>

        <section id="specs" className="scroll-mt-14 py-6">
          <h2 className="text-lg font-bold">מפרט</h2>
          <dl className="mt-3 grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-graphite">חומר</dt>
            <dd>{material.name}</dd>
            <dt className="text-graphite">מתאים ל</dt>
            <dd>{family.name}</dd>
            <dt className="text-graphite">מידות</dt>
            <dd>{product.sizes.map((s) => s.label).join(", ")}</dd>
            <dt className="text-graphite">צבעים</dt>
            <dd>{product.colors.map((c) => colorById(c).name).join(", ")}</dd>
            <dt className="text-graphite">משלוח</dt>
            <dd>חינם, {delivery.homeText}</dd>
          </dl>
        </section>

        <section id="sizes" className="scroll-mt-14 py-6">
          <h2 className="text-lg font-bold">איזו מידה מתאימה?</h2>
          <p className="mt-2 max-w-prose text-sm">{family.sizeHelp}</p>
          <table className="mt-3 w-full max-w-xl text-sm">
            <tbody className="divide-y divide-line">
              {product.sizes.map((s) => (
                <tr key={s.id}>
                  <th scope="row" className="py-2 ps-0 pe-4 text-start font-semibold whitespace-nowrap">{s.label}</th>
                  <td className="py-2 text-graphite">{s.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="faq" className="scroll-mt-14 py-6">
          <h2 className="text-lg font-bold">שאלות נפוצות</h2>
          <div className="mt-2 divide-y divide-line">
            {faq.map((item) => (
              <details key={item.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <span aria-hidden className="text-graphite transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 max-w-prose text-sm text-graphite">
                  {item.a}{" "}
                  {item.q.startsWith("מה אם") && <Link href="/cancel" className="underline">לעמוד ביטול עסקה</Link>}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section id="reviews" className="scroll-mt-14 py-6">
          <h2 className="text-lg font-bold">ביקורות</h2>
          <p className="mt-2 text-sm text-graphite">
            עוד אין ביקורות. אחרי המכירות הראשונות נפרסם כאן ביקורות של קונים אמיתיים, עם התמונות שלהם.
          </p>
        </section>
      </div>
    </div>
  );
}
