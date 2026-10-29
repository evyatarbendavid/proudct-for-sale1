import * as THREE from "three";
import type { CaseKind, Material } from "@/lib/catalog";
import { buildWatch, caseColorFor, studioEnvironment } from "@/lib/watchModel";

export type WatchScene = {
  setColor(hex: string): void;
  /** גוף או חומר אחר: בונה את המודל מחדש */
  setSpec(caseKind: CaseKind, material: Material): void;
  dispose(): void;
};

// הזווית שבה התצוגה החיה מתחילה: זו של התמונה "front" (scripts/render-products.mjs), שמוצגת עד הפריים הראשון
const START_ANGLE = -0.35;
// כמה מהפריים המודל ממלא. זהה בתצוגה החיה ובצילום, כדי שהמעבר מהתמונה לתלת-ממד לא יורגש
const FILL = 1.02;

export function createWatchScene(
  host: HTMLElement,
  initial: {
    color: string;
    caseKind: CaseKind;
    material: Material;
    onReady?: () => void;
    /** זווית קבועה בלי תנועה, לצילום תמונות הגלריה: מצייר פריים אחד ועוצר */
    still?: number;
  },
): WatchScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  const still = initial.still !== undefined;
  const reduceMotion = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // בתצוגה החיה עד פי 1.5, כדי שגם טלפונים חלשים יסובבו בחלקות. בצילום הגלריה פי 2, לתמונות חדות
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, still ? 2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // שומר על הצבעים של הרצועות קרובים לדוגמיות
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.style.cursor = "grab";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = studioEnvironment();
  const envMap = pmrem.fromScene(studio, 0.02).texture;
  scene.environment = envMap;

  const key = new THREE.DirectionalLight("#ffffff", 1.1);
  key.position.set(-3, 4, 5);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);

  let caseKind = initial.caseKind;
  let model = buildWatch({ caseKind, material: initial.material, color: initial.color });
  scene.add(model.watch, model.shadow);

  const target = new THREE.Color(initial.color);
  const current = new THREE.Color(initial.color);
  const caseTarget = new THREE.Color(caseColorFor(caseKind, initial.color));
  const caseCurrent = caseTarget.clone();
  let targetHex = initial.color;

  // המצלמה מתרחקת לפי הכדור שעוטף את המודל, כך שימלא בערך את אותו חלק מהפריים בכל גוף ובכל זווית
  let radius = 1;
  function measure() {
    model.watch.rotation.set(0, 0, 0);
    model.watch.scale.setScalar(1);
    radius = new THREE.Box3().setFromObject(model.watch).getBoundingSphere(new THREE.Sphere()).radius;
  }
  measure();

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const fit = Math.min(Math.tan(halfFov), Math.tan(halfFov) * camera.aspect);
    const dist = radius / (fit * FILL);
    camera.position.set(0, dist * 0.1, dist);
    camera.lookAt(0, -radius * 0.04, 0);
    camera.updateProjectionMatrix();
    // מציירים מחדש בגודל החדש גם כשהלולאה נחה, אחרת הקנבס נשאר מתוח
    start();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // גרירה
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  let spin = START_ANGLE;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    start();
    lastX = e.clientX;
    renderer.domElement.setPointerCapture(e.pointerId);
    renderer.domElement.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    spin += dx * 0.012;
    velocity = dx * 0.012;
  };
  const onUp = () => {
    dragging = false;
    renderer.domElement.style.cursor = "grab";
  };
  if (!still) {
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointercancel", onUp);
  }

  // לולאה, רק כשהקנבס נראה
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  io.observe(host);

  const timer = new THREE.Timer();
  let raf = 0;
  let readyFired = false;
  // בצילום מחכים לגופן של פני השעון לפני הפריים הראשון
  let canRender = !still;
  let disposed = false;

  function frame() {
    raf = 0;
    if (!canRender) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);

    if (!dragging) {
      if (!reduceMotion) spin += 0.32 * dt;
      spin += velocity;
      velocity *= 0.92;
    }
    // השעון מסתובב גם עם הגלילה
    const scrollSpin = reduceMotion ? 0 : window.scrollY * 0.0022;
    const { watch } = model;
    // מתחילים בדיוק בזווית של התמונה וממשיכים ממנה, בלי כניסה מונפשת
    watch.rotation.y = still ? initial.still! : spin + scrollSpin;
    // השעון עומד על הרצועה, ולכן לא מרחף: רק מסתובב
    watch.rotation.x = 0.06;

    const k = reduceMotion ? 1 : 0.1;
    model.paint(current.lerp(target, k), caseCurrent.lerp(caseTarget, k));

    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      initial.onReady?.();
    }
    // בלי תנועה (העדפת "הפחתת תנועה"): מציירים רק כשגוררים או כשהסיבוב עוד דועך, ואחר כך נחים
    const animating = !reduceMotion || dragging || Math.abs(velocity) > 1e-4;
    if (!still && animating && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!raf && !disposed) {
      timer.update();
      raf = requestAnimationFrame(frame);
    }
  }
  const onVisibility = () => {
    if (!document.hidden && visible) start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  // אחרי שהגופן של פני השעון נטען הם מצוירים מחדש. מציירים פריים, גם כשהלולאה נחה.
  // בצילום מחכים לזה לפני הפריים הראשון
  model.ready.then(() => {
    canRender = true;
    start();
  });
  start();

  return {
    setColor(hex) {
      targetHex = hex;
      target.set(hex);
      caseTarget.set(caseColorFor(caseKind, hex));
      start();
    },
    setSpec(kind, material) {
      scene.remove(model.watch, model.shadow);
      model.dispose();
      caseKind = kind;
      model = buildWatch({ caseKind, material, color: targetHex });
      caseTarget.set(caseColorFor(caseKind, targetHex));
      caseCurrent.copy(caseTarget);
      scene.add(model.watch, model.shadow);
      measure();
      resize();
      model.ready.then(start);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      model.dispose();
      studio.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
