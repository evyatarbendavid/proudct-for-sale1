// פרטי האתר והעסק. המוצרים, הצבעים והמידות נמצאים ב-lib/catalog.ts.
// ערכים שמסומנים TODO הם placeholders שצריך להשלים לפני עלייה לאוויר.

export const site = {
  // TODO: שם המותג אחרי שיוחלט (PLAN.md סעיף 9)
  brandName: "שם העסק",
  // TODO: כתובת האתר המלאה אחרי שיהיה דומיין, למשל https://example.co.il. בלעדיה אין canonical ו-sitemap
  url: "",
  // "waitlist": טרום השקה. אין מכירה ואין תשלום, רק השארת פרטים בוואטסאפ, וגוגל לא מאנדקס.
  // "live": מכירה. רק אחרי פתיחת עוסק פטור והשלמת כל ה-TODO בקובץ.
  mode: "waitlist" as "waitlist" | "live",
};

export const isLive = site.mode === "live";

// פרטי העוסק, חובה לפי חוק הגנת הצרכן (מכר מרחוק)
export const business = {
  // TODO: שם מלא כפי שרשום ברשות המסים
  ownerName: "[שם העוסק]",
  // TODO: מספר עוסק פטור (בדרך כלל מספר תעודת הזהות)
  businessId: "[מספר עוסק]",
  // TODO: כתובת למשלוח הודעות
  address: "[כתובת העסק]",
  // TODO: טלפון ודוא"ל ליצירת קשר
  phone: "[טלפון]",
  email: "[דוא\"ל]",
  status: "עוסק פטור",
};

export const contact = {
  // TODO: מספר וואטסאפ בפורמט בינלאומי בלי + ובלי מקפים, למשל 972501234567
  whatsappNumber: "",
};

// TODO: קישור תשלום כללי של Grow (Morning), עם סכום פתוח. כל עוד ריק, כפתור התשלום הישיר מוסתר
export const paymentLink = "";

export const delivery = {
  // משלוח ישירות מהספק לכתובת הלקוח, במשלוח חינם
  homeText: "10–14 ימי עסקים",
  personal: {
    enabled: true,
    // TODO: העיר או האזור שבו אפשר לתאם מסירה אישית
    area: "[עיר/אזור]",
  },
};

// TODO: החלטה עסקית שלך. ברירת מחדל מוצעת, אלי אקספרס נותנים 90 יום החזרות על הצד שלהם
export const warrantyText =
  "החלפה או החזר כספי על רצועה שהגיעה פגומה או לא תואמת להזמנה, בתוך 30 יום מקבלתה.";
