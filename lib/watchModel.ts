import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { colors, type CaseKind, type Material } from "./catalog";

// מודל השעון, משותף לאתר, לסרטון ולתמונות הגלריה. בלי לולאת רינדור: מי שמשתמש בו מזיז ומצייר.
// שלושה גופים (apple, round, tracker) ושישה חומרי רצועה. החלפת גוף או חומר = בנייה מחדש.
// הרצועה סוגרת לולאה סביב "פרק יד" מאחורי השעון, כמו בתמונות מוצר, והשעון עומד עליה.
// ראשית הצירים היא מרכז המודל כולו, כדי שהסיבוב יהיה סביב המרכז ולא סביב הגוף.

export type WatchSpec = { caseKind: CaseKind; material: Material; color: string };

type CaseGeom = {
  /** רוחב הרצועה */
  strapWidth: number;
  /** נקודת החיבור של הרצועה, בתוך הגוף: גובה ועומק */
  attachY: number;
  attachZ: number;
  /** חומרי הגוף שנצבעים לפי הרצועה (ב-apple) */
  caseMats: THREE.MeshPhysicalMaterial[];
};

const GLASS_BLACK = "#050506";
const DARK = "#141518";

// גימורי אלומיניום של Apple Watch, בקירוב. הבחירה לפי צבע הרצועה נמצאת בקטלוג (colors[].case)
const FINISH = { midnight: "#2b2f37", silver: "#d2d4d7", starlight: "#e0d5c1" } as const;
const ROUND_CASE = "#2a2c30";

/** צבע הגוף שמתאים לרצועה. Samsung ו-Garmin נשארים גרפיט, וצמיד הכושר שחור */
export function caseColorFor(caseKind: CaseKind, strapHex: string) {
  if (caseKind === "round") return ROUND_CASE;
  if (caseKind === "tracker") return DARK;
  const c = colors.find((x) => x.hex.toLowerCase() === strapHex.toLowerCase());
  return FINISH[c?.case ?? "silver"];
}

