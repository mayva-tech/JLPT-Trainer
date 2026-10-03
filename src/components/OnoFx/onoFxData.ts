/**
 * Onomatopoeia effects — every オノマトペ word gets a visual effect that acts
 * out its meaning: ドキドキ makes the word beat with rising hearts, ゴロゴロ
 * rattles it with rumble lines, キラキラ makes it glint with sparkles.
 *
 * An effect = a motion for the word itself + a particle recipe around it +
 * one accent colour. Mapping is explicit per word (no guessing), and a test
 * checks every word in the corpus has one.
 */

export type OnoMotion =
  | "none"
  | "pulse"
  | "bounce"
  | "wobble"
  | "sway"
  | "drift"
  | "glint"
  | "jump"
  | "slide"
  | "droop"
  | "rattle"
  | "grow"
  | "pop"
  | "thump"
  | "drip"
  | "jitter"
  | "snap"
  | "puff"
  | "float"
  | "spin"
  | "shiver"
  | "echo"
  | "blur"
  | "sigh"
  | "tiptoe"
  | "freeze"
  | "meander"
  | "dash"
  | "glow"
  | "stomp"
  | "flicker"
  | "stretch";

export type OnoParticleKind =
  | "none"
  | "hearts"
  | "sparkles"
  | "stars"
  | "zzz"
  | "rain"
  | "soundwaves"
  | "exclaim"
  | "question"
  | "flow"
  | "gloom"
  | "rumble"
  | "throb"
  | "arrows"
  | "burst"
  | "impact"
  | "cracks"
  | "drips"
  | "check"
  | "swirl"
  | "clouds"
  | "cold"
  | "shine"
  | "chatter"
  | "haze"
  | "sweat"
  | "puff"
  | "anger"
  | "speed"
  | "bubbles"
  | "zap"
  | "steps"
  | "tears"
  | "eyes"
  | "blush"
  | "flowers"
  | "notes"
  | "scatter"
  | "ellipsis";

export interface OnoFx {
  motion: OnoMotion;
  particles: OnoParticleKind;
  /** Accent colour for the particles (and the glow, for glow/glint). */
  color: string;
}

