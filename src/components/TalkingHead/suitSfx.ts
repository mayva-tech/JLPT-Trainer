/**
 * Mechanical sounds for the mecha suit, synthesised with the Web Audio API —
 * no audio files, so it works offline and adds nothing to the bundle.
 *
 * Suiting up (timed to the CSS reveal in talking-head.css):
 *   0.00 s  servo whir rising, with ratchet clicks
 *   0.45 s  heavy clunk as the armour lands on the shoulders
 *   0.47 s  pneumatic hiss while the face shutter lifts
 *
 * Suiting down is the reverse: a release hiss, the servo winding down, and a
 * lighter clunk as the armour comes off.
 *
 * Only called from a click or key press (a user gesture), so browsers allow
 * the AudioContext to start. Where Web Audio is missing (tests, very old
 * browsers) every call is a silent no-op.
 */

type Ctx = AudioContext;

const MASTER_VOLUME = 0.5;

let ctx: Ctx | null = null;
let noise: AudioBuffer | null = null;

function getCtx(): Ctx | null {
  if (ctx) return ctx;
  const g = globalThis as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = g.AudioContext ?? g.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

/** One second of white noise, made once and reused by every burst. */
function noiseBuffer(c: Ctx): AudioBuffer {
  if (noise && noise.sampleRate === c.sampleRate) return noise;
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise = buf;
  return buf;
}

/** Gain node with an attack/decay envelope, wired to `out`. */
function envelope(
  c: Ctx,
  out: AudioNode,
  t: number,
  peak: number,
  attack: number,
  decay: number
): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(out);
  return g;
}

/** Filtered noise burst — clicks, thuds and hisses. */
function burst(
  c: Ctx,
  out: AudioNode,
  t: number,
  opts: {
    type: BiquadFilterType;
    freq: number;
    q?: number;
    peak: number;
    attack: number;
    decay: number;
    freqTo?: number;
  }
) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = opts.type;
  f.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqTo) {
    f.frequency.exponentialRampToValueAtTime(opts.freqTo, t + opts.attack + opts.decay);
  }
  f.Q.value = opts.q ?? 1;
  src.connect(f);
  f.connect(envelope(c, out, t, opts.peak, opts.attack, opts.decay));
  src.start(t);
  src.stop(t + opts.attack + opts.decay + 0.05);
}

/** Servo motor: buzzy saw through a resonant low-pass, pitch swept. */
function servo(c: Ctx, out: AudioNode, t: number, from: number, to: number, dur: number) {
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 7;
  f.frequency.setValueAtTime(from * 4, t);
  f.frequency.exponentialRampToValueAtTime(to * 5, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.11, t + 0.05);
  g.gain.setValueAtTime(0.09, t + dur - 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(f);
  f.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Heavy metal clunk: a pitch-dropping thump plus a short dull thud. */
function clunk(c: Ctx, out: AudioNode, t: number, weight: number) {
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  osc.connect(envelope(c, out, t, 0.5 * weight, 0.004, 0.22));
  osc.start(t);
  osc.stop(t + 0.3);
  // metallic ring on impact
  const ring = c.createOscillator();
  ring.type = "square";
  ring.frequency.setValueAtTime(820, t);
  const rf = c.createBiquadFilter();
  rf.type = "bandpass";
  rf.frequency.value = 1650;
  rf.Q.value = 12;
  ring.connect(rf);
  rf.connect(envelope(c, out, t, 0.05 * weight, 0.002, 0.14));
  ring.start(t);
  ring.stop(t + 0.2);
  burst(c, out, t, { type: "lowpass", freq: 700, peak: 0.35 * weight, attack: 0.003, decay: 0.09 });
}

function ratchet(c: Ctx, out: AudioNode, t: number, count: number, gap: number) {
  for (let i = 0; i < count; i++) {
    burst(c, out, t + i * gap, {
      type: "bandpass",
      freq: 2600 + i * 180,
      q: 4,
      peak: 0.22,
      attack: 0.002,
      decay: 0.025,
    });
  }
}

function hiss(c: Ctx, out: AudioNode, t: number, dur: number, peak: number) {
  burst(c, out, t, {
    type: "highpass",
    freq: 5200,
    freqTo: 2400,
    q: 0.7,
    peak,
    attack: 0.03,
    decay: dur,
  });
}

/** Master chain: a little compression so overlapping layers never clip. */
function start(): { c: Ctx; out: AudioNode; t: number } | null {
  const c = getCtx();
  if (!c) return null;
  if (c.state === "suspended") void c.resume().catch(() => {});
  const master = c.createGain();
  master.gain.value = MASTER_VOLUME;
  const comp = c.createDynamicsCompressor();
  master.connect(comp);
  comp.connect(c.destination);
  return { c, out: master, t: c.currentTime + 0.02 };
}

/** Suiting up: whir → clunk → hiss. */
export function playSuitOn(): void {
  try {
    const s = start();
    if (!s) return;
    const { c, out, t } = s;
    servo(c, out, t, 90, 330, 0.42);
    ratchet(c, out, t + 0.1, 4, 0.08);
    clunk(c, out, t + 0.45, 1);
    hiss(c, out, t + 0.47, 0.6, 0.26);
  } catch {
    // sound is decoration — never let it break the toggle
  }
}

/** Suiting down: release hiss → whir winding down → lighter clunk. */
export function playSuitOff(): void {
  try {
    const s = start();
    if (!s) return;
    const { c, out, t } = s;
    hiss(c, out, t, 0.32, 0.2);
    servo(c, out, t + 0.12, 320, 85, 0.4);
    ratchet(c, out, t + 0.18, 3, 0.09);
    clunk(c, out, t + 0.55, 0.6);
  } catch {
    // sound is decoration — never let it break the toggle
  }
}
