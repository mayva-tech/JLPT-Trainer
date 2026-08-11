/**
 * Particle kana that TTS misreads when spoken as a kana-only string.
 * Display / karaoke keep the surface characters; only the audio string changes.
 *
 * Important: only rewrite true particles / particle compounds. Never run a
 * global は→わ replace inside content words (はくさん, りはーさる, はなし…).
 */

/** Vowel letter that prolongs the mora before ー (browser TTS often skips ー). */
function choonVowelFor(prev: string): string | null {
  if (
    /[ぁあかがさざただなはばぱまゃやらわァアカガサザタダナハバパマャヤラワ]/.test(
      prev
    )
  ) {
    return "あ";
  }
  if (
    /[ぃいきぎしじちぢにひびぴみりゐィイキギシジチヂニヒビピミリヰ]/.test(prev)
  ) {
    return "い";
  }
  if (
    /[ぅうくぐすずつづぬふぶぷむゅゆるゥウクグスズツヅヌフブプムュユル]/.test(
      prev
    )
  ) {
    return "う";
  }
  if (
    /[ぇえけげせぜてでねへべぺめれゑェエケゲセゼテデネヘベペメレヱ]/.test(prev)
  ) {
    return "え";
  }
  if (
    /[ぉおこごそぞとどのほぼぽもょよろをォオコゴソゾトドノホボポモョヨロヲ]/.test(
      prev
    )
  ) {
    return "お";
  }
  return null;
}

/**
 * Expand ー into the matching vowel so loanwords like すとーりー / ストーリー
 * keep their length (すとおりい) under ja-JP speech synthesis.
 */
function expandChoonpu(kana: string): string {
  let out = "";
  for (const ch of kana) {
    if (ch === "ー" || ch === "ｰ") {
      const prev = out.at(-1);
      const vowel = prev ? choonVowelFor(prev) : null;
      out += vowel ?? ch;
    } else {
      out += ch;
    }
  }
  return out;
}

function speakParticleKana(kana: string): string {
  if (!kana) return kana;

  // Isolated particles (own reading token)
  if (kana === "は") return "わ";
  if (kana === "へ") return "え";

  // Whole-token particle compounds
  if (/^(に|で|と|の|から|まで|より|へ|て)は$/u.test(kana)) {
    return `${kana.slice(0, -1)}わ`;
  }
  // 経て
  if (kana === "へて") return "えて";

  let out = kana;

  // Grammar-pattern / set-phrase particle は (longest / most specific first)
  if (out.startsWith("とは")) {
    out = `とわ${out.slice(2)}`;
  }
  out = out.replace(/べきではない/g, "べきでわない");
  out = out.replace(/ものではない/g, "ものでわない");
  out = out.replace(/わけではない/g, "わけでわない");
  out = out.replace(/ではない/g, "でわない");
  out = out.replace(/かけては/g, "かけてわ");
  out = out.replace(/にしては/g, "にしてわ");
  out = out.replace(/ためには/g, "ためにわ");
  out = out.replace(/いじょうは/g, "いじょうわ");
  out = out.replace(/からには/g, "からにわ");
  out = out.replace(/ことには/g, "ことにわ");
  out = out.replace(/わけには/g, "わけにわ");
  out = out.replace(/わけでは/g, "わけでわ");
  out = out.replace(/ずには/g, "ずにわ");
  out = out.replace(/ないでは/g, "ないでわ");
  out = out.replace(/はずは/g, "はずわ");
  out = out.replace(/ことは/g, "ことわ");
  out = out.replace(/ものは/g, "ものわ");
  out = out.replace(/ては/g, "てわ");
  out = out.replace(/では/g, "でわ");
  // に反して / に反する keep はん — do not rewrite にはん
  out = out.replace(/には(?!ん)/g, "にわ");
  out = out.replace(/とは/g, "とわ");
  // 〜はともかく (not 〜はず / 〜はん / 〜はじめ)
  out = out.replace(/^〜は(?!ず|ん|じめ)/u, "〜わ");
  // Trailing topic は on a long pattern token (〜にかけては already handled)
  if (/^〜.+は$/u.test(out) && !/(はず|はん|はじめ)$/u.test(out)) {
    out = `${out.slice(0, -1)}わ`;
  }

  // Directional へて inside a longer token (〜をへて)
  out = out.replace(/へて/g, "えて");

  return expandChoonpu(out);
}

