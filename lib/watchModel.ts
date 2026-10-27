import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { CaseKind, Material } from "./catalog";

// מודל השעון, משותף לאתר, לסרטון ולתמונות הגלריה. בלי לולאת רינדור: מי שמשתמש בו מזיז ומצייר.
// שלושה גופים (apple, round, tracker) ושישה חומרי רצועה. החלפת גוף או חומר = בנייה מחדש.

export type WatchSpec = { caseKind: CaseKind; material: Material; color: string };

type CaseGeom = {
  /** רוחב הרצועה */
  strapWidth: number;
  /** הגובה שבו הרצועה יוצאת מהגוף */
  strapY: number;
};

const STRAP_THICK = 0.075;
const ALUMINUM = "#2a2c30";
const GLASS_BLACK = "#050506";
const SIGNAL = "#ff5b1f";

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

// פני שעון גנריים: שעה גדולה, תאריך ושני נתונים. בלי לוגו ובלי פנים של watchOS
function faceTexture(kind: CaseKind) {
  const W = kind === "tracker" ? 256 : 512;
  const H = kind === "apple" ? 634 : kind === "round" ? 512 : 712;
  const { c, g } = canvas(W, H);
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  const sans = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "alphabetic";

  if (kind === "apple") {
    g.fillStyle = SIGNAL;
    g.font = `600 40px ${sans}`;
    g.fillText("TUE 27", W / 2, 150);
    g.fillStyle = "#f5f5f7";
    g.font = `600 190px ${sans}`;
    g.fillText("10:09", W / 2, 345);
    // שני נתונים כמו "סיבוכים" גנריים
    const chip = (x: number, label: string, value: string, color: string) => {
      g.fillStyle = "#1c1c1e";
      g.beginPath();
      g.roundRect(x - 105, 410, 210, 120, 28);
      g.fill();
      g.fillStyle = color;
      g.font = `600 30px ${sans}`;
      g.fillText(label, x, 455);
      g.fillStyle = "#f5f5f7";
      g.font = `600 46px ${sans}`;
      g.fillText(value, x, 508);
    };
    chip(140, "BPM", "72", "#ff375f");
    chip(372, "STEPS", "8,412", "#30d158");
  } else if (kind === "round") {
    const cx = W / 2;
    // שנתות דקות סביב
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
    g.fillStyle = SIGNAL;
    g.font = `600 34px ${sans}`;
    g.fillText("TUE 27", cx, 180);
    g.fillStyle = "#f5f5f7";
    g.font = `600 130px ${sans}`;
    g.fillText("10:09", cx, 300);
    g.fillStyle = "#8e8e93";
    g.font = `500 34px ${sans}`;
    g.fillText("♥ 72   8,412", cx, 370);
  } else {
    g.fillStyle = "#f5f5f7";
    g.font = `600 120px ${sans}`;
    g.fillText("10", W / 2, 250);
    g.fillText("09", W / 2, 380);
    g.fillStyle = SIGNAL;
    g.font = `600 34px ${sans}`;
    g.fillText("TUE 27", W / 2, 120);
    g.fillStyle = "#30d158";
    g.font = `600 40px ${sans}`;
    g.fillText("8,412", W / 2, 520);
    g.fillStyle = "#8e8e93";
    g.font = `500 26px ${sans}`;
    g.fillText("STEPS", W / 2, 560);
  }
  return toTexture(c);
}

function shadowTexture() {
  const { c, g } = canvas(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(14,16,19,0.35)");
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
  return toTexture(c, true, [3, 22]);
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
  return toTexture(c, true, [3, 34]);
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
  return toTexture(c, true, [1, 2]);
}

// ---------- גאומטריה של רצועה ----------

// גוף עבה לאורך עקומה במישור YZ, עם חתך אצטדיון ו-UV (u לרוחב, v לאורך)
function strapGeometry(curve: THREE.Curve<THREE.Vector3>, width: number, segments = 72) {
  const r = STRAP_THICK / 2;
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
    for (const [u, v, uu] of profile) {
      positions.push(p.x + u, p.y + normal.y * v, p.z + normal.z * v);
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

function strapCurves(startY: number) {
  const s = startY;
  const top = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, s, 0),
    new THREE.Vector3(0, s + 0.45, -0.03),
    new THREE.Vector3(0, s + 0.88, -0.2),
    new THREE.Vector3(0, s + 1.22, -0.55),
    new THREE.Vector3(0, s + 1.44, -1.0),
  ]);
  const bottom = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -s, 0),
    new THREE.Vector3(0, -s - 0.45, -0.03),
    new THREE.Vector3(0, -s - 0.88, -0.2),
    new THREE.Vector3(0, -s - 1.25, -0.56),
    new THREE.Vector3(0, -s - 1.52, -1.05),
    new THREE.Vector3(0, -s - 1.66, -1.55),
  ]);
  return { top, bottom };
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

