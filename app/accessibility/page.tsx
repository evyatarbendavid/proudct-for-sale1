import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { business } from "@/lib/config";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "התאמות הנגישות באתר ופרטי רכז הנגישות, למי שנתקל בבעיה בהזמנה.",
  ...canonical("/accessibility"),
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="הצהרת נגישות" updated="26.10.2026">
      <p>
        אנחנו רוצים שכל אחד יוכל להזמין אצלנו בקלות. האתר נבנה עם התאמות נגישות, ואנחנו ממשיכים
        לשפר אותו.
      </p>

      <h2>מה עשינו</h2>
      <ul>
        <li>אפשר לנווט ולהזמין עם מקלדת בלבד, עם סימון ברור של הפוקוס.</li>
        <li>כותרות, טפסים וכפתורים מסומנים כך שקורא מסך יכול לזהות אותם.</li>
        <li>ניגודיות צבעים מספקת לטקסט, וכל צבע רצועה מופיע גם בשם.</li>
        <li>האתר מותאם למובייל ולהגדלת טקסט בדפדפן.</li>
      </ul>

      <h2>נתקלת בבעיה?</h2>
      <p>
        אם משהו באתר לא נגיש לך, נשמח לעזור ולהשלים את ההזמנה בדרך אחרת. רכז הנגישות:{" "}
        {business.ownerName}, {business.phone}, {business.email}.
      </p>
    </LegalPage>
  );
}
