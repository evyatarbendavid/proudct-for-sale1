# דף נחיתה: רצועות לשעון חכם

Next.js 16 עם Tailwind 4, RTL בעברית. התוכנית העסקית ב-[PLAN.md](PLAN.md), והמחקר בתיקייה [research](research).

## הרצה

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # בדיקה לפני פריסה
npm run lint
```

## מה להשלים לפני השקה

כל הנתונים נמצאים בקובץ אחד: [lib/config.ts](lib/config.ts). כל שורה עם `TODO` היא placeholder.

| מה | איפה בקובץ |
| --- | --- |
| שם המותג | `site.brandName` |
| שם, מספר עוסק, כתובת, טלפון, דוא"ל (חובה לפי חוק) | `business` |
| מספר וואטסאפ (972XXXXXXXXX) | `contact.whatsappNumber` |
| קישורי תשלום Grow לכל חבילה | `paymentLinks` |
| מידות לכל סוג, לאמת מול אלי אקספרס | `bandTypes` |
| 8–10 הצבעים אחרי הדגימות | `colors` |
| אזור למסירה אישית | `delivery.personal.area` |
| תנאי אחריות | `warrantyText` |
| הסרת פס "הדף בבנייה" והפעלת אינדוקס בגוגל | `site.isDraft = false` |

התמונות בדף הן הדמיה גרפית (`app/components/BandPreview.tsx`). אחרי שהדגימות מגיעות, מחליפים בתמונות ובסרטון אמיתיים.

## דפים

- `/`: דף המוצר וההזמנה
- `/terms`: תקנון
- `/cancel`: ביטול עסקה
- `/privacy`: מדיניות פרטיות
- `/accessibility`: הצהרת נגישות

את הטקסטים המשפטיים כדאי שעורך דין יעבור עליהם לפני ההשקה.
