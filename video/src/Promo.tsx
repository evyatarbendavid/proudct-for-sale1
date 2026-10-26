import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { colors } from "../../lib/config";
import { buildWatch } from "../../lib/watchModel";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION = 12 * FPS;

// הפונטים של האתר, מקבצים מקומיים (הדפדפן של הרינדור לא מגיע ל-Google Fonts מהסביבה)
const DISPLAY = "Karantina";
const BODY = "IBM Plex Sans Hebrew";
loadFont({ family: DISPLAY, url: staticFile("fonts/karantina-700.ttf"), weight: "700" });
loadFont({ family: BODY, url: staticFile("fonts/plex-hebrew-600.ttf"), weight: "600" });

// הצבעים של האתר
const C = {
  steel: "#e4e7eb",
  paper: "#f5f6f7",
  ink: "#0e1013",
  signal: "#ff5b1f",
  signalDeep: "#e2470f",
  line: "#cdd2d8",
};

const hex = (id: string) => colors.find((c) => c.id === id)?.hex ?? "#1f1f1f";
const f = (sec: number) => Math.round(sec * FPS);

// ציר הזמן בשניות (לפי רשימת הסצנות שאושרה)
const T = {
  open: 0.15,
  drop: 0.3,
  w1: 1.3,
  w2: 1.8,
  w3: 2.8,
  w4: 3.8,
  colorStart: 2.3,
  spin: 6.3,
  typeSwitch: 7.0,
  price1: 7.8,
  price2: 9.3,
  end: 10.3,
};

// צבע הרצועה לכל רגע: 8 צבעים בקצב של חצי שנייה, ואחר כך צבעים קבועים לכל סצנה
const colorTimeline: [number, string][] = [
  [0, hex("black")],
  ...colors.map((c, i) => [T.colorStart + i * 0.5, c.hex] as [number, string]),
  [T.spin, hex("navy")],
  [T.price1, hex("sand")],
  [T.price2, hex("pink")],
  [T.end, hex("navy")],
];

function sp(frame: number, atSec: number, config: Parameters<typeof spring>[0]["config"] = {}) {
  return spring({ frame: frame - f(atSec), fps: FPS, config });
}

// רעידה קצרה על כל מכה
function shake(frame: number, hits: number[], amp = 14) {
  const t = frame / FPS;
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = t - h;
    if (d < 0 || d > 0.4) continue;
    const a = amp * Math.exp(-d / 0.09);
    x += a * Math.sin(d * 2 * Math.PI * 17);
    y += a * Math.cos(d * 2 * Math.PI * 13);
  }
  return { x, y };
}

function strapColor(frame: number) {
  const t = frame / FPS;
  let i = 0;
  while (i + 1 < colorTimeline.length && colorTimeline[i + 1][0] <= t) i++;
  const [at, to] = colorTimeline[i];
  const from = i > 0 ? colorTimeline[i - 1][1] : to;
  const k = Math.min(1, sp(frame, at, { damping: 200, stiffness: 300 }));
  return new THREE.Color(from).lerp(new THREE.Color(to), k);
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function WatchRig() {
  const frame = useCurrentFrame();
  const model = useMemo(() => buildWatch(hex("black"), "silicone"), []);
  const t = frame / FPS;

  // נחיתה מלמעלה עם קפיצה קטנה
  const drop = sp(frame, T.drop, { damping: 11, stiffness: 120 });
  // סיבוב איטי קבוע, ועוד סיבוב מלא אחד בסצנת הסוגים
  const extra = sp(frame, T.spin, { damping: 18, stiffness: 60 }) * Math.PI * 2;
  const rotY = -0.7 + t * 0.55 + extra;

  model.paint(strapColor(frame));
  model.setType(t >= T.typeSwitch ? "magnetic" : "silicone");

  // בסיום השעון יורד קצת, כדי לפנות מקום ל"בקרוב"
  const settle = sp(frame, T.end, { damping: 200, stiffness: 120 }) * 0.32;

  return (
    <group position={[0, -0.86 - settle + (1 - drop) * 5, 0]} scale={0.5}>
      <primitive object={model.watch} rotation={[0.06, rotY, 0]} />
      <primitive object={model.shadow} />
    </group>
  );
}

function Bezel({ opacity }: { opacity: number }) {
  return (
    <svg
      viewBox="0 0 400 400"
      style={{ position: "absolute", left: 140, top: 1000, width: 800, height: 800, opacity }}
    >
      <circle cx="200" cy="200" r="196" fill={C.paper} stroke={C.line} strokeWidth="2" />
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1="200"
            y1="14"
            x2="200"
            y2={major ? 38 : 26}
            stroke={i === 0 ? C.signal : "#4b525b"}
            strokeOpacity={major ? 0.7 : 0.3}
            strokeWidth={major ? 4 : 2}
            strokeLinecap="round"
            transform={`rotate(${i * 6} 200 200)`}
          />
        );
      })}
    </svg>
  );
}