/**
 * Grammar slot marker 〜 / ～ / ~ — pause after each one before the next slot
 * (〜ばかりか〜も → 〜、ばかりか〜、も).
 */
export function appendWaveDashSpeakPause(text: string): string {
  return text.replace(/([〜～~])(?![、,\s]|$)/gu, "$1、");
}

function speakReadingToken(token: string): string {
  // Split on punctuation so glued chunks like 「は、さいご」 still rewrite.
  return token
    .split(/([、。！？．，!?,]+)/)
    .map((part) =>
      /^[、。！？．，!?,]+$/.test(part) ? part : speakParticleKana(part)
    )
    .join("");
}

/**
 * Complements that bind tightly after を in set grammar patterns
 * (留学をきっかけに — no long pause after を).
 * Matched as prefix of the next surface or reading token.
 */
const WO_BOUND_PATTERN_STEMS = [
  // readings
  "きっかけ",
  "けいき",
  "つうじて",
  "つうして",
  "めぐって",
  "はじめ",
  "もとに",
  "もと",
  "もって",
  "ちゅうしん",
  "まえに",
  "とわず",
  "ふまえて",
  "へて",
  "えて",
  "のぞいて",
  "のぞけば",
  "きに",
  "さかいに",
  "もくてき",
  "ねらって",
  "よそおって",
  "よぎなく",
  "ゆうせん",
  "ようする",
  "おすすめ",
  "おもんじる",
  "じゅうし",
  "だいいち",
  "ためす",
  "こころみる",
  // 見れば may be split into 見|れば; spoken timing sees みれ first.
  "みれ",
  "じっけん",
  "けいかく",
  "きもに",
  // surface (kanji / mixed)
  "契機",
  "通じて",
  "通して",
  "めぐって",
  "はじめ",
  "もと",
  "もって",
  "中心",
  "前に",
  "問わず",
  "踏まえて",
  "経て",
  "除いて",
  "除けば",
  "機に",
  "境に",
  "目的",
  "狙って",
  "装って",
  "余儀なく",
  "優先",
  "要する",
  "お勧め",
  "重んじ",
  "重視",
  "第一",
  "試す",
  "試み",
  "見",
  "実験",
  "計画",
  "肝に",
];

/**
 * Complements that bind tightly after に in set grammar patterns
 * (本日に限り — no long pause after に).
 * Matched as prefix of the next surface or reading token.
 */