/** [motion, particles, colour] per word (keyed by the kana as written in the corpus). */
const WORD_FX: Record<string, [OnoMotion, OnoParticleKind, string]> = {
  どきどき: ["pulse", "hearts", "#e8506a"],
  にこにこ: ["bounce", "flowers", "#f08aa8"],
  ぺこぺこ: ["wobble", "rumble", "#d8903a"],
  ぐっすり: ["sway", "zzz", "#7a8ad8"],
  ゆっくり: ["drift", "flow", "#6aa8c8"],
  ぴかぴか: ["glint", "shine", "#f2c84a"],
  ざあざあ: ["none", "rain", "#4a8ad8"],
  わんわん: ["bounce", "soundwaves", "#c88a4a"],
  にゃあにゃあ: ["wobble", "soundwaves", "#e89a5a"],
  きらきら: ["glint", "sparkles", "#f2c84a"],
  そろそろ: ["tiptoe", "steps", "#8a9aaa"],
  はっきり: ["snap", "check", "#3a8ad8"],
  しっかり: ["stomp", "check", "#3a9a5a"],
  わくわく: ["bounce", "stars", "#f29a3a"],
  びっくり: ["jump", "exclaim", "#e8503a"],
  ぺらぺら: ["slide", "flow", "#3aa8a8"],
  がっかり: ["droop", "gloom", "#7a6aa8"],
  ごろごろ: ["rattle", "rumble", "#8a7a6a"],
  どんどん: ["grow", "arrows", "#e8703a"],
  ぱちぱち: ["pop", "burst", "#f2b03a"],
  こんこん: ["thump", "impact", "#8a6a4a"],
  からから: ["rattle", "cracks", "#c8a060"],
  べたべた: ["drip", "drips", "#c87a3a"],
  ばらばら: ["jitter", "scatter", "#8a8a9a"],
  ぴったり: ["snap", "check", "#3a9a7a"],
  たっぷり: ["puff", "bubbles", "#5aa8e0"],
  ちゃんと: ["snap", "check", "#3a8a5a"],
  のんびり: ["float", "clouds", "#7ab8e0"],
  ぶらぶら: ["sway", "steps", "#9a8a6a"],
  くるくる: ["spin", "swirl", "#e86aa8"],
  だんだん: ["grow", "arrows", "#6a9ad8"],
  ふわふわ: ["float", "clouds", "#a8b8e8"],
  ぶるぶる: ["shiver", "cold", "#5aa8e8"],
  ぐるぐる: ["spin", "swirl", "#8a6ad8"],
  すっきり: ["pop", "sparkles", "#3ac8b8"],
  そっくり: ["echo", "none", "#8a6ad8"],
  がらがら: ["rattle", "soundwaves", "#9a9aa8"],
  ぼんやり: ["blur", "haze", "#9aa8c8"],
  うっかり: ["wobble", "sweat", "#5ab8e8"],
  きちんと: ["snap", "check", "#3a7ab8"],
  ほっと: ["sigh", "puff", "#8ac8a8"],
  いらいら: ["jitter", "anger", "#e84a3a"],
  のろのろ: ["drift", "steps", "#9aa06a"],
  こっそり: ["tiptoe", "steps", "#6a6a8a"],
  そっと: ["tiptoe", "flow", "#9ab8c8"],
  じっと: ["freeze", "eyes", "#5a6a8a"],
  うろうろ: ["meander", "steps", "#a88a5a"],
  ふらふら: ["meander", "swirl", "#a8a0c8"],
  すらすら: ["slide", "flow", "#3aa8a8"],
  ぎっしり: ["thump", "impact", "#8a6a4a"],
  じめじめ: ["drip", "drips", "#6a9a8a"],
  ますます: ["grow", "arrows", "#e8703a"],
  ざっと: ["dash", "speed", "#6a8ab8"],
  さっと: ["dash", "speed", "#3aa8c8"],
  ぱっと: ["pop", "burst", "#f2b03a"],
  つるつる: ["slide", "shine", "#6ac8e8"],
  ぶつぶつ: ["jitter", "chatter", "#8a7a8a"],
  ばたばた: ["rattle", "sweat", "#e88a3a"],
  かちかち: ["freeze", "cracks", "#8ab8d8"],
  ごくごく: ["bounce", "bubbles", "#4aa8e0"],
  びりびり: ["shiver", "zap", "#f2c83a"],
  ずらり: ["slide", "flow", "#8a8ac8"],
  くたくた: ["droop", "sweat", "#9a8aa8"],
  こつこつ: ["thump", "steps", "#8a6a4a"],
  どんより: ["droop", "clouds", "#7a7a8a"],
  わざわざ: ["glow", "steps", "#c88a5a"],
  いよいよ: ["grow", "stars", "#e8703a"],
  そわそわ: ["jitter", "sweat", "#e8a03a"],
  はらはら: ["shiver", "sweat", "#e8703a"],
  うんざり: ["droop", "gloom", "#7a6a8a"],
  ぼろぼろ: ["jitter", "cracks", "#8a6a4a"],
  だらだら: ["drip", "drips", "#c8a03a"],
  しんと: ["freeze", "ellipsis", "#8a9ab8"],
  ぐんぐん: ["grow", "arrows", "#3aa86a"],
  がやがや: ["rattle", "chatter", "#c8883a"],
  ざわざわ: ["shiver", "chatter", "#8a8ab8"],
  ぬるぬる: ["drip", "drips", "#6aa86a"],
  さらさら: ["slide", "flow", "#c8b07a"],
  ぶかぶか: ["puff", "none", "#6a8ab8"],
  くよくよ: ["droop", "gloom", "#7a7aa8"],
  しょんぼり: ["droop", "tears", "#7a8ab8"],
  ひやひや: ["shiver", "sweat", "#5ab8e8"],
  にやにや: ["wobble", "blush", "#e86a8a"],
  うっすら: ["blur", "haze", "#b8c8d8"],
  きっぱり: ["snap", "impact", "#3a6ab8"],
  あっさり: ["pop", "sparkles", "#8ac8a8"],
  さっぱり: ["pop", "sparkles", "#3ac8b8"],
  しみじみ: ["glow", "ellipsis", "#c89a6a"],
  つくづく: ["glow", "ellipsis", "#a88a6a"],
  うとうと: ["sway", "zzz", "#8a9ad8"],
  ぐったり: ["droop", "sweat", "#9a8aa8"],
  へとへと: ["droop", "sweat", "#b88a6a"],
  ばりばり: ["shiver", "zap", "#e8703a"],
  てきぱき: ["snap", "check", "#3a9a7a"],
  すたすた: ["dash", "steps", "#6a8a6a"],
  てくてく: ["bounce", "steps", "#8a7a5a"],
  よろよろ: ["meander", "sweat", "#a89a7a"],
  こそこそ: ["tiptoe", "eyes", "#6a6a8a"],
  もじもじ: ["wobble", "blush", "#e88aa8"],
  ぞくぞく: ["shiver", "cold", "#6a8ad8"],
  ぞっと: ["freeze", "cold", "#6a7ab8"],
  むかむか: ["jitter", "anger", "#6aa84a"],
  いきいき: ["bounce", "stars", "#3ab86a"],
  うきうき: ["bounce", "notes", "#f08ac0"],
  がっしり: ["stomp", "impact", "#6a5a4a"],
  ぐらぐら: ["rattle", "rumble", "#a88a5a"],
  ぐちゃぐちゃ: ["jitter", "scatter", "#a87a6a"],
  かんかん: ["jitter", "anger", "#e8503a"],
  ぺちゃくちゃ: ["rattle", "chatter", "#e88aa8"],
  ひそひそ: ["tiptoe", "chatter", "#8a8ab8"],
  ぼそぼそ: ["tiptoe", "ellipsis", "#8a8a8a"],
  ちらちら: ["flicker", "eyes", "#c8a03a"],
  じろじろ: ["freeze", "eyes", "#8a6a5a"],
  ぼちぼち: ["drift", "steps", "#8a9a7a"],
  すやすや: ["sway", "zzz", "#a8b8e8"],
  ぐずぐず: ["drift", "sweat", "#9a8a7a"],
  ちょこちょこ: ["bounce", "steps", "#e8a05a"],
  まごまご: ["wobble", "question", "#e8a03a"],
  おどおど: ["shiver", "sweat", "#a8a0c8"],
  はきはき: ["snap", "soundwaves", "#3a8ad8"],
  ずきずき: ["pulse", "throb", "#e8503a"],
  ひりひり: ["shiver", "throb", "#e8703a"],
  がんがん: ["thump", "throb", "#c84a3a"],
  じわじわ: ["grow", "drips", "#c8783a"],
  のびのび: ["stretch", "flowers", "#6ac87a"],
  せかせか: ["dash", "speed", "#e88a3a"],
  あたふた: ["rattle", "sweat", "#e8903a"],
  ぼうっと: ["blur", "haze", "#9aa8c8"],
  しくしく: ["droop", "tears", "#6a8ac8"],
  わいわい: ["bounce", "chatter", "#e8a03a"],
  どっと: ["dash", "burst", "#e8703a"],
};

/** Gentle default for any word added later without a mapping. */
export const DEFAULT_ONO_FX: OnoFx = { motion: "glow", particles: "sparkles", color: "#e8a54b" };

/** Normalise katakana to hiragana so ドキドキ and どきどき share an effect. */
export function toHiragana(s: string): string {
  return s.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function hasOnoFx(word: string): boolean {
  return toHiragana(word.trim()) in WORD_FX;
}

export function onoFxFor(word: string): OnoFx {
  const hit = WORD_FX[toHiragana(word.trim())];
  return hit ? { motion: hit[0], particles: hit[1], color: hit[2] } : DEFAULT_ONO_FX;
}

export const ONO_FX_WORDS: readonly string[] = Object.keys(WORD_FX);
