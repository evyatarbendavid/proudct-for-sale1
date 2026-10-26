import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { BandType } from "@/lib/config";
import { buildWatch } from "@/lib/watchModel";

export type WatchScene = {
  setColor(hex: string): void;
  setType(type: BandType): void;
  dispose(): void;
};

export function createWatchScene(
  host: HTMLElement,
  initial: { color: string; type: BandType; onReady?: () => void },
): WatchScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.style.cursor = "grab";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;

  const key = new THREE.DirectionalLight("#ffffff", 1.4);
  key.position.set(-3, 4, 5);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.2, 9.2);
  camera.lookAt(0, -0.15, -0.3);

  const model = buildWatch(initial.color, initial.type);
  const { watch } = model;
  scene.add(watch, model.shadow);

  const target = new THREE.Color(initial.color);
  const current = new THREE.Color(initial.color);

  // גודל
  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    // על מסך צר מרחיקים מעט כדי שכל השעון ייכנס
    camera.position.z = w / h < 0.8 ? 10.4 : 9.2;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // גרירה
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  let spin = -0.9;
  const onDown = (e: PointerEvent) => {
    dragging = true;
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
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointercancel", onUp);

  // לולאה, רק כשהקנבס נראה
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  io.observe(host);

  const timer = new THREE.Timer();
  let introT = reduceMotion ? 1 : 0;
  let raf = 0;
  let readyFired = false;

  function frame() {
    raf = 0;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const elapsed = timer.getElapsed();

    if (introT < 1) introT = Math.min(1, introT + dt / 1.4);
    const ease = 1 - Math.pow(1 - introT, 3);

    if (!dragging) {
      if (!reduceMotion) spin += 0.32 * dt;
      spin += velocity;
      velocity *= 0.92;
    }
    // השעון מסתובב גם עם הגלילה
    const scrollSpin = reduceMotion ? 0 : window.scrollY * 0.0022;
    watch.rotation.y = reduceMotion ? -0.5 + spin + 0.9 : spin - (1 - ease) * 1.6 + scrollSpin;
    watch.rotation.x = 0.06;
    watch.position.y = reduceMotion ? 0 : Math.sin(elapsed * 1.1) * 0.05;
    const scale = 0.86 + 0.14 * ease;
    watch.scale.setScalar(scale);

    model.paint(current.lerp(target, reduceMotion ? 1 : 0.1));

    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      initial.onReady?.();
    }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!raf) {
      timer.update();
      raf = requestAnimationFrame(frame);
    }
  }
  const onVisibility = () => {
    if (!document.hidden && visible) start();
  };
  document.addEventListener("visibilitychange", onVisibility);
  start();

  return {
    setColor(hex) {
      target.set(hex);
      start();
    },
    setType(type) {
      model.setType(type);
      start();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            (m as THREE.MeshBasicMaterial).map?.dispose();
            m.dispose();
          });
        }
      });
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
