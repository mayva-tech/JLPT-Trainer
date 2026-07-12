export type PlaybackTiming = {
  // ① Category card
  categoryDisplayMs: number;

  // ② Word card
  wordAudioGapMs: number; // gap between the two word audio plays
  afterWordCardMs: number; // hold time after second audio

  // ③ Phrase card
  afterPhraseMs: number;

  // ④ Sentence card
  afterSentenceMs: number;

  // ⑤ Shadowing card
  shadowingListenGapMs: number; // gap after "Listen..." before phrase plays
  shadowingRepeatGapMs: number; // gap after phrase before "Repeat..." appears
  shadowingRepeatHoldMs: number; // hold the "Repeat..." screen

  // ⑥ Review card
  reviewHoldMs: number;

  // Between items
  transitionMs: number;
};

export const playbackTiming: PlaybackTiming = {
  categoryDisplayMs: 2000,
  wordAudioGapMs: 800,
  afterWordCardMs: 1200,
  afterPhraseMs: 1500,
  afterSentenceMs: 2000,
  shadowingListenGapMs: 800,
  shadowingRepeatGapMs: 1500,
  shadowingRepeatHoldMs: 3000,
  reviewHoldMs: 2500,
  transitionMs: 400,
};
