# חנות: רצועות לשעון חכם

Next.js 16 עם Tailwind 4, RTL בעברית. חנות קטנה במבנה של דף מוצר באלי אקספרס: קטלוג של 12 רצועות זולות ל-Apple Watch, Samsung, Huawei, Amazfit, Garmin, Xiaomi ו-Fitbit, ודף לכל מוצר עם גלריה, בחירת צבע ומידה, והזמנה בוואטסאפ.

התוכנית העסקית ב-[PLAN.md](PLAN.md), המחקר בתיקייה [research](research), וכללי העיצוב ב-[DESIGN.md](DESIGN.md).

## הרצה

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # בדיקה לפני פריסה
npm run lint
```

## מה להשלים לפני השקה

פרטי העסק נמצאים ב-[lib/config.ts](lib/config.ts), והמוצרים ב-[lib/catalog.ts](lib/catalog.ts). כל שורה עם `TODO` היא placeholder.

| מה | איפה |
| --- | --- |
| שם המותג | `site.brandName` ב-config |
| שם, מספר עוסק, כתובת, טלפון, דוא"ל (חובה לפי חוק) | `business` ב-config |
| מספר וואטסאפ (972XXXXXXXXX) | `contact.whatsappNumber` ב-config |
| קישור תשלום Grow | `paymentLink` ב-config |
| אזור למסירה אישית | `delivery.personal.area` ב-config |
| תנאי אחריות | `warrantyText` ב-config |
| עלות, קישור לספק, צבעים ומידות לכל מוצר | `products` בקטלוג. ההסבר ב-[research/catalog.md](research/catalog.md) |
| מעבר ממצב טרום השקה למכירה (רק אחרי פתיחת עוסק) | `site.mode = "live"` ב-config |

## מחירים

המחיר מחושב מהעלות: בערך פי 2, מעוגל לסכום שנגמר ב-9, ולפחות ₪19. על זוג יש 10% הנחה. כשמעדכנים את `cost` של מוצר, המחיר מתעדכן בכל האתר ובתקנון. הפירוט ב-[research/catalog.md](research/catalog.md).

## שני מצבים

- **`waitlist`** (ברירת המחדל): אין מכירה ואין תשלום. הכפתור שולח בוואטסאפ "תעדכנו אותי" עם הבחירה של הלקוח, והדף לא מאונדקס בגוגל. אפשר להפעיל את זה עוד לפני שיש עוסק, כדי לבדוק ביקוש.
- **`live`**: הזמנה ותשלום. מוצגים אישור תקנון, פרטי העוסק בתחתית וכפתורי התשלום.

## תמונות

**תמונות אמיתיות** (מהדגימות, או של המוכר באישור שלו) מוסיפים עם פקודה אחת:

```bash
node scripts/add-photos.mjs apple-silicone-sport navy ~/Downloads/IMG_1201.jpg ~/Downloads/IMG_1202.jpg
node scripts/add-photos.mjs apple-silicone-sport all ~/Downloads/box.jpg   # תמונה לכל הצבעים
npm run build
```

- **מה הסקריפט עושה:** מסובב לפי המצלמה, מקטין ל-1600 פיקסלים, שומר כ-webp ומוחק את המידע שבקובץ, כולל מיקום GPS מהטלפון.
- **איפה הקבצים:** הקבצים נשמרים ב-`public/photos/<מוצר>/<צבע>-<מספר>.webp`.
- **איפה הן מופיעות:** בגלריה לפני התלת-ממד וההדמיות, בלי הכיתוב "הדמיה". גם בכרטיס בקטלוג ובתמונת השיתוף.
- **קבצי HEIC:** מאייפון לא נתמכים. מייצאים כ-JPG.

**הדמיות:** עד שיש תמונות אמיתיות, הגלריה מציגה את השעון בתלת-ממד (`lib/watchModel.ts`) ותמונות שצולמו ממנו, עם הכיתוב "הדמיה".
- כל מוצר מצולם בכל צבע משלוש זוויות, ב-1280 פיקסלים, לתוך `public/renders`.
- בנוסף נוצרת גרסה קטנה (`-thumb`) לכרטיסים ולבחירת הצבע.
- הגוף של Apple Watch בגימור שמתאים לרצועה (Midnight, Starlight או כסף). ההתאמה מוגדרת ב-`colors` שב-`lib/catalog.ts`.
- כשמוסיפים מוצר או צבע, מצלמים מחדש:

```bash
npm run build && npx next start -p 3200
node scripts/render-products.mjs http://localhost:3200 --concurrency 2   # בטרמינל אחר
```

הדף `/render` משמש רק לצילום הזה, ולא מאונדקס.

## דפים

- `/`: קטלוג, עם סינון לפי סוג שעון וחיפוש (`?family=`, `?q=`)
- `/p/<slug>`: דף מוצר והזמנה
- `/terms`: תקנון
- `/cancel`: ביטול עסקה
- `/privacy`: מדיניות פרטיות
- `/accessibility`: הצהרת נגישות

את הטקסטים המשפטיים כדאי שעורך דין יעבור עליהם לפני ההשקה.
