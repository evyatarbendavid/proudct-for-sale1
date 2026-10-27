// הקטלוג: כל המוצרים, הצבעים והמידות. מחירים מחושבים מהעלות (lib/pricing.ts).
// כל עלות עם costVerified: false היא הנחה, עד שיש קישור למוצר אמיתי ומחיר ממנו (research/catalog.md).

import { priceFor } from "./pricing";

export type Family = "apple" | "quick-release" | "garmin" | "tracker";
export type Material = "silicone" | "magnetic" | "nylon" | "milanese" | "leather" | "link";
export type CaseKind = "apple" | "round" | "tracker";

export const colors = [
  { id: "black", name: "שחור", hex: "#1f1f1f" },
  { id: "white", name: "לבן", hex: "#f4f2ee" },
  { id: "gray", name: "אפור", hex: "#8a8d91" },
  { id: "navy", name: "כחול כהה", hex: "#1e2b4a" },
  { id: "olive", name: "ירוק זית", hex: "#5b6347" },
  { id: "sand", name: "חול", hex: "#d8c3a5" },
  { id: "pink", name: "ורוד", hex: "#e8a5b5" },
  { id: "wine", name: "בורדו", hex: "#6b1f2e" },
  { id: "orange", name: "כתום", hex: "#e8642c" },
  { id: "brown", name: "חום", hex: "#6b4428" },
  { id: "tan", name: "קאמל", hex: "#b07a4f" },
  { id: "silver", name: "כסוף", hex: "#c9ccd1" },
  { id: "graphite", name: "גרפיט", hex: "#3b3d41" },
  { id: "rose", name: "זהב ורוד", hex: "#d8a99a" },
] as const;

export type ColorId = (typeof colors)[number]["id"];

export function colorById(id: ColorId) {
  return colors.find((c) => c.id === id) ?? colors[0];
}

export type SizeOption = { id: string; label: string; detail: string };

// מידות לפי משפחה. של Apple ידועות; של היצרנים האחרים לאמת מול המוכר ומול רוחב הזיזים
const appleSizes: SizeOption[] = [
  { id: "small", label: "קטן", detail: "38, 40, 41 מ״מ, וגם 42 מ״מ של סדרה 10 ואילך" },
  { id: "large", label: "גדול", detail: "42 מ״מ של סדרות 1 עד 3, וגם 44, 45, 46, 49 מ״מ" },
];
const quickReleaseSizes: SizeOption[] = [
  { id: "20", label: "20 מ״מ", detail: "למשל Galaxy Watch 4 עד 7, Amazfit GTS" },
  { id: "22", label: "22 מ״מ", detail: "למשל Huawei Watch GT 46 מ״מ, Amazfit GTR 47 מ״מ" },
];
const garminSizes: SizeOption[] = [
  { id: "20", label: "QuickFit 20", detail: "למשל Fenix 7S, Fenix 6S" },
  { id: "22", label: "QuickFit 22", detail: "למשל Fenix 7, Forerunner 955/965, Epix" },
  { id: "26", label: "QuickFit 26", detail: "למשל Fenix 7X, Fenix 6X" },
];

export const families: Record<Family, { name: string; short: string; caseKind: CaseKind; sizeHelp: string }> = {
  apple: {
    name: "Apple Watch",
    short: "Apple Watch",
    caseKind: "apple",
    sizeHelp: "המידה כתובה על גב השעון במילימטרים. 42 מ״מ שייך לקבוצה הקטנה בסדרה 10 ואילך, ולגדולה בסדרות 1 עד 3.",
  },
  "quick-release": {
    name: "Samsung, Huawei, Amazfit",
    short: "Samsung ועוד",
    caseKind: "round",
    sizeHelp: "רצועה בשחרור מהיר נמדדת ברוחב: המרחק בין שני הזיזים שאליהם היא מתחברת. מודדים בסרגל או בודקים במפרט השעון.",
  },
  garmin: {
    name: "Garmin QuickFit",
    short: "Garmin",
    caseKind: "round",
    sizeHelp: "המידה של QuickFit היא רוחב הרצועה (20, 22 או 26 מ״מ), ומופיעה במפרט של השעון.",
  },
  tracker: {
    name: "צמידי כושר",
    short: "צמידי כושר",
    caseKind: "tracker",
    sizeHelp: "הרצועה מתאימה לדגם מסוים של הצמיד. בודקים את שם הדגם בהגדרות או על האריזה.",
  },
};

