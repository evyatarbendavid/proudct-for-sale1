import type { Metadata } from "next";
import Link from "next/link";
import { bundles, business, delivery, site, warrantyText } from "@/lib/config";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = { title: "תקנון" };

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
        רצועות לשעון חכם מסיליקון ורצועות מגנטיות, בצבעים ובמידות שמופיעים בדף ההזמנה. הרצועות
        תואמות לשעוני Apple Watch במידות המצוינות. הן אינן מוצר מקורי של Apple, והעסק אינו קשור
        ל-Apple. התמונות בדף הן הדמיה, וייתכן הבדל קל בגוון בין המסך למוצר.
      </p>

      <h2>מחירים ותשלום</h2>
      <ul>
        {bundles.map((b) => (
          <li key={b.qty}>
            {b.label}: ₪{b.price}
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
