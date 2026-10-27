// כלל התמחור: בערך פי 2 מהעלות באלי אקספרס, מעוגל לסכום שנגמר ב-9, ולא פחות מ-₪19

const MIN_PRICE = 19;

// המספר הקטן ביותר שגדול או שווה ל-n ונגמר ב-9 (20 → 29, 19 → 19)
function upTo9(n: number) {
  return Math.ceil((n + 1) / 10) * 10 - 1;
}

// המספר הגדול ביותר שקטן או שווה ל-n ונגמר ב-9 (52.2 → 49)
function downTo9(n: number) {
  return Math.floor((n + 1) / 10) * 10 - 1;
}

export function priceFor(cost: number) {
  return Math.max(MIN_PRICE, upTo9(cost * 2));
}

// זוג: 10% פחות משתי רצועות, מעוגל כלפי מטה כדי שהחיסכון יישאר אמיתי
export function pairPrice(price: number) {
  return downTo9(2 * price * 0.9);
}

// מחיר לכמות: כל זוג במחיר זוג, והשארית במחיר רגיל
export function totalFor(price: number, qty: number) {
  return Math.floor(qty / 2) * pairPrice(price) + (qty % 2) * price;
}

export function savingFor(price: number, qty: number) {
  return qty * price - totalFor(price, qty);
}
