export const DEFAULT_INTRO = {
  english:
    "Let’s practice 10 JLPT N2 words commonly used at the supermarket.",
  japanese: "スーパーでよく使うN2単語を、10個だけ練習しましょう。",
} as const;

export const DEFAULT_CTA = {
  japanese:
    "今日の10単語を、もう一度声に出して練習してみましょう。次のレッスンもチェックしてください。",
  english:
    "Practice today’s 10 words aloud one more time, and continue with the next lesson.",
} as const;

export const INTRO_STORAGE_KEY = "jlpt-trainer-intro-hook";
export const CTA_STORAGE_KEY = "jlpt-trainer-ending-cta";
