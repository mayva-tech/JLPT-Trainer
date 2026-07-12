// The six steps that play for every vocabulary item.
export type StepName =
  | "category" // ① category label
  | "word" // ② word + reading + meaning (audio ×2)
  | "phrase" // ③ phrase + reading + meaning
  | "sentence" // ④ full example sentence
  | "shadowing" // ⑤ "Listen… / Repeat…" prompt
  | "review"; // ⑥ word + reading + meaning again

export type PlayerStatus = "idle" | "playing" | "paused" | "finished";
