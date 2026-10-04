/**
 * Quiz answer sounds, synthesised with the Web Audio API (no audio files).
 *
 *   correct  quiz-show "ping-pong": two bright bell notes, high then lower
 *   wrong    a short double buzz, low and rough
 *   almost   one soft mid note — acceptable but not natural
 *
 * Each cue is under half a second so it is over before the feedback speech
 * that usually follows an answer. Played from an answer click or key press (a
 * user gesture), so browsers let the AudioContext start. Without Web Audio
 * (tests, very old browsers) every call is a silent no-op.
 */

type Ctx = AudioContext;

const MASTER_VOLUME = 0.35;

let ctx: Ctx | null = null;

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

/** One oscillator note with a fast attack and an exponential fade. */
function note(
  c: Ctx,
  out: AudioNode,
  t: number,
  opts: { type: OscillatorType; freq: number; peak: number; decay: number; attack?: number },
) {
  const attack = opts.attack ?? 0.005;
  const osc = c.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, t);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + opts.decay);
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + attack + opts.decay + 0.05);
}

/** Bell-like note: a sine with a quieter octave partial for shine. */
function bell(c: Ctx, out: AudioNode, t: number, freq: number, decay: number) {
  note(c, out, t, { type: "sine", freq, peak: 0.5, decay });
  note(c, out, t, { type: "sine", freq: freq * 2, peak: 0.12, decay: decay * 0.6 });
  note(c, out, t, { type: "triangle", freq, peak: 0.08, decay: decay * 0.5 });
}

/** Low buzz: square + detuned saw through a low-pass, so it reads as "no". */
function buzz(c: Ctx, out: AudioNode, t: number, dur: number) {
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(900, t);
  f.Q.value = 1;
  f.connect(out);
  note(c, f, t, { type: "square", freq: 155, peak: 0.32, decay: dur, attack: 0.01 });
  note(c, f, t, { type: "sawtooth", freq: 150, peak: 0.22, decay: dur, attack: 0.01 });
}

type Synth = (c: Ctx, out: AudioNode, t: number) => void;

const correct: Synth = (c, out, t) => {
  bell(c, out, t, 1319, 0.22); // E6
  bell(c, out, t + 0.13, 1047, 0.38); // C6
};

const wrong: Synth = (c, out, t) => {
  buzz(c, out, t, 0.13);
  buzz(c, out, t + 0.17, 0.24);
};

const almost: Synth = (c, out, t) => {
  note(c, out, t, { type: "triangle", freq: 660, peak: 0.35, decay: 0.3 });
};

function play(synth: Synth) {
  try {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") void c.resume().catch(() => {});
    const master = c.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(c.destination);
    synth(c, master, c.currentTime + 0.01);
  } catch {
    // sound is decoration — never let it break a quiz
  }
}

/** Sound for an answer: `true` correct, `false` wrong, `"almost"` acceptable. */
export function playAnswerSound(result: boolean | "almost"): void {
  play(result === "almost" ? almost : result ? correct : wrong);
}