function screenMaterial(kind: CaseKind) {
  // המסך מאיר בעצמו: לא מושפע מתאורה ולא מ-tone mapping, כדי שהלבן יישאר חד
  return new THREE.MeshBasicMaterial({ map: faceTexture(kind), toneMapped: false });
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

function buildCase(kind: CaseKind, group: THREE.Group): CaseGeom {
  const metal = new THREE.MeshPhysicalMaterial({
    color: ALUMINUM,
    metalness: 0.9,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
  });
  const dark = new THREE.MeshPhysicalMaterial({ color: "#1b1c1f", metalness: 0.7, roughness: 0.35 });

  if (kind === "apple") {
    group.add(new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.2, 0.3, 8, 0.22), metal));
    // זכוכית שחורה מבריקה עם קצה מעוגל. השוליים השחורים סביב המסך הם חלק ממנה
    const glass = new THREE.Mesh(new RoundedBoxGeometry(0.96, 1.16, 0.05, 8, 0.024), glassMat());
    glass.position.z = 0.15;
    group.add(glass);
    const sw = 0.82;
    const sh = 1.0;
    const screenGeo = new THREE.ShapeGeometry(roundedRectShape(sw, sh, 0.15), 16);
    normalizeUVs(screenGeo, sw, sh);
    const screen = new THREE.Mesh(screenGeo, screenMaterial("apple"));
    screen.position.z = 0.1755;
    group.add(screen);
    const reflect = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(0.94, 1.14, 0.2), 16), reflectMat());
    reflect.position.z = 0.177;
    group.add(reflect);
    // חיישן בגב
    const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 16), glassMat());
    sensor.scale.set(1, 1, 0.16);
    sensor.position.z = -0.14;
    group.add(sensor);
    // כתר דיגיטלי עם חריצים, וכפתור צד
    const ridges = ridgeTexture();
    ridges.wrapS = THREE.RepeatWrapping;
    ridges.repeat.set(6, 1);
    const crownMat = metal.clone();
    crownMat.bumpMap = ridges;
    crownMat.bumpScale = 0.6;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 48), crownMat);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(0.535, 0.22, 0);
    group.add(crown);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.018, 48), new THREE.MeshStandardMaterial({ color: SIGNAL, roughness: 0.4 }));
    ring.rotation.z = Math.PI / 2;
    ring.position.set(0.598, 0.22, 0);
    group.add(ring);
    const button = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.26, 0.1, 2, 0.018), metal);
    button.position.set(0.505, -0.17, 0);
    group.add(button);
    // החריץ שאליו הרצועה נכנסת
    for (const y of [0.6, -0.6]) {
      const slot = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.07, 0.16, 2, 0.03), dark);
      slot.position.set(0, y, -0.02);
      group.add(slot);
    }
    return { strapWidth: 0.8, strapY: 0.5 };
  }

  if (kind === "round") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.6, 0.3, 64), metal);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 64), glassMat());
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 0.16;
    group.add(glass);
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.575, 0.04, 16, 96), metal);
    bezel.position.z = 0.16;
    group.add(bezel);
    const screen = new THREE.Mesh(new THREE.CircleGeometry(0.47, 64), screenMaterial("round"));
    screen.position.z = 0.1805;
    group.add(screen);
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
      for (const sy of [0.6, -0.6]) {
        const lug = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.3, 0.16, 2, 0.04), metal);
        lug.position.set(sx, sy, -0.02);
        group.add(lug);
      }
    }
    return { strapWidth: 0.6, strapY: 0.62 };
  }

  // צמיד כושר: גוף צר וארוך, כולו זכוכית מקדימה
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.46, 1.1, 0.22, 8, 0.11), glassMat());
  group.add(body);
  const sw = 0.3;
  const sh = 0.84;
  const screenGeo = new THREE.ShapeGeometry(roundedRectShape(sw, sh, 0.12), 16);
  normalizeUVs(screenGeo, sw, sh);
  const screen = new THREE.Mesh(screenGeo, screenMaterial("tracker"));
  screen.position.z = 0.1105;
  group.add(screen);
  const reflect = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(0.4, 1.0, 0.18), 16), reflectMat());
  reflect.position.z = 0.112;
  group.add(reflect);
  return { strapWidth: 0.46, strapY: 0.5 };
}

