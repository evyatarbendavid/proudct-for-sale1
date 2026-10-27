import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import Link from "next/link";
import { priceOf, products } from "@/lib/catalog";
import { business, delivery, site, warrantyText } from "@/lib/config";
import { pairPrice } from "@/lib/pricing";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "תקנון",
  description: "תנאי השימוש וההזמנה: מחירים, תשלום, זמני אספקה, אחריות וביטול עסקה ברכישת רצועות לשעון חכם.",
  ...canonical("/terms"),
};

export default function TermsPage() {
  return (
    <LegalPage title="תקנון" updated="26.10.2026">
      <h2>מי אנחנו</h2>
      <p>
        האתר מופעל על ידי {business.ownerName}, {business.status} מס׳ {business.businessId},{" "}
        {business.address} (להלן: &quot;{site.brandName}&quot;). ליצירת קשר: {business.phone},{" "}
        {business.email}.
      </p>

      <h2>המוצרים</h2>
      <p>
        רצועות לשעונים חכמים ולצמידי כושר, בחומרים, בצבעים ובמידות שמופיעים בדף של כל מוצר. הרצועות
        תואמות לדגמים ולמידות שמצוינים בדף. הן אינן מוצר מקורי של יצרן השעון, והעסק אינו קשור ל-Apple,
        Samsung, Garmin, Huawei, Amazfit, Xiaomi או Fitbit. התמונות בדפים הן הדמיה, וייתכן הבדל בגוון
        ובפרטים בין התמונה למוצר.
      </p>

      <h2>מחירים ותשלום</h2>
      <ul>
        {products.map((p) => (
          <li key={p.slug}>
            {p.name}: ₪{priceOf(p)} לרצועה, ₪{pairPrice(priceOf(p))} לזוג
          </li>
        ))}
      </ul>
      <p>
        המחירים כוללים משלוח. העסק הוא עוסק פטור ואינו גובה מע״מ. התשלום באשראי דרך קישור תשלום
        מאובטח של חברת סליקה. פרטי האשראי לא נשמרים אצלנו.
      </p>

      <h2>איך מזמינים</h2>
      <ul>
        <li>בוחרים סוג, מידה, כמות וצבעים, ושולחים את ההזמנה בוואטסאפ.</li>
        <li>אנחנו מאשרים את הפרטים ושולחים קישור לתשלום.</li>
        <li>ההזמנה נחשבת סופית רק אחרי שהתשלום התקבל, ואז נשלח אליך מסמך פרטי העסקה.</li>
      </ul>

      <h2>אספקה</h2>
      <p>
        משלוח עד הבית, חינם. זמן האספקה: {delivery.homeText} מיום התשלום. הרצועות נשלחות מהספק
        ישירות לכתובת שמסרת, ומספר מעקב יישלח אליך בוואטסאפ ביום המשלוח.
      </p>
      {delivery.personal.enabled && (
        <p>
          באזור {delivery.personal.area} אפשר לבחור מסירה אישית בתיאום, בלי תשלום נוסף.
        </p>
      )}

      <h2>אחריות</h2>
      <p>{warrantyText}</p>

      <h2>ביטול עסקה</h2>
      <p>
        אפשר לבטל עסקה לפי חוק הגנת הצרכן. כל התנאים והדרכים לביטול נמצאים ב
        <Link href="/cancel" className="underline">
          עמוד ביטול עסקה
        </Link>
        .
      </p>

      <h2>פרטיות</h2>
      <p>
        השימוש במידע האישי שלך מתואר ב
        <Link href="/privacy" className="underline">
          מדיניות הפרטיות
        </Link>
        .
      </p>

      <h2>שונות</h2>
      <p>
        על התקנון חלים דיני מדינת ישראל. אם יש סתירה בין התקנון לבין הוראות חוק הגנת הצרכן,
        הוראות החוק גוברות.
      </p>
    </LegalPage>
  );
}