export const materials: Record<Material, { name: string; care: string }> = {
  silicone: { name: "סיליקון", care: "שוטפים במים ובסבון עדין ומייבשים." },
  magnetic: { name: "סיליקון עם סוגר מגנטי", care: "שוטפים במים, ומרחיקים מכרטיסי אשראי." },
  nylon: { name: "ניילון ארוג", care: "כביסה ביד במים פושרים, ייבוש באוויר." },
  milanese: { name: "רשת נירוסטה", care: "מנגבים במטלית רכה. לא חומרים שוחקים." },
  leather: { name: "עור", care: "להרחיק ממים ומזיעה מרובה. מנגבים במטלית יבשה." },
  link: { name: "חוליות נירוסטה", care: "מנגבים במטלית. את האורך מקצרים בהסרת חוליות." },
};

export type Product = {
  slug: string;
  name: string;
  family: Family;
  material: Material;
  description: string;
  features: string[];
  sizes: SizeOption[];
  /** הצבע הראשון הוא ברירת המחדל, בכרטיס בקטלוג ובדף המוצר */
  colors: ColorId[];
  /** עלות משוערת בשקלים לרצועה, כולל משלוח מהספק */
  cost: number;
  costVerified: boolean;
  /** קישור לדף המוצר אצל הספק, אחרי שאומת */
  sourceUrl?: string;
  /** המידות אצל הספק עוד לא אומתו מול דף המוצר */
  sizesVerified: boolean;
};

