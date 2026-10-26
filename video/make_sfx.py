"""Synthesizes the promo's sound effects as WAV files (no external samples)."""
import math, random, struct, wave, os

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "public", "sfx")
os.makedirs(OUT, exist_ok=True)
rnd = random.Random(7)

def write(name, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    with wave.open(os.path.join(OUT, name), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(32767 * 0.9 * s / peak)) for s in samples))

def env(t, attack, decay):
    return min(1, t / attack) * math.exp(-t / decay) if attack else math.exp(-t / decay)

def hit(dur=0.35):
    out, lp = [], 0.0
    for i in range(int(SR * dur)):
        t = i / SR
        f = 55 + 90 * math.exp(-t / 0.03)  # pitch drop thump
        body = math.sin(2 * math.pi * f * t) * env(t, 0.002, 0.09)
        lp += 0.25 * (rnd.uniform(-1, 1) - lp)
        out.append(body + 0.35 * lp * env(t, 0.001, 0.02))
    return out

def tick(dur=0.06):
    return [math.sin(2 * math.pi * 2400 * i / SR) * env(i / SR, 0.0005, 0.008) for i in range(int(SR * dur))]

def whoosh(dur=0.7):
    out, lp, bp = [], 0.0, 0.0
    for i in range(int(SR * dur)):
        t = i / SR
        a = 0.03 + 0.25 * math.sin(math.pi * t / dur)  # filter opens and closes
        lp += a * (rnd.uniform(-1, 1) - lp)
        bp += 0.5 * (lp - bp)
        out.append((lp - bp) * math.sin(math.pi * t / dur) ** 2)
    return out

def impact(dur=1.4):
    out, lp = [], 0.0
    for i in range(int(SR * dur)):
        t = i / SR
        f = 42 + 60 * math.exp(-t / 0.05)
        body = math.sin(2 * math.pi * f * t) * env(t, 0.003, 0.35)
        lp += 0.08 * (rnd.uniform(-1, 1) - lp)
        out.append(body + 0.6 * lp * env(t, 0.002, 0.25))
    return out

write("hit.wav", hit()); write("tick.wav", tick()); write("whoosh.wav", whoosh()); write("impact.wav", impact())
print("ok", sorted(os.listdir(OUT)))
