// כל הנתונים של הדף במקום אחד. ערכים שמסומנים TODO הם placeholders שצריך להשלים לפני עלייה לאוויר.

export type BandType = "silicone" | "magnetic";

export const site = {
  // TODO: שם המותג אחרי שיוחלט (PLAN.md סעיף 9)
  brandName: "שם העסק",
  // כל עוד true, מוצג פס עליון שהדף בבנייה ואין עדיין מכירה
  isDraft: true,
};

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

// TODO: קישורי תשלום של Grow (Morning) לכל חבילה. כל עוד ריק, כפתור התשלום הישיר מוסתר
export const paymentLinks: Record<number, string> = {
  1: "",
  2: "",
  3: "",
};

export const bundles = [
  { qty: 1, price: 45, label: "רצועה אחת" },
  { qty: 2, price: 69, label: "זוג רצועות", badge: "הכי משתלם" },
  { qty: 3, price: 89, label: "שלוש רצועות" },
] as const;

export const defaultQty = 2;

export const bandTypes: Record<
  BandType,
  { name: string; short: string; description: string; sizes: string[] }
> = {
  silicone: {
    name: "רצועת סיליקון ספורט",
    short: "סיליקון",
    description: "רכה, גמישה ועמידה במים ובזיעה. מתאימה לאימונים וליום יום.",
    // TODO: לאמת מול דף המוצר באלי אקספרס
    sizes: ["38/40/41 מ״מ", "42/44/45 מ״מ"],
  },
  magnetic: {
    name: "רצועה מגנטית",
    short: "מגנטית",
    description: "סגירה מגנטית בלי חורים ובלי אבזם. מתכווננת לכל היקף יד.",
    // TODO: לאמת מול דף המוצר באלי אקספרס
    sizes: ["42/44/45 מ״מ", "46 מ״מ", "49 מ״מ"],
  },
};

// TODO: צבעים זמניים. להחליף ב-8–10 הצבעים שנבחרו אחרי הדגימות
export const colors = [
  { id: "black", name: "שחור", hex: "#1f1f1f" },
  { id: "white", name: "לבן", hex: "#f4f2ee" },
  { id: "gray", name: "אפור", hex: "#8a8d91" },
  { id: "navy", name: "כחול כהה", hex: "#1e2b4a" },
  { id: "olive", name: "ירוק זית", hex: "#5b6347" },
  { id: "sand", name: "חול", hex: "#d8c3a5" },
  { id: "pink", name: "ורוד", hex: "#e8a5b5" },
  { id: "wine", name: "בורדו", hex: "#6b1f2e" },
] as const;

export type ColorId = (typeof colors)[number]["id"];

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