// כניסות של מילים: חבטה מגודל גדול, עלייה, והרחבה מצרה לרחבה
function slam(frame: number, at: number) {
  const k = sp(frame, at, { damping: 12, stiffness: 260 });
  return { opacity: frame >= f(at) ? Math.min(1, (frame - f(at) + 1) / 2) : 0, transform: `scale(${1.25 - 0.25 * k})` };
}
function rise(frame: number, at: number) {
  const k = sp(frame, at, { damping: 20, stiffness: 220 });
  return { opacity: Math.min(1, Math.max(0, k * 1.6)), transform: `translateY(${(1 - k) * 60}px)` };
}
function expand(frame: number, at: number): CSSProperties {
  const k = sp(frame, at, { damping: 14, stiffness: 200 });
  return {
    opacity: frame >= f(at) ? 1 : 0,
    transform: `scaleX(${0.6 + 0.4 * k})`,
    letterSpacing: `${-0.04 + 0.07 * Math.min(1, k)}em`,
  };
}
function exitUp(frame: number, at: number): CSSProperties {
  const k = sp(frame, at, { damping: 200, stiffness: 400 });
  return { opacity: 1 - k, transform: `translateY(${-50 * k}px)` };
}

function Word({ children, style, color = C.ink, size = HEAD }: { children: ReactNode; style: CSSProperties; color?: string; size?: number }) {
  return (
    <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.82, color, ...style }}>
      {children}
    </span>
  );
}

// גודל אחד לשתי השורות, כדי ש"לשעון שלך" ייכנס ברוחב הבטוח
const HEAD = 290;
const END = 262;

const row: CSSProperties = {
  position: "absolute",
  left: 80,
  right: 80,
  display: "flex",
  justifyContent: "flex-start",
  gap: 44,
  direction: "rtl",
};

