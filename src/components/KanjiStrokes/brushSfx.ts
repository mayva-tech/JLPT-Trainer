/**
 * Brush-on-paper sound for stroke-order writing, synthesised with the Web
 * Audio API (no audio files): one soft swish per stroke, lasting as long as
 * the stroke is drawn. Each swish is filtered noise: a slightly louder
 * landing, then a hiss whose pitch rises as the brush travels and fades as
 * it lifts. Without Web Audio (tests, old browsers) it is a silent no-op.
 */

export interface BrushSoundStroke {
  /** ms from the start of the word. */
  delay: number;
  /** ms the stroke takes to draw. */
  duration: number;
}

const MASTER_VOLUME = 0.32;
const NOISE_SECONDS = 2;

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
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

function getNoise(c: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === c.sampleRate) return noise;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * NOISE_SECONDS), c.sampleRate);
  const ch = buf.getChannelData(0);
  // Pinkish noise (a running average of white) sounds like paper, not static.
  let last = 0;
  for (let i = 0; i < ch.length; i++) {
    last = last * 0.86 + (Math.random() * 2 - 1) * 0.14;
    ch[i] = last * 3.2;
  }
  noise = buf;
  return buf;
}

function swish(c: AudioContext, out: AudioNode, t: number, seconds: number): AudioScheduledSourceNode {
  const dur = Math.max(0.06, seconds);
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  src.loop = true;

  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(1500, t);
  band.frequency.linearRampToValueAtTime(2900, t + dur);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.9, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.5, t + Math.min(0.06, dur * 0.4));
  g.gain.setValueAtTime(0.5, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.04);

  src.connect(band);
  band.connect(g);
  g.connect(out);
  src.start(t, Math.random() * (NOISE_SECONDS - 0.5));
  src.stop(t + dur + 0.06);
  return src;
}

/**
 * Schedule one swish per stroke, `offsetMs` after now. Returns a cancel
 * function that silences any swish not yet finished (word replaced, view left).
 */
export function playBrushStrokes(strokes: readonly BrushSoundStroke[], offsetMs = 0): () => void {
  if (!strokes.length) return () => {};
  try {
    const c = getCtx();
    if (!c) return () => {};
    if (c.state === "suspended") void c.resume().catch(() => {});
    const master = c.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(c.destination);
    const t0 = c.currentTime + 0.02 + offsetMs / 1000;
    const sources = strokes.map((s) => swish(c, master, t0 + s.delay / 1000, s.duration / 1000));
    return () => {
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          // already stopped
        }
      }
      master.disconnect();
    };
  } catch {
    // sound is decoration — never let it break the writing
    return () => {};
  }
}
