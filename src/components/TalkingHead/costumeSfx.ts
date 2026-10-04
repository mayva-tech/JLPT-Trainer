/**
 * Costume change sounds, synthesised with the Web Audio API — no audio
 * files, so it works offline and adds nothing to the bundle.
 *
 * Each costume has its own "on" sound; the mecha suit also has its own
 * "off" sound, and the others share a soft poof when they come off.
 *
 * Mecha, suiting up (timed to the CSS reveal in talking-head.css):
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
function start(level = 1): { c: Ctx; out: AudioNode; t: number } | null {
  const c = getCtx();
  if (!c) return null;
  if (c.state === "suspended") void c.resume().catch(() => {});
  const master = c.createGain();
  master.gain.value = MASTER_VOLUME * level;
  const comp = c.createDynamicsCompressor();
  // Only catches peaks; levels are balanced per costume in LEVEL below.
  if (comp.threshold) {
    comp.threshold.value = -8;
    comp.knee.value = 6;
    comp.ratio.value = 4;
  }
  master.connect(comp);
  comp.connect(c.destination);
  return { c, out: master, t: c.currentTime + 0.02 };
}

/** A single tone with a pitch glide and its own envelope. */
function tone(
  c: Ctx,
  out: AudioNode,
  t: number,
  opts: { type: OscillatorType; from: number; to?: number; glide?: number; peak: number; attack: number; decay: number }
) {
  const osc = c.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, t);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.glide ?? opts.decay));
  osc.connect(envelope(c, out, t, opts.peak, opts.attack, opts.decay));
  osc.start(t);
  osc.stop(t + opts.attack + opts.decay + 0.05);
}

type Synth = (c: Ctx, out: AudioNode, t: number) => void;

/** Mecha on: whir → clunk → hiss. */
const mechaOn: Synth = (c, out, t) => {
  servo(c, out, t, 90, 330, 0.42);
  ratchet(c, out, t + 0.1, 4, 0.08);
  clunk(c, out, t + 0.45, 1);
  hiss(c, out, t + 0.47, 0.6, 0.26);
};

/** Mecha off: release hiss → whir winding down → lighter clunk. */
const mechaOff: Synth = (c, out, t) => {
  hiss(c, out, t, 0.32, 0.2);
  servo(c, out, t + 0.12, 320, 85, 0.4);
  ratchet(c, out, t + 0.18, 3, 0.09);
  clunk(c, out, t + 0.55, 0.6);
};

/** Samurai: armour plates rattling into place, then a taiko-style drum hit. */
const samuraiOn: Synth = (c, out, t) => {
  [0, 0.07, 0.15, 0.21, 0.3].forEach((dt, i) => {
    tone(c, out, t + dt, { type: "square", from: 2300 + i * 210, peak: 0.035, attack: 0.002, decay: 0.09 });
    burst(c, out, t + dt, { type: "bandpass", freq: 3800, q: 6, peak: 0.12, attack: 0.002, decay: 0.04 });
  });
  tone(c, out, t + 0.45, { type: "sine", from: 120, to: 52, glide: 0.25, peak: 0.6, attack: 0.004, decay: 0.55 });
  burst(c, out, t + 0.45, { type: "lowpass", freq: 500, peak: 0.3, attack: 0.003, decay: 0.12 });
};

/** Shinobi: a whoosh, a smoke-bomb puff and a short blade ring. */
const shinobiOn: Synth = (c, out, t) => {
  burst(c, out, t, { type: "bandpass", freq: 400, freqTo: 2800, q: 1.2, peak: 0.3, attack: 0.18, decay: 0.2 });
  burst(c, out, t + 0.4, { type: "lowpass", freq: 1600, freqTo: 250, peak: 0.45, attack: 0.01, decay: 0.35 });
  tone(c, out, t + 0.5, { type: "sine", from: 3150, peak: 0.06, attack: 0.003, decay: 0.45 });
  tone(c, out, t + 0.5, { type: "sine", from: 4720, peak: 0.03, attack: 0.003, decay: 0.3 });
};

