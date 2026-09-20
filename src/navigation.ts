/**
 * Shared navigation types for the shell and trainers.
 *
 * `OpenTrainer` takes an optional target so callers that only know "leave the
 * game" keep working (`() => void` is assignable), while quest exits can later
 * route to a specific trainer without widening every callback site at once.
 */

export type TrainerView =
  | "player"
  | "konbini"
  | "trip"
  | "relations"
  | "phone"
  | "style";

export type OpenTrainer = (target?: TrainerView) => void;
