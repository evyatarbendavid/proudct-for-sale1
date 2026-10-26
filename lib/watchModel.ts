import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { BandType } from "./config";

// מודל השעון, משותף לאתר ולסרטון. בלי לולאת רינדור: מי שמשתמש בו מזיז ומצייר

const STRAP_WIDTH = 0.8;
const STRAP_THICK = 0.075;
const CASE_COLOR = "#2a2c30";

// רצועה כגוף עבה לאורך עקומה במישור YZ, עם חתך בצורת אצטדיון
function strapGeometry(curve: THREE.Curve<THREE.Vector3>, segments = 72) {
  const r = STRAP_THICK / 2;
  const hw = STRAP_WIDTH / 2 - r;
  const profile: [number, number][] = [];
  const arc = 8;
  for (let i = 0; i <= arc; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / arc;
    profile.push([hw + r * Math.cos(a), r * Math.sin(a)]);
  }
  for (let i = 0; i <= arc; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / arc;
    profile.push([-hw + r * Math.cos(a), r * Math.sin(a)]);
  }

  const ring = profile.length;
  const positions: number[] = [];
  const indices: number[] = [];
  const xAxis = new THREE.Vector3(1, 0, 0);
  const normal = new THREE.Vector3();

  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    normal.crossVectors(xAxis, tangent).normalize();
    for (const [u, v] of profile) {
      positions.push(p.x + u, p.y + normal.y * v, p.z + normal.z * v);
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
  // מכסה בקצה הרצועה
  const end = curve.getPointAt(1);
  const center = positions.length / 3;
  positions.push(end.x, end.y, end.z);
  const last = segments * ring;
  for (let i = 0; i < ring; i++) indices.push(center, last + i, last + ((i + 1) % ring));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
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
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
}

function screenTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 632;
  const g = c.getContext("2d")!;
  g.fillStyle = "#050506";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#ff5b1f";
  g.font = "600 44px ui-monospace, Menlo, monospace";
  g.textAlign = "center";
  g.fillText("MON 26", 256, 190);
  g.fillStyle = "#f3f4f6";
  g.font = "700 168px ui-sans-serif, system-ui, sans-serif";
  g.fillText("10:09", 256, 360);
  g.fillStyle = "#8b9097";
  g.font = "500 40px ui-monospace, Menlo, monospace";
  g.fillText("72 BPM", 256, 450);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(14,16,19,0.35)");
  grad.addColorStop(1, "rgba(14,16,19,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export type WatchModel = {
  watch: THREE.Group;
  shadow: THREE.Mesh;
  strapMat: THREE.MeshPhysicalMaterial;
  /** צובע את הרצועה ואת החורים בצבע אחד */
  paint(color: THREE.Color): void;
  setType(type: BandType): void;
};

export function buildWatch(color: string, type: BandType): WatchModel {
  const watch = new THREE.Group();

  // גוף
  const caseMat = new THREE.MeshPhysicalMaterial({
    color: CASE_COLOR,
    metalness: 0.85,
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.2, 0.34, 6, 0.2), caseMat);
  watch.add(body);

  // מסך וזכוכית
  const screenW = 0.84;
  const screenH = 1.04;
  const screenGeo = new THREE.ShapeGeometry(roundedRectShape(screenW, screenH, 0.13), 12);
  normalizeUVs(screenGeo, screenW, screenH);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture() });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.z = 0.171;
  watch.add(screen);
  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(0.94, 1.14, 0.18), 12),
    new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.08,
      roughness: 0.02,
      metalness: 0,
      clearcoat: 1,
    }),
  );
  glass.position.z = 0.174;
  watch.add(glass);

  // כתר וכפתור
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 32), caseMat);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.53, 0.2, 0);
  watch.add(crown);
  const crownRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.078, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: "#ff5b1f", roughness: 0.4 }),
  );
  crownRing.rotation.z = Math.PI / 2;
  crownRing.position.set(0.585, 0.2, 0);
  watch.add(crownRing);
  const button = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.22, 0.1, 2, 0.02), caseMat);
  button.position.set(0.51, -0.17, 0);
  watch.add(button);

  // רצועות
  const top = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(0, 0.95, -0.03),
    new THREE.Vector3(0, 1.38, -0.2),
    new THREE.Vector3(0, 1.72, -0.55),
    new THREE.Vector3(0, 1.94, -1.0),
  ]);
  const bottom = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.5, 0),
    new THREE.Vector3(0, -0.95, -0.03),
    new THREE.Vector3(0, -1.38, -0.2),
    new THREE.Vector3(0, -1.75, -0.56),
    new THREE.Vector3(0, -2.02, -1.05),
    new THREE.Vector3(0, -2.16, -1.55),
  ]);
  const strapMat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.55,
    sheen: 0.5,
    sheenRoughness: 0.6,
    side: THREE.DoubleSide,
  });
  const topStrap = new THREE.Mesh(strapGeometry(top), strapMat);
  const bottomStrap = new THREE.Mesh(strapGeometry(bottom), strapMat);
  watch.add(topStrap, bottomStrap);

  // חורים (סיליקון)
  const holeMat = new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.9 });
  const holes = new THREE.Group();
  const holeGeo = new THREE.CylinderGeometry(0.034, 0.034, STRAP_THICK * 1.08, 20);
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 7; i++) {
    const { p, normal } = frameAt(bottom, 0.42 + i * 0.07);
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.copy(p);
    hole.quaternion.setFromUnitVectors(yAxis, normal);
    holes.add(hole);
  }
  watch.add(holes);

  // סוגר מגנטי
  const claspMat = new THREE.MeshPhysicalMaterial({ color: "#1b1c1f", metalness: 0.7, roughness: 0.35 });
  const clasp = new THREE.Group();
  {
    const { p, tangent, normal } = frameAt(bottom, 0.9);
    const block = new THREE.Mesh(new RoundedBoxGeometry(STRAP_WIDTH + 0.04, 0.3, 0.12, 3, 0.04), claspMat);
    block.position.copy(p);
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), tangent, normal);
    block.quaternion.setFromRotationMatrix(m);
    clasp.add(block);
  }
  watch.add(clasp);

  // מחברים בין הרצועה לגוף
  const lugGeo = new RoundedBoxGeometry(STRAP_WIDTH + 0.04, 0.07, 0.16, 2, 0.03);
  for (const y of [0.6, -0.6]) {
    const lug = new THREE.Mesh(lugGeo, claspMat);
    lug.position.set(0, y, -0.02);
    watch.add(lug);
  }

  // צל רך
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.6),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -2.3, -0.6);

  const holeTint = new THREE.Color();
  function paint(c: THREE.Color) {
    strapMat.color.copy(c);
    holeMat.color.copy(holeTint.copy(c).multiplyScalar(0.35));
  }
  function setType(t: BandType) {
    holes.visible = t === "silicone";
    clasp.visible = t === "magnetic";
  }
  setType(type);
  paint(new THREE.Color(color));

  return { watch, shadow, strapMat, paint, setType };
}