const NI_BOUND_PATTERN_STEMS = [
  "かぎったはなしではない",
  "ぐんばいがあがった",
  "ごちゅういください",
  "ぐんばいがあがる",
  "ぐんばいをあげる",
  "こしたことはない",
  "越したことはない",
  "限った話ではない",
  "ご注意ください",
  "しゅうそくする",
  "たんをはっする",
  "ちがいなかった",
  "ちゃくしゅする",
  "ひけをとらない",
  "軍配が上がった",
  "かたいれする",
  "きまっている",
  "そうとうする",
  "はあたらない",
  "はおよばない",
  "は当たらない",
  "ひってきする",
  "ほかならない",
  "もかかわらず",
  "もほどがある",
  "決まっている",
  "軍配が上がる",
  "軍配を上げる",
  "違いなかった",
  "あいまって",
  "いたるまで",
  "かかわらず",
  "かんがみて",
  "きいんして",
  "きいんする",
  "さきだって",
  "しくはない",
  "したがって",
  "しのびない",
  "じゅんずる",
  "そういない",
  "ちがいない",
  "とどまらず",
  "ともなって",
  "は及ばない",
  "もとづいて",
  "も程がある",
  "如くはない",
  "端を発する",
  "肩入れする",
  "あたって",
  "いたって",
  "おうじて",
  "おちつく",
  "かぎって",
  "かぎらず",
  "かけては",
  "かんがみ",
  "かんして",
  "くわえて",
  "さいして",
  "すぎない",
  "そくして",
  "たいして",
  "たえない",
  "たりない",
  "つとめる",
  "ともない",
  "ともなう",
  "はんして",
  "はんする",
  "ひきかえ",
  "ひとしく",
  "ふみきる",
  "もとづき",
  "もまして",
  "わたって",
  "先立って",
  "匹敵する",
  "収束する",
  "基づいて",
  "堪えない",
  "当たって",
  "忍びない",
  "相まって",
  "相当する",
  "相違ない",
  "着手する",
  "至るまで",
  "落ち着く",
  "起因して",
  "起因する",
  "足りない",
  "踏み切る",
  "過ぎない",
  "違いない",
  "関わらず",
  "いたる",
  "いどむ",
  "おいて",
  "おわる",
  "かぎり",
  "きする",
  "くらべ",
  "したら",
  "しては",
  "しても",
  "そって",
  "ちかい",
  "ついて",
  "つれて",
  "とって",
  "はんし",
  "みえる",
  "むけて",
  "よって",
  "よると",
  "伴って",
  "加えて",
  "努める",
  "即して",
  "反して",
  "反する",
  "向けて",
  "基づき",
  "対して",
  "帰する",
  "応じて",
  "沿って",
  "準ずる",
  "等しく",
  "終わる",
  "至って",
  "見える",
  "鑑みて",
  "関して",
  "限って",
  "限らず",
  "際して",
  // 〜ことにする / 〜ことになる (こと に した / こと に なって いる)
  "なっている",
  "なりました",
  "ならない",
  "なります",
  "なった",
  "なって",
  "なる",
  "しました",
  "しません",
  "します",
  "しない",
  "した",
  "して",
  "する",
  "しろ",
  "せよ",
  "たる",
  "つけ",
  "伴う",
  "反し",
  "挑む",
  "比べ",
  "至る",
  "足る",
  "近い",
  "鑑み",
  "限り",
];


/** True when `next` is the complement of a 〜を… grammar pattern (きっかけに, etc.). */
export function isWoBoundPatternComplement(next: string): boolean {
  const core = next
    .replace(/^[〜～]+/u, "")
    .replace(/[、。！？．，!?,]+$/u, "")
    .trim();
  if (!core) return false;
  return WO_BOUND_PATTERN_STEMS.some((stem) => core.startsWith(stem));
}

/**
 * True when `next` looks like a verb/predicate continuation
 * (知らせを聞いて, お金があれば — no long pause after を/が).
 */
export function looksLikePredicateContinuation(next: string): boolean {
  const core = next
    .replace(/^[〜～]+/u, "")
    .replace(/[、。！？．，!?,]+$/u, "")
    .trim();
  if (!core) return false;
  // Finite / て-form / polite / negative / conditional (あれば) / い-adj.
  // A trailing small っ is also a predicate continuation when display
  // segmentation cuts 上がった into 上がっ|た.
  return /(?:[てでただばっッ]|たら|たり|ます|ました|ません|ない|ぬ|[うくぐすつぬむぶる]|よう|たい|れる|られる|せる|させる|い)$/u.test(
    core
  );
}

/**
 * い-adjective predicative / adverbial after subject が (日が長い / 日が長く).
 * These should keep a natural subject pause — unlike verbs (雨が降らない).
 */
function isGaSubjectAdjectiveContinuation(next: string): boolean {
  const core = next
    .replace(/^[〜～]+/u, "")
    .replace(/[、。！？．，!?,]+$/u, "")
    .trim();
  if (!core) return false;
  // Adverbial 〜く (長く)
  if (/く$/u.test(core)) return true;
  // Predicative 〜い, but not 〜ない / 〜たい / 〜らしい auxiliaries
  if (
    /い$/u.test(core) &&
    !/(?:ない|にくい|やすい|たい|らしい)$/u.test(core)
  ) {
    return true;
  }
  return false;
}

