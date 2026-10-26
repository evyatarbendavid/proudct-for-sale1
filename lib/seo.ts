import { site } from "./config";

// canonical רק כשיש דומיין. בלעדיו Next משלים את הכתובת מהשרת המקומי, וזה שגוי בפרודקשן
export function canonical(path: string) {
  return site.url ? { alternates: { canonical: path } } : {};
}
