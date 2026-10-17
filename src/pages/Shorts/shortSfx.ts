/**
 * Short sound cues, synthesized with Web Audio:
 *   ding    the message hook's notification
 *   tick    one per second of the 3-2-1 (the last one a little brighter)
 *   timeup  the countdown ends, right before the answer
 *
 * The ding is two notes over a double buzz (no sound file, nothing borrowed
 * from a real messaging app). Everything plays through the page's audio, so
 * OBS records it with the voices. Silently does nothing where Web Audio is
 * missing (tests).
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  const Ctor =
    (globalThis as { AudioContext?: typeof AudioContext }).AudioContext ??
    (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    return ctx;
  } catch {
    return null;
  }
}

function tone(ac: AudioContext, out: AudioNode, freq: number, at: number, length: number, peak: number, type: OscillatorType) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

function buzz(ac: AudioContext, out: AudioNode, at: number, length: number) {
  const osc = ac.createOscillator();
  const lp = ac.createBiquadFilter();
  const gain = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, at);
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(420, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.07, at + 0.015);
  gain.gain.setValueAtTime(0.07, at + length - 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(lp).connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

export type SfxKind = "ding" | "tick" | "timeup";

/** A soft wooden tick: a short click of filtered noise over a high blip. */
function tick(ac: AudioContext, out: AudioNode, at: number, last: boolean) {
  const len = 0.05;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(last ? 2400 : 1900, at);
  bp.Q.setValueAtTime(6, at);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(last ? 0.5 : 0.38, at);
  src.connect(bp).connect(gain).connect(out);
  src.start(at);
  tone(ac, out, last ? 1568 : 1175, at, 0.07, last ? 0.07 : 0.05, "triangle");
}

export function playSfx(kind: SfxKind, opts: { last?: boolean } = {}): void {
  const ac = audio();
  if (!ac) return;
  try {
    const t = ac.currentTime + 0.02;
    const out = ac.createGain();
    out.gain.value = 0.9;
    out.connect(ac.destination);
    if (kind === "tick") {
      tick(ac, out, t, Boolean(opts.last));
      return;
    }
    if (kind === "timeup") {
      // Time's up: a quick rising two-note "pop", softer than the message ding.
      tone(ac, out, 880, t, 0.14, 0.09, "triangle");
      tone(ac, out, 1320, t + 0.08, 0.32, 0.11, "sine");
      return;
    }
    buzz(ac, out, t, 0.16);
    buzz(ac, out, t + 0.24, 0.16);
    // Two bright notes, a fourth apart (E6 → A6), with a soft octave shimmer.
    tone(ac, out, 1318.5, t, 0.42, 0.16, "sine");
    tone(ac, out, 2637, t, 0.18, 0.03, "sine");
    tone(ac, out, 1760, t + 0.13, 0.6, 0.15, "sine");
    tone(ac, out, 3520, t + 0.13, 0.22, 0.025, "sine");
  } catch {
    // An audio glitch never stops a recording.
  }
}