/** @deprecated use looksLikePredicateContinuation */
export function looksLikeVerbAfterWo(next: string): boolean {
  return looksLikePredicateContinuation(next);
}

/** を should stay tight with the next word (pattern complement or governing verb). */
export function shouldKeepWoTight(next: string): boolean {
  return isWoBoundPatternComplement(next) || looksLikePredicateContinuation(next);
}

/**
 * が stays tight with verbs/conditionals (お金があれば, 雨が降らない),
 * but pauses before い-adjective forms (日が長くなる).
 */
export function shouldKeepGaTight(next: string): boolean {
  if (isGaSubjectAdjectiveContinuation(next)) return false;
  return looksLikePredicateContinuation(next);
}

/** True when `next` is the complement of a 〜に… grammar pattern (限り, etc.). */
export function isNiBoundPatternComplement(next: string): boolean {
  const core = next
    .replace(/^[〜～]+/u, "")
    .replace(/[、。！？．，!?,]+$/u, "")
    .trim();
  if (!core) return false;
  return NI_BOUND_PATTERN_STEMS.some((stem) => core.startsWith(stem));
}

/** に should stay tight with bound pattern complements (本日に限り, ことにした). */
export function shouldKeepNiTight(next: string): boolean {
  return isNiBoundPatternComplement(next);
}

/**
 * Append a phrase comma after spoken phrase particles so Nanami pauses before
 * the next word (筆跡は→彼, 日本語を→本格的に, 本格的に→勉強).
 * Skips を/が when bound to a pattern complement or governing predicate.
 * Also used by karaoke timing so dwell matches the audio string.
 */
export function appendPhraseParticleSpeakPause(
  token: string,
  nextToken?: string
): string {
  const punct = token.match(/[、。！？．，!?,]+$/u)?.[0] ?? "";
  const core = punct ? token.slice(0, -punct.length) : token;
  if (
    core !== "わ" &&
    core !== "は" &&
    core !== "が" &&
    core !== "を" &&
    core !== "に"
  ) {
    return token;
  }
  if (/[、,]/.test(punct)) return token;
  // 留学をきっかけに / 知らせを聞いて — keep を tight
  if (core === "を" && nextToken && shouldKeepWoTight(nextToken)) {
    return token;
  }
  // お金があれば — keep が tight with the predicate
  if (core === "が" && nextToken && shouldKeepGaTight(nextToken)) {
    return token;
  }
  // 本日に限り / 〜に対して — keep に tight with the pattern
  if (core === "に" && nextToken && shouldKeepNiTight(nextToken)) {
    return token;
  }
  return `${core}、${punct}`;
}

/**
 * Build the string sent to speech synthesis.
 * Uses the lesson reading so ambiguous kanji (間→ま, not あいだ) pronounce correctly.
 * Karaoke highlighting still uses the surface text indices.
 */
export function buildJapaneseSpeakText(
  surface: string,
  spacedReading?: string | null
): string {
  const reading = spacedReading?.trim();
  if (!reading) return appendWaveDashSpeakPause(surface);

  // Speak from spaced reading tokens so particles like は can be remapped to わ.
  // Keep spaces between tokens so TTS does not glue the particle into the next
  // word (きじわらいげつ → sounds like "haraigetsu" / "warai…").
  // After は/が/を/に, insert 、 so the voice pauses before the next phrase
  // (except を/に bound patterns and を/が + governing predicates).
  const tokens = reading
    .split(/\s+/)
    .filter(Boolean)
    .map(speakReadingToken)
    .map(appendWaveDashSpeakPause);
  const spoken = tokens
    .map((tok, i) => appendPhraseParticleSpeakPause(tok, tokens[i + 1]))
    .join(" ")
    .trim();

  return spoken || appendWaveDashSpeakPause(surface);
}

/**
 * TTS form of one spaced-reading token (particle rewrite + ー expand).
 * Used for karaoke duration so timing matches what Nanami actually speaks.
 */
export function buildJapaneseSpeakToken(token: string): string {
  return appendWaveDashSpeakPause(speakReadingToken(token));
}