// ---------- הרצועה ----------

type StrapParts = { paint(c: THREE.Color): void };

function buildStrap(material: Material, geom: CaseGeom, group: THREE.Group, initial: THREE.Color): StrapParts {
  const { top, bottom } = strapCurves(geom.strapY);
  const w = geom.strapWidth;
  const isMetal = material === "milanese" || material === "link";

  const mat = new THREE.MeshPhysicalMaterial({
    color: initial,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.55,
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
    mat.roughness = 0.38;
    mat.clearcoat = 0;
    mat.sheen = 0;
  }

  const metalAccent = new THREE.MeshPhysicalMaterial({ color: initial, metalness: 0.95, roughness: 0.3 });
  const holeMat = new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.9 });
  const yAxis = new THREE.Vector3(0, 1, 0);

  if (material === "link") {
    // חוליות נפרדות לאורך העקומה
    const linkGeo = new RoundedBoxGeometry(w, 0.15, STRAP_THICK * 1.5, 2, 0.025);
    for (const curve of [top, bottom]) {
      const count = curve === top ? 12 : 14;
      for (let i = 0; i < count; i++) {
        const link = new THREE.Mesh(linkGeo, metalAccent);
        link.name = "link";
        orient(link, curve, (i + 0.5) / count);
        group.add(link);
      }
    }
  } else {
    group.add(new THREE.Mesh(strapGeometry(top, w), mat), new THREE.Mesh(strapGeometry(bottom, w), mat));
  }

  if (material === "silicone") {
    const holeGeo = new THREE.CylinderGeometry(0.034, 0.034, STRAP_THICK * 1.08, 20);
    for (let i = 0; i < 7; i++) {
      const { p, normal } = frameAt(bottom, 0.42 + i * 0.07);
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.copy(p);
      hole.quaternion.setFromUnitVectors(yAxis, normal);
      group.add(hole);
    }
  }

  if (material === "magnetic" || material === "milanese") {
    // סוגר מגנטי בקצה. ברשת המתכת הוא בצבע הרצועה
    const claspMat = material === "milanese" ? metalAccent : new THREE.MeshPhysicalMaterial({ color: "#1b1c1f", metalness: 0.7, roughness: 0.35 });
    const clasp = new THREE.Mesh(new RoundedBoxGeometry(w + 0.04, 0.3, 0.12, 3, 0.04), claspMat);
    orient(clasp, bottom, 0.9);
    clasp.name = "clasp";
    group.add(clasp);
  }

  if (material === "leather") {
    // אבזם מתכת: מסגרת עם חור
    const outer = roundedRectShape(w + 0.12, 0.3, 0.06);
    outer.holes.push(roundedRectShape(w + 0.02, 0.18, 0.03) as unknown as THREE.Path);
    const buckle = new THREE.Mesh(
      new THREE.ExtrudeGeometry(outer, { depth: 0.035, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }),
      new THREE.MeshPhysicalMaterial({ color: "#c9ccd1", metalness: 0.95, roughness: 0.25 }),
    );
    orient(buckle, bottom, 0.38, STRAP_THICK / 2);
    buckle.name = "buckle";
    group.add(buckle);
  }

  return {
    paint(c) {
      if (isMetal) {
        mat.color.copy(c);
        metalAccent.color.copy(c);
      } else {
        mat.color.copy(c);
        holeMat.color.copy(c).multiplyScalar(0.35);
      }
    },
  };
}

// ---------- המודל ----------

export type WatchModel = {
  watch: THREE.Group;
  shadow: THREE.Mesh;
  /** צובע את הרצועה (ואת החורים בסיליקון) */
  paint(color: THREE.Color): void;
  dispose(): void;
};

export function buildWatch(spec: WatchSpec): WatchModel {
  const watch = new THREE.Group();
  const geom = buildCase(spec.caseKind, watch);
  const strap = buildStrap(spec.material, geom, watch, new THREE.Color(spec.color));

  // צל רך מתחת לנקודה הנמוכה של המודל
  const box = new THREE.Box3().setFromObject(watch);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.6),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, box.min.y - 0.1, -0.6);

  return {
    watch,
    shadow,
    paint: strap.paint,
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
