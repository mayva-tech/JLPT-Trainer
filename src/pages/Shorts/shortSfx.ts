/**
 * The message hook's notification: a two-note ding over a double buzz,
 * synthesized with Web Audio (no sound file, nothing borrowed from a real
 * messaging app). Plays through the page's audio, so OBS records it with
 * the voices. Silently does nothing where Web Audio is missing (tests).
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

export function playSfx(kind: "ding"): void {
  if (kind !== "ding") return;
  const ac = audio();
  if (!ac) return;
  try {
    const t = ac.currentTime + 0.02;
    const out = ac.createGain();
    out.gain.value = 0.9;
    out.connect(ac.destination);
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