export const products: Product[] = [
  {
    slug: "apple-silicone-sport",
    name: "רצועת סיליקון ספורט ל-Apple Watch",
    family: "apple",
    material: "silicone",
    description: "רצועה רכה וגמישה, עמידה במים ובזיעה. סגירה בפין וחורים, מתאימה לאימונים וליום יום.",
    features: ["עמידה במים ובזיעה", "סגירה בפין וחורים", "נכנסת לשעון בלחיצה"],
    sizes: appleSizes,
    colors: ["navy", "black", "white", "gray", "olive", "sand", "pink", "wine"],
    cost: 10,
    costVerified: false,
    sourceUrl: "https://he.aliexpress.com/item/1005006706836534.html",
    sizesVerified: false,
  },
  {
    slug: "apple-magnetic",
    name: "רצועה מגנטית ל-Apple Watch",
    family: "apple",
    material: "magnetic",
    description: "סגירה מגנטית בלי חורים ובלי אבזם. מתכווננת לכל היקף יד ונסגרת בתנועה אחת.",
    features: ["סוגר מגנטי", "מתכווננת לכל היקף יד", "בלי חורים"],
    sizes: appleSizes,
    colors: ["orange", "black", "navy", "olive", "sand", "pink"],
    cost: 12,
    costVerified: false,
    sourceUrl: "https://he.aliexpress.com/item/1005010439452171.html",
    sizesVerified: false,
  },
  {
    slug: "apple-nylon-loop",
    name: "רצועת ניילון רכה ל-Apple Watch",
    family: "apple",
    material: "nylon",
    description: "לולאה ארוגה ונושמת עם סגירת סקוץ׳. קלה מאוד, נוחה לשינה ולחום.",
    features: ["ארוג ונושם", "סגירת סקוץ׳", "קלה מאוד"],
    sizes: appleSizes,
    colors: ["sand", "black", "navy", "olive", "pink", "orange"],
    cost: 12,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "apple-milanese",
    name: "רצועת רשת מתכת (מילאנזית) ל-Apple Watch",
    family: "apple",
    material: "milanese",
    description: "רשת נירוסטה דקה עם סוגר מגנטי לאורך כל הרצועה. מראה מחויט לעבודה ולערב.",
    features: ["רשת נירוסטה", "סוגר מגנטי מתכוונן", "מראה מחויט"],
    sizes: appleSizes,
    colors: ["silver", "black", "graphite", "rose"],
    cost: 15,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "apple-leather",
    name: "רצועת עור ל-Apple Watch",
    family: "apple",
    material: "leather",
    description: "עור עם תפר ואבזם קלאסי. מתרכך עם הזמן ומתאים ליום יום ולמשרד.",
    features: ["עור עם תפר", "אבזם קלאסי", "מתרכך עם הזמן"],
    sizes: appleSizes,
    colors: ["brown", "tan", "black", "navy"],
    cost: 18,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "apple-link-bracelet",
    name: "צמיד חוליות מתכת ל-Apple Watch",
    family: "apple",
    material: "link",
    description: "חוליות נירוסטה עם סוגר מתקפל. את האורך מתאימים בהסרת חוליות.",
    features: ["חוליות נירוסטה", "סוגר מתקפל", "אורך מתכוונן"],
    sizes: appleSizes,
    colors: ["black", "silver", "rose"],
    cost: 25,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "quick-release-silicone",
    name: "רצועת סיליקון בשחרור מהיר, 20/22 מ״מ",
    family: "quick-release",
    material: "silicone",
    description: "רצועת סיליקון עם פינים לשחרור מהיר, בלי כלים. מתאימה לשעונים עם זיזים ברוחב 20 או 22 מ״מ.",
    features: ["שחרור מהיר בלי כלים", "עמידה במים", "20 או 22 מ״מ"],
    sizes: quickReleaseSizes,
    colors: ["olive", "black", "navy", "gray", "orange", "white"],
    cost: 8,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "quick-release-nylon",
    name: "רצועת ניילון בשחרור מהיר, 20/22 מ״מ",
    family: "quick-release",
    material: "nylon",
    description: "ניילון ארוג ונושם עם שחרור מהיר. קל, ומתייבש מהר אחרי אימון.",
    features: ["ארוג ונושם", "שחרור מהיר", "20 או 22 מ״מ"],
    sizes: quickReleaseSizes,
    colors: ["navy", "black", "olive", "sand"],
    cost: 10,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "quick-release-milanese",
    name: "רצועת רשת מתכת בשחרור מהיר, 20/22 מ״מ",
    family: "quick-release",
    material: "milanese",
    description: "רשת נירוסטה עם סוגר מגנטי ושחרור מהיר. הופכת שעון ספורט למראה מחויט.",
    features: ["רשת נירוסטה", "סוגר מגנטי", "שחרור מהיר"],
    sizes: quickReleaseSizes,
    colors: ["silver", "black", "graphite"],
    cost: 15,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "garmin-quickfit-silicone",
    name: "רצועת סיליקון QuickFit ל-Garmin",
    family: "garmin",
    material: "silicone",
    description: "רצועת סיליקון עם מחבר QuickFit שננעל בלחיצה. לאימונים, לשחייה ולטיולים.",
    features: ["מחבר QuickFit", "עמידה במים", "20, 22 או 26 מ״מ"],
    sizes: garminSizes,
    colors: ["orange", "black", "navy", "olive", "gray"],
    cost: 12,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "xiaomi-band-silicone",
    name: "רצועת סיליקון ל-Xiaomi Smart Band 8/9",
    family: "tracker",
    material: "silicone",
    description: "רצועה רכה לצמיד הכושר של Xiaomi. מחליפים בשנייה ומתאימים צבע לבגד.",
    features: ["רכה וקלה", "עמידה במים", "Smart Band 8 ו-9"],
    sizes: [{ id: "one", label: "Smart Band 8/9", detail: "מידה אחת, מתכווננת" }],
    colors: ["pink", "black", "navy", "olive", "white", "orange"],
    cost: 5,
    costVerified: false,
    sizesVerified: false,
  },
  {
    slug: "fitbit-charge-silicone",
    name: "רצועת סיליקון ל-Fitbit Charge 5/6",
    family: "tracker",
    material: "silicone",
    description: "רצועת ספורט לצמיד Fitbit Charge, במידה קטנה או גדולה.",
    features: ["רכה וקלה", "עמידה במים", "Charge 5 ו-6"],
    sizes: [
      { id: "s", label: "S", detail: "היקף יד קטן" },
      { id: "l", label: "L", detail: "היקף יד גדול" },
    ],
    colors: ["white", "black", "navy", "gray", "pink"],
    cost: 8,
    costVerified: false,
    sizesVerified: false,
  },
];

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function priceOf(p: Product) {
  return priceFor(p.cost);
}

export function caseKindOf(p: Product): CaseKind {
  return families[p.family].caseKind;
}

export const familyOrder: Family[] = ["apple", "quick-release", "garmin", "tracker"];