function Sfx({ at, name, volume = 1 }: { at: number; name: string; volume?: number }) {
  return (
    <Sequence from={f(at)} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
}

function StrapCard({ color, style }: { color: string; style: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 64" style={{ position: "absolute", width: 120, height: 320, ...style }}>
      <rect x="2" y="1" width="20" height="62" rx="10" fill={color} stroke="rgba(0,0,0,.12)" />
      {[30, 39, 48].map((y) => (
        <circle key={y} cx="12" cy={y} r="2.2" fill="rgba(0,0,0,.28)" />
      ))}
    </svg>
  );
}

export function Promo() {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const bg =
    t < T.drop ? C.ink : t < T.price1 ? C.steel : t < T.price2 ? C.ink : t < T.end ? C.signal : C.paper;

  // פתיחה: קו כתום חוצה, ואז נפתח לרקע
  const lineX = (1 - sp(frame, 0, { damping: 200, stiffness: 500 })) * -W;
  const openK = sp(frame, T.open, { damping: 200, stiffness: 600 });

  // מצלמה: דחיפה איטית בכל סצנה, ורעידה על המכות
  const push = 1 + 0.035 * ((t % 100) / 12);
  const sh = shake(frame, [T.w1, T.w4, T.price1, T.price2, T.end]);
  const endPush = t >= T.end ? 1 + 0.04 * Math.min(1, (t - T.end) / 1.7) : 1;

  const showHeadline = t >= T.w1 - 0.1 && t < T.spin + 0.3;
  const headExit = t >= T.spin ? exitUp(frame, T.spin) : {};

  // נקודה כתומה בסיום, פועמת כל חצי שנייה
  const beatPulse = t >= T.end ? 1 + 0.12 * Math.exp(-(((t - T.end) % 0.5) / 0.12)) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      {t < T.drop + 0.05 && (
        <>
          <div style={{ position: "absolute", left: lineX, top: H / 2 - 2, width: W, height: 4, background: C.signal }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: C.steel,
              transform: `scaleY(${openK})`,
              opacity: t >= T.open ? 1 : 0,
            }}
          />
        </>
      )}

      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) scale(${push * endPush})` }}>
        {t >= T.drop && t < T.price1 && <Bezel opacity={Math.min(1, sp(frame, T.drop + 0.2, { damping: 200 }))} />}

        {t >= T.drop && (
          <ThreeCanvas width={W} height={H} camera={{ fov: 28, position: [0, 0.2, 9.2] }} style={{ position: "absolute", inset: 0 }}>
            <Environment />
            <directionalLight position={[-3, 4, 5]} intensity={1.4} />
            <WatchRig />
          </ThreeCanvas>
        )}

        {/* כותרת עליונה קטנה */}
        {t >= T.drop && t < T.spin + 0.3 && (
          <div
            style={{
              position: "absolute",
              top: 262,
              left: 80,
              right: 80,
              direction: "rtl",
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 64,
              color: "#4b525b",
              ...rise(frame, T.drop + 0.15),
              ...(t >= T.spin ? exitUp(frame, T.spin) : {}),
            }}
          >
            רצועות לשעון חכם
          </div>
        )}

        {showHeadline && (
          <>
            <div style={{ ...row, top: 380, ...headExit }}>
              <Word style={slam(frame, T.w1)}>צבע</Word>
              <Word style={rise(frame, T.w2)}>חדש</Word>
            </div>
            <div style={{ ...row, top: 625, ...headExit }}>
              <Word style={{ ...expand(frame, T.w3), transformOrigin: "right center" }}>לשעון</Word>
              <Word style={slam(frame, T.w4)} color={C.signalDeep}>
                שלך
              </Word>
            </div>
          </>
        )}

        {/* סיליקון או מגנטית */}
        {t >= T.spin + 0.15 && t < T.price1 && (
          <div style={{ ...row, top: 420 }}>
            {t < T.typeSwitch ? (
              <Word style={rise(frame, T.spin + 0.15)}>סיליקון</Word>
            ) : (
              <Word style={rise(frame, T.typeSwitch)} color={C.signalDeep}>
                מגנטית
              </Word>
            )}
          </div>
        )}

        {/* מחיר לרצועה */}
        {t >= T.price1 && t < T.price2 && (
          <div style={{ ...row, top: 330, flexDirection: "column", gap: 10 }}>
            <Word style={slam(frame, T.price1)} color={C.paper} size={430}>
              ₪45
            </Word>
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 100, color: C.paper, ...rise(frame, T.price1 + 0.15) }}>
              לרצועה
            </span>
          </div>
        )}

        {/* מחיר לזוג */}
        {t >= T.price2 && t < T.end && (
          <>
            <div
              style={{
                ...row,
                top: 330,
                flexDirection: "column",
                gap: 10,
                transform: `translateX(${(1 - sp(frame, T.price2, { damping: 16, stiffness: 320 })) * 260}px)`,
                opacity: Math.min(1, sp(frame, T.price2, { damping: 200, stiffness: 600 }) * 2),
              }}
            >
              <Word style={{}} size={430}>
                ₪69
              </Word>
              <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 100, color: C.ink }}>לזוג</span>
            </div>
            <StrapCard
              color={hex("olive")}
              style={{ left: 120, top: 1200, transform: `translateX(${(1 - sp(frame, T.price2 + 0.1, { damping: 14 })) * -400}px) rotate(-8deg)` }}
            />
            <StrapCard
              color={hex("sand")}
              style={{ right: 120, top: 1200, transform: `translateX(${(1 - sp(frame, T.price2 + 0.18, { damping: 14 })) * 400}px) rotate(8deg)` }}
            />
          </>
        )}

        {/* סיום */}
        {t >= T.end && (
          <>
            <div style={{ ...row, top: 330, ...rise(frame, T.end) }}>
              <Word style={{}} size={END}>צבע</Word>
              <Word style={{}} size={END}>חדש</Word>
            </div>
            <div style={{ ...row, top: 575, alignItems: "flex-end", ...rise(frame, T.end + 0.06) }}>
              <Word style={{}} size={END}>לשעון</Word>
              <Word style={{}} color={C.signalDeep} size={END}>
                שלך
              </Word>
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: C.signal,
                  marginBottom: 44,
                  transform: `scale(${beatPulse * Math.min(1, sp(frame, T.end + 0.2, { damping: 10, stiffness: 300 }))})`,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: 815,
                right: 80,
                direction: "rtl",
                padding: "18px 44px",
                borderRadius: 999,
                background: C.ink,
                color: C.paper,
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 72,
                ...rise(frame, T.end + 0.25),
              }}
            >
              בקרוב
            </div>
          </>
        )}
      </AbsoluteFill>

      <Sfx at={T.drop + 0.25} name="hit" volume={0.6} />
      <Sfx at={T.w1} name="hit" />
      <Sfx at={T.w4} name="hit" />
      {colors.map((c, i) => (
        <Sfx key={c.id} at={T.colorStart + i * 0.5} name="tick" volume={0.35} />
      ))}
      <Sfx at={T.spin} name="whoosh" volume={0.8} />
      <Sfx at={T.price1} name="hit" />
      <Sfx at={T.price2} name="hit" />
      <Sfx at={T.end} name="impact" />
    </AbsoluteFill>
  );
}
