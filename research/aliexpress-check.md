# הוראה לסשן עם Claude in Chrome: בדיקת 12 הרצועות באלי אקספרס

המסמך הזה מיועד ל-Claude Code שרץ על המחשב עם התוסף של כרום (`claude --chrome`, או `/chrome` ← Enabled by default). בסשן בענן אין גישה לכרום, ואלי אקספרס חוסם שם בבדיקת בוט. ההסבר ב-[README](../README.md#עבודה-עם-התוסף-של-כרום).

**איך מתחילים:** בסשן המקומי כותבים: "קרא את research/aliexpress-check.md ובצע".

## המטרה
לכל מוצר ב-[lib/catalog.ts](../lib/catalog.ts) (12 מוצרים, לפי `slug`) למצוא מוכר אמיתי באלי אקספרס, ולרשום:
- כמה זה עולה לנו באמת,
- אילו צבעים ומידות קיימים בפועל.

המחיר באתר מחושב מהעלות (`priceFor` ב-[lib/pricing.ts](../lib/pricing.ts)), ולכן מתעדכן לבד.

## כללים בדפדפן
- **טאב חדש.** לא נוגעים בטאבים של המשתמש.
- **רק באלי אקספרס.** עובדים בכתובות he.aliexpress.com או aliexpress.com.
- **CAPTCHA, התחברות או שאלת הרשאה:** עוצרים ומבקשים מהמשתמש לטפל בזה. לא עוקפים.
- **אסור:** לקנות, לשנות כתובת או פרטי תשלום, לשלוח הודעות למוכרים, או להוסיף לרשימת משאלות.
  - **עגלה:** מותר להוסיף לעגלה כדי לראות מחיר סופי עם משלוח, ובסוף מוציאים מהעגלה.
- **כתובת המשלוח:** בודקים שהיא ישראל ("Ship to Israel"), כדי שהמחיר והמשלוח יהיו נכונים.
- **תמונות:** לא מורידים תמונות של מוכרים. מותר לשמור קישור לתמונה ב-notes לעיון בלבד. תמונות לאתר נכנסות רק דרך `scripts/add-photos.mjs`, מדגימות או באישור של המוכר.

## לכל מוצר
1. **חיפוש** לפי סוג הרצועה והשעון. דוגמאות:

   | slug | חיפוש |
   |---|---|
   | apple-silicone-sport | apple watch sport band silicone |
   | apple-magnetic | apple watch magnetic silicone band |
   | apple-nylon-loop | apple watch nylon sport loop |
   | apple-milanese | apple watch milanese loop |
   | apple-leather | apple watch leather band |
   | apple-link-bracelet | apple watch link bracelet stainless |
   | quick-release-silicone | 20mm 22mm quick release silicone strap samsung |
   | quick-release-nylon | 20mm 22mm quick release nylon strap |
   | quick-release-milanese | 20mm 22mm milanese strap quick release |
   | garmin-quickfit-silicone | garmin quickfit silicone band 22mm |
   | xiaomi-band-silicone | xiaomi smart band 9 strap silicone |
   | fitbit-charge-silicone | fitbit charge 6 band silicone |

2. **בחירת מוכר**, בסדר העדיפות הזה:
   1. דירוג 4.7 ומעלה.
   2. הרבה ביקורות עם תמונות של קונים.
   3. משלוח לישראל, בעדיפות ל-AliExpress Standard Shipping או Choice.
   4. מחיר נמוך.

   אם הרשימה הראשונה הכי זולה אבל עם מעט ביקורות, עדיף מוכר עם הרבה ביקורות ומחיר מעט יותר גבוה.
3. **מה רושמים** (בשקלים, כמו שמוצג למשתמש):
   - `unitCost`: מחיר לרצועה אחת כולל משלוח לישראל, כמו שמוצג בעגלה.
   - `pairCost`: אותו דבר לשתי רצועות (לפעמים יש הנחת כמות).
   - `shippingDays`: טווח הימים שמוצג.
   - `store`: שם החנות, ו-`rating` ו-`orders` כמו שמוצג (למחקר בלבד, לא לאתר).
   - `colorsAvailable`: אילו מהצבעים שלנו קיימים אצל המוכר. משתמשים במזהים מ-`colors` בקטלוג: black, white, gray, navy, olive, sand, pink, wine, orange, brown, tan, silver, graphite, rose. צבע קרוב מספיק נחשב (למשל "Midnight Blue" = navy). צבע שלא קיים לא נכנס.
   - `sizes`: המידות שהמוכר מציע, בניסוח שלו. ב-Apple Watch בודקים במיוחד את 42 מ״מ: האם זה של סדרה 10 (קבוצה קטנה) או של סדרות 1–3 (קבוצה גדולה).
   - `url`: קישור נקי למוצר, בלי פרמטרים של מעקב: `https://he.aliexpress.com/item/<מספר>.html`.
   - `notes`: כל דבר חשוב (למשל "הצבע בתמונה שונה מהביקורות", "מידה 49 מ״מ חסרה").
4. **אין מוכר טוב?** כותבים את זה ב-notes עם `url: null`. לא ממציאים נתונים.

## פלט
1. **`research/aliexpress-results.json`:** מערך של אובייקטים, אחד לכל slug:
   ```json
   { "slug": "apple-silicone-sport", "url": "https://he.aliexpress.com/item/....html", "store": "...", "rating": 4.8, "orders": "5,000+",
     "unitCost": 11.9, "pairCost": 21.5, "shippingDays": "10-15", "colorsAvailable": ["black", "navy"], "sizes": ["38/40/41mm", "42/44/45/46/49mm"],
     "checkedAt": "YYYY-MM-DD", "notes": "" }
   ```
2. **`research/catalog.md`:** מעדכנים את טבלת "המוצרים" עם העלות האמיתית והקישור, ומוסיפים שורת תאריך בדיקה.
3. **`lib/catalog.ts`**, לכל מוצר שנמצא לו מוכר:
   - `cost`: `unitCost`, מעוגל לשקל השלם הקרוב.
   - `sourceUrl`: הקישור.
   - `costVerified: true`.
   - `colors`: רק צבעים שקיימים. שומרים על הצבע הראשון אם הוא עדיין קיים, כי הוא צבע ברירת המחדל בכרטיס.
   - `sizesVerified: true` אם המידות תואמות. אם לא, מעדכנים את `sizes` או כותבים הערה.
   - לא משנים מוצרים שלא נמצא להם מוכר.

## סיום
1. `npm run lint && npx tsc --noEmit && npm run build`
2. **אם נוסף צבע חדש למוצר:** צריך הדמיות. מריצים `npx next start -p 3200`, ובטרמינל אחר `node scripts/render-products.mjs http://localhost:3200`. אם צבעים רק הוסרו, אין צורך.
3. **commit ו-push** לאותו ענף, עם הודעה שמסכמת כמה מוצרים אומתו ומה המחירים החדשים.
4. **סיכום למשתמש:**
   - טבלה: מוצר, עלות, מחיר באתר, קישור.
   - מה לא נמצא.
   - מחירים שקפצו הרבה מההערכה.
