import type { Metadata } from "next";
import { business, contact } from "@/lib/config";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = { title: "ביטול עסקה" };

export default function CancelPage() {
  const whatsappHref = contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
        "שלום, אני רוצה לבטל עסקה.\nשם מלא:\nטלפון שממנו הוזמן:\nתאריך ההזמנה:",
      )}`
    : "";

  return (
    <LegalPage title="ביטול עסקה" updated="26.10.2026">
      <section className="rounded-2xl border-2 border-foreground bg-surface p-5">
        <h2 className="!mt-0">איך מבטלים</h2>
        <p className="mt-2">שולחים הודעת ביטול באחת מהדרכים הבאות, עם שם מלא, טלפון ותאריך ההזמנה:</p>
        <ul className="mt-2">
          <li>
            וואטסאפ:{" "}
            {whatsappHref ? (
              <a href={whatsappHref} className="font-semibold underline">
                לשליחת הודעת ביטול
              </a>
            ) : (
              <span className="text-muted">[יחובר לפני ההשקה]</span>
            )}
          </li>
          <li>דוא״ל: {business.email}</li>
          <li>טלפון: {business.phone}</li>
          <li>דואר: {business.address}</li>
        </ul>
        <p className="mt-2">נאשר בכתב שהודעת הביטול התקבלה.</p>
      </section>

      <h2>מתי אפשר לבטל</h2>
      <p>
        לפי חוק הגנת הצרכן, אפשר לבטל עסקה תוך 14 יום מהיום שקיבלת את הרצועה, או מהיום שקיבלת
        את מסמך פרטי העסקה, המאוחר מביניהם.
      </p>

      <h2>דמי ביטול</h2>
      <p>
        בביטול שלא בגלל פגם, נגבים דמי ביטול של 5% ממחיר העסקה או ₪100, הנמוך מביניהם. בהזמנה
        של ₪69, למשל, דמי הביטול הם ₪3.45.
      </p>
      <p>
        אם הרצועה הגיעה פגומה, לא תואמת להזמנה, או הגיעה אחרי המועד שהתחייבנו אליו, אין דמי ביטול
        ואנחנו נושאים בעלות ההחזרה.
      </p>

      <h2>החזר כספי</h2>
      <p>
        ההחזר מתבצע תוך 14 יום מקבלת הודעת הביטול, לאותו אמצעי תשלום שבו שילמת. את הרצועה מחזירים
        במצב שבו התקבלה. נתאם איתך את דרך ההחזרה.
      </p>

      <h2>ביטול לפני המשלוח</h2>
      <p>
        אם ההזמנה עוד לא נשלחה מהספק, אפשר לבטל ולקבל החזר מלא, בלי דמי ביטול.
      </p>
    </LegalPage>
  );
}