// ---------- טקסטורות מצוירות ----------

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function toTexture(c: HTMLCanvasElement, srgb = true, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

// במכשירי Apple יוצא הגופן של המערכת. בשאר המקומות הגופן של האתר, שגם נטען בסרטון
const FACE_FONT = `-apple-system, BlinkMacSystemFont, "IBM Plex Sans Hebrew", "Helvetica Neue", Arial, sans-serif`;

function fontsLoaded(): Promise<unknown> {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  const family = `"IBM Plex Sans Hebrew"`;
  return Promise.all([document.fonts.load(`400 40px ${family}`), document.fonts.load(`600 40px ${family}`)]).catch(() => {});
}

// פני שעון גנריים. ב-apple: פריסה מודולרית (תאריך, שעה, מזג אוויר ושלושה מדדים נפרדים).
// בלי לוגו, בלי פנים של watchOS ובלי טבעות פעילות
function drawFace(g: CanvasRenderingContext2D, kind: CaseKind, W: number, H: number) {
  const f = (weight: number, size: number) => `${weight} ${size}px ${FACE_FONT}`;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.textBaseline = "alphabetic";

  if (kind === "apple") {
    g.textAlign = "left";
    g.fillStyle = "#ff9f43";
    g.font = f(600, 30);
    g.fillText("TUE 27", 62, 104);
    g.textAlign = "right";
    g.fillStyle = "#f5f5f7";
    g.font = f(500, 98);
    g.fillText("10:09", 452, 150);

    // כרטיס מזג אוויר
    g.fillStyle = "#1c1c1e";
    g.beginPath();
    g.roundRect(46, 192, 420, 146, 32);
    g.fill();
    g.fillStyle = "#ffd60a";
    g.beginPath();
    g.arc(112, 265, 24, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#ffd60a";
    g.lineWidth = 6;
    g.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(112 + Math.cos(a) * 34, 265 + Math.sin(a) * 34);
      g.lineTo(112 + Math.cos(a) * 44, 265 + Math.sin(a) * 44);
      g.stroke();
    }
    g.textAlign = "left";
    g.fillStyle = "#f5f5f7";
    g.font = f(500, 76);
    g.fillText("24°", 170, 292);
    g.textAlign = "right";
    g.font = f(600, 30);
    g.fillText("Sunny", 440, 254);
    g.fillStyle = "#8e8e93";
    g.font = f(600, 26);
    g.fillText("H 27°  L 18°", 440, 298);

    // שלושה מדדים עגולים, כל אחד לבד
    const gauges: [number, number, string, string, string][] = [
      [120, 0.72, "#ff375f", "72", "BPM"],
      [256, 0.62, "#30d158", "8.4k", "STEPS"],
      [392, 0.86, "#64d2ff", "86%", "BATT"],
    ];
    for (const [x, frac, color, value, label] of gauges) {
      const y = 448;
      g.lineWidth = 11;
      g.strokeStyle = "#2c2c2e";
      g.beginPath();
      g.arc(x, y, 54, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = color;
      g.beginPath();
      g.arc(x, y, 54, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      g.stroke();
      g.textAlign = "center";
      g.fillStyle = "#f5f5f7";
      g.font = f(600, 32);
      g.fillText(value, x, y + 11);
      g.fillStyle = "#8e8e93";
      g.font = f(600, 20);
      g.fillText(label, x, y + 92);
    }
  } else if (kind === "round") {
    const cx = W / 2;
    g.textAlign = "center";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const major = i % 5 === 0;
      const r1 = 236;
      const r2 = major ? 206 : 222;
      g.strokeStyle = major ? "#e5e5e5" : "#5a5a5a";
      g.lineWidth = major ? 6 : 3;
      g.beginPath();
      g.moveTo(cx + Math.sin(a) * r1, cx - Math.cos(a) * r1);
      g.lineTo(cx + Math.sin(a) * r2, cx - Math.cos(a) * r2);
      g.stroke();
    }
    g.fillStyle = "#ff9f43";
    g.font = f(600, 34);
    g.fillText("TUE 27", cx, 180);
    g.fillStyle = "#f5f5f7";
    g.font = f(600, 130);
    g.fillText("10:09", cx, 300);
    g.fillStyle = "#8e8e93";
    g.font = f(500, 34);
    g.fillText("♥ 72   8,412", cx, 370);
  } else {
    g.textAlign = "center";
    g.fillStyle = "#f5f5f7";
    g.font = f(600, 120);
    g.fillText("10", W / 2, 250);
    g.fillText("09", W / 2, 380);
    g.fillStyle = "#ff9f43";
    g.font = f(600, 34);
    g.fillText("TUE 27", W / 2, 120);
    g.fillStyle = "#30d158";
    g.font = f(600, 40);
    g.fillText("8,412", W / 2, 520);
    g.fillStyle = "#8e8e93";
    g.font = f(500, 26);
    g.fillText("STEPS", W / 2, 560);
  }
}

/** הטקסטורה מצוירת מיד, ושוב כשהגופן נטען. ready מסתיים אחרי הציור השני */
function faceTexture(kind: CaseKind) {
  // ב-apple: יחס הזכוכית (0.962 על 1.135)
  const W = kind === "tracker" ? 256 : 512;
  const H = kind === "apple" ? 604 : kind === "round" ? 512 : 712;
  const { c, g } = canvas(W, H);
  drawFace(g, kind, W, H);
  const texture = toTexture(c);
  const ready = fontsLoaded().then(() => {
    drawFace(g, kind, W, H);
    texture.needsUpdate = true;
  });
  return { texture, ready };
}

function shadowTexture() {
  const { c, g } = canvas(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(14,16,19,0.42)");
  grad.addColorStop(0.35, "rgba(14,16,19,0.2)");
  grad.addColorStop(1, "rgba(14,16,19,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// חריצים בכתר הדיגיטלי
function ridgeTexture() {
  const { c, g } = canvas(128, 16);
  for (let x = 0; x < 128; x += 4) {
    g.fillStyle = x % 8 === 0 ? "#fff" : "#000";
    g.fillRect(x, 0, 4, 16);
  }
  return toTexture(c, false);
}

// טקסטורות רצועה בגווני אפור: מוכפלות בצבע של הרצועה
function weaveTexture() {
  const { c, g } = canvas(64, 64);
  g.fillStyle = "#e9e9e9";
  g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 4) {
    g.fillStyle = y % 8 === 0 ? "rgba(0,0,0,.16)" : "rgba(255,255,255,.35)";
    g.fillRect(0, y, 64, 2);
  }
  for (let x = 0; x < 64; x += 8) {
    g.fillStyle = "rgba(0,0,0,.08)";
    g.fillRect(x, 0, 1, 64);
  }
  return toTexture(c, true, [3, 30]);
}

function meshTexture() {
  const { c, g } = canvas(64, 64);
  g.fillStyle = "#dcdcdc";
  g.fillRect(0, 0, 64, 64);
  // שתי שכבות אלכסון, כמו חוטי מתכת שזורים. עבה מספיק כדי להיראות גם בתמונה קטנה
  g.lineWidth = 2;
  for (const [dir, alpha] of [[1, 0.5], [-1, 0.22]] as const) {
    g.strokeStyle = `rgba(0,0,0,${alpha})`;
    for (let i = -64; i < 128; i += 8) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + dir * 64, 64);
      g.stroke();
    }
  }
  return toTexture(c, true, [3, 46]);
}

function leatherTexture() {
  const { c, g } = canvas(128, 512);
  g.fillStyle = "#e6e6e6";
  g.fillRect(0, 0, 128, 512);
  // גרעין עור דטרמיניסטי
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.05})`;
    g.fillRect(rnd() * 128, rnd() * 512, 2 + rnd() * 3, 1 + rnd() * 2);
  }
  // תפר לאורך שני הצדדים
  g.strokeStyle = "rgba(255,255,255,.85)";
  g.lineWidth = 3;
  g.setLineDash([10, 8]);
  for (const x of [14, 114]) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 512);
    g.stroke();
  }
  return toTexture(c, true, [1, 3]);
}

// ---------- גאומטריה של רצועה ----------

/**
 * גוף עבה לאורך עקומה במישור YZ, עם חתך אצטדיון ו-UV (u לרוחב, v לאורך).
 * roundEnd: הקצה מתעגל כמו קצה של רצועה אמיתית
 */
function strapGeometry(curve: THREE.Curve<THREE.Vector3>, width: number, thick: number, roundEnd = false, segments = 120) {
  const r = thick / 2;
  const hw = width / 2 - r;
  const profile: [number, number, number][] = [];
  const arc = 8;
  for (let i = 0; i <= arc; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / arc;
    profile.push([hw + r * Math.cos(a), r * Math.sin(a), 0]);
  }
  for (let i = 0; i <= arc; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / arc;
    profile.push([-hw + r * Math.cos(a), r * Math.sin(a), 0]);
  }
  // u לפי המיקום לרוחב, כדי שהטקסטורה (תפר, אריגה) תשב נכון על הפנים
  for (const p of profile) p[2] = (p[0] + width / 2) / width;

  // החלק האחרון באורך חצי רוחב מתעגל לחצי עיגול
  const tRound = roundEnd ? 1 - width / 2 / curve.getLength() : 2;

  const ring = profile.length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const xAxis = new THREE.Vector3(1, 0, 0);
  const normal = new THREE.Vector3();

  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    normal.crossVectors(xAxis, tangent).normalize();
    const k = t > tRound ? Math.sqrt(Math.max(0, 1 - ((t - tRound) / (1 - tRound)) ** 2)) : 1;
    for (const [u, v, uu] of profile) {
      positions.push(p.x + u * k, p.y + normal.y * v, p.z + normal.z * v);
      uvs.push(uu, t);
    }
  }
  for (let s = 0; s < segments; s++) {
    for (let i = 0; i < ring; i++) {
      const a = s * ring + i;
      const b = s * ring + ((i + 1) % ring);
      const c = (s + 1) * ring + i;
      const d = (s + 1) * ring + ((i + 1) % ring);
      indices.push(a, c, b, b, c, d);
    }
  }
  const end = curve.getPointAt(1);
  const center = positions.length / 3;
  positions.push(end.x, end.y, end.z);
  uvs.push(0.5, 1);
  const last = segments * ring;
  for (let i = 0; i < ring; i++) indices.push(center, last + i, last + ((i + 1) % ring));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function frameAt(curve: THREE.Curve<THREE.Vector3>, t: number) {
  const p = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t);
  const normal = new THREE.Vector3().crossVectors(new THREE.Vector3(1, 0, 0), tangent).normalize();
  return { p, tangent, normal };
}

function orient(obj: THREE.Object3D, curve: THREE.Curve<THREE.Vector3>, t: number, lift = 0) {
  const { p, tangent, normal } = frameAt(curve, t);
  obj.position.copy(p).addScaledVector(normal, lift);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), tangent, normal));
}

// "פרק היד" שהרצועה מקיפה: חצי לולאה מהצד של הגוף ועד מרכז הגב (y, z)
const WRIST: [number, number][] = [
  [0.74, -0.2],
  [0.8, -0.42],
  [0.77, -0.66],
  [0.66, -0.88],
  [0.46, -1.05],
  [0.22, -1.15],
  [0, -1.19],
];
const WRIST_CENTER = new THREE.Vector3(0, 0, -0.62);

/**
 * שני חלקי הרצועה. העליון נגמר קצת אחרי מרכז הגב. התחתון ממשיך מעליו, מוסט החוצה בעובי הרצועה,
 * כמו רצועה סגורה על היד. overlap=false: שני החלקים נפגשים במרכז הגב (חוליות)
 */
function strapLoop(geom: CaseGeom, thick: number, overlap: boolean) {
  const s = geom.attachY;
  const z0 = geom.attachZ;
  const half = (sign: number): [number, number][] => [[s, z0], [s + 0.14, z0 - 0.04], ...WRIST].map(([y, z]) => [sign * y, z]);
  const toCurve = (pts: [number, number][]) => new THREE.CatmullRomCurve3(pts.map(([y, z]) => new THREE.Vector3(0, y, z)), false, "centripetal");

  if (!overlap) return { top: toCurve(half(1)), bottom: toCurve(half(-1)) };

  const top = toCurve([...half(1), [-0.12, -1.185]]);
  const rough = toCurve([...half(-1), [0.14, -1.185], [0.3, -1.168]]);
  // הקטע שעובר מעל החלק העליון מורם החוצה מהמרכז של פרק היד
  const lifted = rough.getSpacedPoints(80).map((p) => {
    const ramp = THREE.MathUtils.smoothstep(p.y, -0.34, -0.12);
    const out = new THREE.Vector3(0, p.y - WRIST_CENTER.y, p.z - WRIST_CENTER.z).normalize();
    return p.clone().addScaledVector(out, ramp * thick * 1.02);
  });
  return { top, bottom: new THREE.CatmullRomCurve3(lifted, false, "centripetal") };
}

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// ShapeGeometry נותן UV בקואורדינטות העולם. ממפים ל-0..1 כדי שהטקסטורה תכסה את המסך
function normalizeUVs(geometry: THREE.BufferGeometry, w: number, h: number) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5);
  uv.needsUpdate = true;
}

// ---------- גוף השעון ----------

/** קו מתאר "squircle" (סופר-אליפסה), הצורה של Apple Watch מלפנים */
function squircle(a: number, b: number, n = 5, segments = 192) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    pts.push(new THREE.Vector2(a * Math.sign(c) * Math.abs(c) ** (2 / n), b * Math.sign(s) * Math.abs(s) ** (2 / n)));
  }
  return pts;
}

/**
 * משטח שעובר דרך טבעות: כל טבעת היא קו המתאר מוקטן פי k בגובה z (rings: x=k, y=z).
 * כך נבנים הדפנות המעוגלות, כיפת הזכוכית והגב. uvSize: UV מישורי לפי x,y (למסך)
 */
function sweep(outline: THREE.Vector2[], rings: THREE.Vector2[], uvSize?: [number, number]) {
  const n = outline.length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (const r of rings) {
    for (const p of outline) {
      const x = p.x * r.x;
      const y = p.y * r.x;
      positions.push(x, y, r.y);
      uvs.push(uvSize ? x / uvSize[0] + 0.5 : 0, uvSize ? y / uvSize[1] + 0.5 : 0);
    }
  }
  for (let j = 0; j < rings.length - 1; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * n + i;
      const b = j * n + ((i + 1) % n);
      const c = (j + 1) * n + i;
      const d = (j + 1) * n + ((i + 1) % n);
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);
const profile = (pts: THREE.Vector2[], count: number) => new THREE.SplineCurve(pts).getPoints(count);

function screenMaterial(kind: CaseKind) {
  // המסך מאיר בעצמו: לא מושפע מתאורה ולא מ-tone mapping, כדי שהלבן יישאר חד
  const face = faceTexture(kind);
  return { material: new THREE.MeshBasicMaterial({ map: face.texture, toneMapped: false }), ready: face.ready };
}

const reflectMat = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.1,
    roughness: 0.02,
    metalness: 0,
    clearcoat: 1,
    depthWrite: false,
  });

const glassMat = () =>
  new THREE.MeshPhysicalMaterial({ color: GLASS_BLACK, roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 });

const darkMat = () => new THREE.MeshStandardMaterial({ color: "#0b0b0c", roughness: 0.6 });

function named<T extends THREE.Object3D>(obj: T, name: string) {
  obj.name = name;
  return obj;
}

// Apple Watch Series 10, 46 מ"מ: 46×39×9.7 מ"מ. יחידה אחת = 39 מ"מ
function buildAppleCase(group: THREE.Group, caseColor: string) {
  const metal = new THREE.MeshPhysicalMaterial({ color: caseColor, metalness: 1, roughness: 0.3, clearcoat: 0.15, clearcoatRoughness: 0.4 });
  const outline = squircle(0.5, 0.59);

  // דפנות האלומיניום: מתעגלות מהגב, הכי רחבות באמצע, ונכנסות קצת לפני הזכוכית
  const sideRings = profile([v2(0.84, -0.125), v2(0.93, -0.108), v2(0.982, -0.075), v2(1, -0.03), v2(0.997, 0.02), v2(0.982, 0.06), v2(0.962, 0.088)], 32);
  group.add(named(new THREE.Mesh(sweep(outline, sideRings), metal), "case"));

  // הזכוכית: כיפה שקצותיה מתעגלים אל הגוף. פני השעון זוהרים מתחתיה (emissiveMap), וההשתקפויות מעליהם
  const glassRings = profile([v2(0.962, 0.088), v2(0.946, 0.104), v2(0.912, 0.116), v2(0.84, 0.124), v2(0.6, 0.129), v2(0.3, 0.131), v2(0, 0.1315)], 28);
  const face = faceTexture("apple");
  // שכבת השתקפות אחת ועדינה, כדי שההברקה לא תשטוף את המסך
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#000000",
    roughness: 0.05,
    metalness: 0,
    specularIntensity: 0.55,
    emissive: "#ffffff",
    emissiveMap: face.texture,
    emissiveIntensity: 1,
  });
  group.add(named(new THREE.Mesh(sweep(outline, glassRings, [0.962, 1.135]), glass), "glass"));

  // גב: קרמיקה שחורה עם כיפת חיישן, מבריקה רק מעט. הטבעות מהמרכז החוצה, כדי שהמשטח יפנה אחורה
  const backRings = profile([v2(0, -0.152), v2(0.4, -0.15), v2(0.66, -0.143), v2(0.78, -0.134), v2(0.84, -0.125)], 18);
  const backMat = new THREE.MeshPhysicalMaterial({ color: "#0e0e10", roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  group.add(named(new THREE.Mesh(sweep(outline, backRings), backMat), "back"));

  // כתר דיגיטלי עם חריצים, בצבע הגוף, ופס כהה דק בינו לבין הגוף
  const ridges = ridgeTexture();
  ridges.wrapS = THREE.RepeatWrapping;
  ridges.repeat.set(12, 1);
  const crownMat = metal.clone();
  crownMat.bumpMap = ridges;
  crownMat.bumpScale = 0.5;
  const crown = named(new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.07, 64), crownMat), "crown");
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.535, 0.24, -0.025);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.083, 0.012, 48), darkMat());
  collar.rotation.z = Math.PI / 2;
  collar.position.set(0.503, 0.24, -0.025);
  group.add(crown, collar);

  // כפתור צד שטוח וארוך, עם מסגרת כהה דקה
  const button = new THREE.Mesh(new RoundedBoxGeometry(0.026, 0.23, 0.068, 3, 0.012), metal);
  button.position.set(0.5, -0.1, -0.03);
  const buttonGap = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.245, 0.08, 3, 0.014), darkMat());
  buttonGap.position.set(0.496, -0.1, -0.03);
  group.add(button, buttonGap);

  // מיקרופון בין הכתר לכפתור, ושני חריצי רמקול בצד השני
  const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 12), darkMat());
  mic.rotation.z = Math.PI / 2;
  mic.position.set(0.5, 0.075, -0.03);
  group.add(mic);
  for (const y of [0.09, -0.09]) {
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.14, 0.022, 2, 0.009), darkMat());
    slot.position.set(-0.5, y, -0.03);
    group.add(slot);
  }

  // החריץ שאליו הרצועה נכנסת, בחלק התחתון של הדופן
  for (const y of [0.56, -0.56]) {
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.05, 0.07, 2, 0.02), darkMat());
    slot.position.set(0, y, -0.085);
    group.add(slot);
  }

  return {
    geom: { strapWidth: 0.6, attachY: 0.47, attachZ: -0.06, caseMats: [metal, crownMat] } satisfies CaseGeom,
    ready: face.ready,
  };
}

function buildCase(kind: CaseKind, group: THREE.Group, caseColor: string): { geom: CaseGeom; ready: Promise<unknown> } {
  if (kind === "apple") return buildAppleCase(group, caseColor);

  const metal = new THREE.MeshPhysicalMaterial({
    color: caseColor,
    metalness: 0.9,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
  });

  if (kind === "round") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.6, 0.3, 64), metal);
    body.rotation.x = Math.PI / 2;
    group.add(named(body, "case"));
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 64), glassMat());
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 0.16;
    group.add(glass);
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.575, 0.04, 16, 96), metal);
    bezel.position.z = 0.16;
    group.add(bezel);
    const screen = screenMaterial("round");
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.47, 64), screen.material);
    face.position.z = 0.1805;
    group.add(face);
    const reflect = new THREE.Mesh(new THREE.CircleGeometry(0.54, 64), reflectMat());
    reflect.position.z = 0.182;
    group.add(reflect);
    // שני כפתורים בצד
    for (const a of [0.45, -0.45]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 24), metal);
      b.rotation.z = Math.PI / 2;
      b.position.set(Math.cos(a) * 0.64, Math.sin(a) * 0.64, 0);
      group.add(b);
    }
    // ארבעה זיזים שאליהם הרצועה מתחברת
    for (const sx of [0.37, -0.37]) {
      for (const sy of [0.56, -0.56]) {
        const lug = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.2, 0.14, 2, 0.04), metal);
        lug.position.set(sx, sy, -0.04);
        group.add(lug);
      }
    }
    return { geom: { strapWidth: 0.6, attachY: 0.52, attachZ: -0.04, caseMats: [] }, ready: screen.ready };
  }

  // צמיד כושר: גוף צר וארוך, כולו זכוכית מקדימה
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.46, 1.1, 0.22, 8, 0.11), glassMat());
  group.add(named(body, "case"));
  const sw = 0.3;
  const sh = 0.84;
  const screenGeo = new THREE.ShapeGeometry(roundedRectShape(sw, sh, 0.12), 16);
  normalizeUVs(screenGeo, sw, sh);
  const screen = screenMaterial("tracker");
  const face = new THREE.Mesh(screenGeo, screen.material);
  face.position.z = 0.1105;
  group.add(face);
  const reflect = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(0.4, 1.0, 0.18), 16), reflectMat());
  reflect.position.z = 0.112;
  group.add(reflect);
  return { geom: { strapWidth: 0.44, attachY: 0.44, attachZ: -0.03, caseMats: [] }, ready: screen.ready };
}

// ---------- הרצועה ----------

const THICKNESS: Record<Material, number> = {
  silicone: 0.075,
  magnetic: 0.075,
  nylon: 0.07,
  leather: 0.065,
  milanese: 0.045,
  link: 0.1,
};

type StrapParts = { paint(c: THREE.Color): void };

function buildStrap(material: Material, geom: CaseGeom, group: THREE.Group, initial: THREE.Color): StrapParts {
  const w = geom.strapWidth;
  const thick = THICKNESS[material];
  const isMetal = material === "milanese" || material === "link";
  const { top, bottom } = strapLoop(geom, thick, material !== "link");

  const mat = new THREE.MeshPhysicalMaterial({
    color: initial,
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.5,
    sheen: 0.5,
    sheenRoughness: 0.6,
    side: THREE.DoubleSide,
  });
  if (material === "nylon") {
    mat.map = weaveTexture();
    mat.bumpMap = mat.map;
    mat.bumpScale = 0.4;
    mat.roughness = 0.92;
    mat.clearcoat = 0;
    mat.sheen = 0.8;
  } else if (material === "leather") {
    mat.map = leatherTexture();
    mat.bumpMap = mat.map;
    mat.bumpScale = 0.3;
    mat.roughness = 0.55;
    mat.clearcoat = 0.35;
    mat.sheen = 0.2;
  } else if (material === "milanese") {
    mat.map = meshTexture();
    mat.bumpMap = mat.map;
    mat.bumpScale = 0.5;
    mat.metalness = 0.95;
    mat.roughness = 0.34;
    mat.clearcoat = 0;
    mat.sheen = 0;
  }

  const metalAccent = new THREE.MeshPhysicalMaterial({ color: initial, metalness: 0.95, roughness: 0.28 });
  const holeMat = new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.9 });
  const yAxis = new THREE.Vector3(0, 1, 0);

  if (material === "link") {
    // שרשרת סגורה של חוליות, וסוגר במרכז הגב
    const linkGeo = new RoundedBoxGeometry(w, 0.13, thick, 2, 0.025);
    for (const curve of [top, bottom]) {
      const count = Math.round(curve.getLength() / 0.15);
      for (let i = 0; i < count; i++) {
        const link = new THREE.Mesh(linkGeo, metalAccent);
        link.name = "link";
        orient(link, curve, (i + 0.5) / count);
        group.add(link);
      }
    }
    const clasp = new THREE.Mesh(new RoundedBoxGeometry(w + 0.02, 0.2, thick * 1.3, 3, 0.03), metalAccent);
    orient(clasp, top, 1);
    clasp.name = "clasp";
    group.add(clasp);
  } else {
    // החלק העליון נגמר מתחת לתחתון, ולכן רק לתחתון יש קצה מעוגל גלוי
    group.add(
      named(new THREE.Mesh(strapGeometry(top, w, thick), mat), "strap-top"),
      named(new THREE.Mesh(strapGeometry(bottom, w, thick, true), mat), "strap-bottom"),
    );
  }

  if (material === "silicone") {
    // חורים בחלק התחתון, באזור שעובר בגב
    const holeGeo = new THREE.CylinderGeometry(0.026, 0.026, thick * 1.08, 20);
    for (let i = 0; i < 7; i++) {
      const { p, normal } = frameAt(bottom, 0.66 + i * 0.042);
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.name = "hole";
      hole.position.copy(p);
      hole.quaternion.setFromUnitVectors(yAxis, normal);
      group.add(hole);
    }
  }

  if (material === "magnetic" || material === "milanese") {
    // סוגר מגנטי בקצה. ברשת המתכת הוא בצבע הרצועה
    const claspMat = material === "milanese" ? metalAccent : new THREE.MeshPhysicalMaterial({ color: "#1b1c1f", metalness: 0.7, roughness: 0.35 });
    const clasp = new THREE.Mesh(new RoundedBoxGeometry(w + 0.02, 0.22, thick * 1.7, 3, 0.03), claspMat);
    orient(clasp, bottom, 0.975);
    clasp.name = "clasp";
    group.add(clasp);
  }

  if (material === "leather") {
    // אבזם בקצה של החלק העליון. החלק התחתון עובר דרכו, ולולאת עור קטנה מחזיקה את הקצה
    const outer = roundedRectShape(w + 0.1, 0.24, 0.05);
    outer.holes.push(roundedRectShape(w + 0.02, 0.13, 0.025) as unknown as THREE.Path);
    const buckle = new THREE.Mesh(
      new THREE.ExtrudeGeometry(outer, { depth: 0.03, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }),
      new THREE.MeshPhysicalMaterial({ color: "#c9ccd1", metalness: 0.95, roughness: 0.25 }),
    );
    orient(buckle, top, 0.985, thick * 0.55);
    buckle.name = "buckle";
    const keeper = new THREE.Mesh(new RoundedBoxGeometry(w + 0.03, 0.06, thick * 2.9, 2, 0.02), mat);
    orient(keeper, top, 0.93, thick * 0.5);
    keeper.name = "keeper";
    group.add(buckle, keeper);
  }

  return {
    paint(c) {
      mat.color.copy(c);
      if (isMetal) metalAccent.color.copy(c);
      else holeMat.color.copy(c).multiplyScalar(0.35);
    },
  };
}

// ---------- סביבת צילום ----------

// סטודיו לצילום מוצר: חדר כהה עם משטחי אור גדולים. הם יוצרים את פסי ההברקה על דפנות האלומיניום ועל הזכוכית
export function studioEnvironment() {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), new THREE.MeshBasicMaterial({ color: "#3d3f43", side: THREE.BackSide }));
  scene.add(room);
  const panel = (w: number, h: number, intensity: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(7, 7, 3.2, [0, 6, 1]); // מלמעלה
  panel(1.6, 8, 7, [-6, 0.5, 2]); // פס משמאל
  panel(1.6, 8, 5, [6, 0.5, -1]); // פס מימין
  panel(8, 2.4, 1.4, [0, -1, 6.5]); // מילוי מקדימה
  panel(4, 4, 3, [0, 2.5, -6.5]); // אור אחורי
  // רצפה בהירה, כמו משטח לבן בסטודיו: רצועות מתכת משקפות אותה ולא נראות כהות מלמטה
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color("#c4c6ca").multiplyScalar(1.1) }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5;
  scene.add(floor);
  return scene;
}

// ---------- המודל ----------

export type WatchModel = {
  watch: THREE.Group;
  shadow: THREE.Mesh;
  /** צובע את הרצועה, ואם צריך גם את הגוף (בלי caseColor הגוף נשאר כמו שהוא) */
  paint(strap: THREE.Color, caseColor?: THREE.Color): void;
  /** מסתיים אחרי שפני השעון צוירו מחדש בגופן הנכון */
  ready: Promise<unknown>;
  dispose(): void;
};

export function buildWatch(spec: WatchSpec): WatchModel {
  const watch = new THREE.Group();
  const inner = new THREE.Group();
  watch.add(inner);
  const { geom, ready } = buildCase(spec.caseKind, inner, caseColorFor(spec.caseKind, spec.color));
  const strap = buildStrap(spec.material, geom, inner, new THREE.Color(spec.color));

  // מרכז המודל בראשית, כדי שהסיבוב יהיה סביב השעון והלולאה יחד
  const box = new THREE.Box3().setFromObject(inner);
  const center = box.getCenter(new THREE.Vector3());
  inner.position.sub(center);

  // צל רך מתחת לנקודה הנמוכה, שם השעון עומד על הרצועה
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, box.min.y - center.y - 0.01, 0);

  return {
    watch,
    shadow,
    ready,
    paint(strapColor, caseColor) {
      strap.paint(strapColor);
      if (caseColor) for (const m of geom.caseMats) m.color.copy(caseColor);
    },
    dispose() {
      for (const root of [watch, shadow]) {
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          m.geometry.dispose();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
            mat.dispose();
          }
        });
      }
    },
  };
}