/** Idol: a rising sparkle arpeggio and a soft shimmering chord. */
const idolOn: Synth = (c, out, t) => {
  [1047, 1319, 1568, 2093, 2637].forEach((f, i) => {
    tone(c, out, t + i * 0.065, { type: "triangle", from: f, peak: 0.14, attack: 0.005, decay: 0.28 });
  });
  [523, 659, 784].forEach((f) => {
    tone(c, out, t + 0.4, { type: "triangle", from: f, peak: 0.07, attack: 0.03, decay: 0.6 });
  });
  burst(c, out, t + 0.38, { type: "highpass", freq: 7000, peak: 0.08, attack: 0.05, decay: 0.5 });
};

/** Kigurumi: a springy boing and a little squeak. */
const kigurumiOn: Synth = (c, out, t) => {
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(260, t);
  osc.frequency.exponentialRampToValueAtTime(620, t + 0.09);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.22);
  osc.frequency.exponentialRampToValueAtTime(470, t + 0.32);
  osc.frequency.exponentialRampToValueAtTime(340, t + 0.45);
  osc.connect(envelope(c, out, t, 0.35, 0.01, 0.5));
  osc.start(t);
  osc.stop(t + 0.6);
  burst(c, out, t + 0.45, { type: "lowpass", freq: 1200, freqTo: 300, peak: 0.25, attack: 0.01, decay: 0.2 });
  tone(c, out, t + 0.55, { type: "triangle", from: 1300, to: 1900, glide: 0.08, peak: 0.12, attack: 0.005, decay: 0.12 });
};

/** RPG hero: a short rising fanfare ending on a held, sparkling note. */
const heroOn: Synth = (c, out, t) => {
  const notes = [392, 523, 659];
  notes.forEach((f, i) => {
    tone(c, out, t + i * 0.1, { type: "square", from: f, peak: 0.03, attack: 0.005, decay: 0.12 });
    tone(c, out, t + i * 0.1, { type: "triangle", from: f, peak: 0.12, attack: 0.005, decay: 0.14 });
  });
  tone(c, out, t + 0.32, { type: "square", from: 784, peak: 0.03, attack: 0.01, decay: 0.7 });
  tone(c, out, t + 0.32, { type: "triangle", from: 784, peak: 0.14, attack: 0.01, decay: 0.75 });
  tone(c, out, t + 0.32, { type: "triangle", from: 1568, peak: 0.04, attack: 0.02, decay: 0.6 });
  burst(c, out, t + 0.34, { type: "highpass", freq: 6500, peak: 0.07, attack: 0.04, decay: 0.55 });
};

/** Soft poof as a costume comes off (all but the mecha suit). */
const poofOff: Synth = (c, out, t) => {
  burst(c, out, t, { type: "lowpass", freq: 1500, freqTo: 300, peak: 0.4, attack: 0.01, decay: 0.3 });
  tone(c, out, t + 0.02, { type: "sine", from: 620, to: 210, glide: 0.25, peak: 0.12, attack: 0.005, decay: 0.28 });
};

/** Each sound with a level that evens out how loud they feel. */
type Cue = [Synth, number];

const ON: Record<string, Cue> = {
  mecha: [mechaOn, 1],
  samurai: [samuraiOn, 0.65],
  shinobi: [shinobiOn, 3.4],
  idol: [idolOn, 2.4],
  kigurumi: [kigurumiOn, 1.9],
  hero: [heroOn, 1.6],
};

const OFF: Record<string, Cue> = { mecha: [mechaOff, 1] };
const POOF_OFF: Cue = [poofOff, 3];

function play(cue: Cue | undefined) {
  if (!cue) return;
  const [synth, level] = cue;
  try {
    const s = start(level);
    if (!s) return;
    synth(s.c, s.out, s.t);
  } catch {
    // sound is decoration — never let it break the costume change
  }
}

/** Sound for putting a costume on. Unknown ids are silent. */
export function playCostumeOn(id: string): void {
  play(ON[id]);
}

/** Sound for taking a costume off. */
export function playCostumeOff(id: string): void {
  play(OFF[id] ?? POOF_OFF);
}
