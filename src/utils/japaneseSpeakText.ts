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
 * Build the string sent to speech synthesis.
 * Uses the lesson reading so ambiguous kanji (間→ま, not あいだ) pronounce correctly.
 * Karaoke highlighting still uses the surface text indices.
 */
export function buildJapaneseSpeakText(
  surface: string,
  spacedReading?: string | null
): string {
  const reading = spacedReading?.trim();
  if (!reading) return surface;

  // Speak from spaced reading tokens so particles like は can be remapped to わ.
  // Keep spaces between tokens so TTS does not glue the particle into the next
  // word (きじわらいげつ → sounds like "haraigetsu" / "warai…").
  const spoken = reading
    .split(/\s+/)
    .filter(Boolean)
    .map(speakReadingToken)
    .join(" ")
    .trim();

  return spoken || surface;
}

/**
 * TTS form of one spaced-reading token (particle rewrite + ー expand).
 * Used for karaoke duration so timing matches what Nanami actually speaks.
 */
export function buildJapaneseSpeakToken(token: string): string {
  return speakReadingToken(token);
}
