/**
 * Optional Game Mode sound hooks. The first implementation is silent so play
 * never depends on audio, but call sites should go through this helper so
 * cues can be wired later without touching every mode.
 */
export type GameSfx =
  | "correct"
  | "wrong"
  | "combo"
  | "hit"
  | "defeated"
  | "gameover"
  | "victory"
  | "levelup";

export function playGameSfx(_kind: GameSfx): void {
  void _kind;
}
