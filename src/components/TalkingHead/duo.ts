/**
 * Duo (two-head) stage logic — pure, so it can be tested without a DOM.
 *
 * When both voices have spoken within a short window (a JA line followed by
 * its EN translation, as the phone scripts, speech styles, player and quests
 * already do), Nanami and Andrew share the stage: Nanami on the left, Andrew
 * on the right, facing each other. The one speaking animates; the other
 * listens — turned toward the speaker, eyes on them, nodding now and then.
 */

export type Voice = "ja" | "en";

/** Left-to-right seating: Japanese first, matching reading order. */
export const DUO_ORDER: readonly Voice[] = ["ja", "en"];

/** How long after the last line of one voice the pair stays together. */
export const DUO_WINDOW_MS = 30_000;

/** Last time each voice started speaking (ms). */
export type RecentVoices = Partial<Record<Voice, number>>;

export type SeatRole = "solo" | "speaking" | "listening" | "idle";

export function recordVoice(
  recent: RecentVoices,
  voice: Voice,
  now: number
): RecentVoices {
  return { ...recent, [voice]: now };
}

/** Both voices spoke, and the older of the two is still within the window. */
export function isDuoActive(
  recent: RecentVoices,
  now: number,
  windowMs = DUO_WINDOW_MS
): boolean {
  const { ja, en } = recent;
  if (ja === undefined || en === undefined) return false;
  return now - Math.min(ja, en) <= windowMs;
}

/** Ms until an active duo falls back to solo, or null when not in duo. */
export function msUntilSolo(
  recent: RecentVoices,
  now: number,
  windowMs = DUO_WINDOW_MS
): number | null {
  if (!isDuoActive(recent, now, windowMs)) return null;
  return Math.max(0, Math.min(recent.ja!, recent.en!) + windowMs - now);
}

/** +1 when the seat faces right (left seat), -1 when it faces left. */
export function facingSign(voice: Voice): 1 | -1 {
  return voice === DUO_ORDER[0] ? 1 : -1;
}

export function seatRole(
  duo: boolean,
  voice: Voice,
  current: Voice | null,
  speaking: boolean
): SeatRole {
  if (!duo) return "solo";
  if (!speaking) return "idle";
  return voice === current ? "speaking" : "listening";
}

/**
 * Eye offset toward the partner, in viewBox units. `toward` is the partner's
 * direction along one axis (-1…1); it defaults to the seated side-by-side pair.
 */
export function gazeBias(
  role: SeatRole,
  voice: Voice,
  toward: number = facingSign(voice)
): number {
  if (role === "listening") return toward * 1.4;
  if (role === "speaking") return toward * 0.8;
  if (role === "idle") return toward * 0.5;
  return 0;
}

/** Head tilt toward the partner (deg), added to the idle tilt. */
export function tiltBias(
  role: SeatRole,
  voice: Voice,
  toward: number = facingSign(voice)
): number {
  if (role === "listening") return toward * 4.5;
  if (role === "speaking") return toward * 1.5;
  if (role === "idle") return toward * 1;
  return 0;
}
