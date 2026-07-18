/**
 * Content morphemes where は is /ha/ (not the topic particle).
 * Protected before rewriting remaining は → わ for TTS.
 */
const HA_CONTENT =
  /は(いき|いり|おっ|かり|げ|じま|じまり|じめ|じめて|ず|たら|だざ|だ|ち|っ|つげん|つ|ながら|なし|なす|なせ|や[めおく]|ら[いうっ]|るめ|る|れた|れ|ん)/g;

/** Content morphemes where へ is /he/ (not the directional particle). */
const HE_CONTENT = /へ(や|ら|ん)/g;

/**
 * Particle kana that TTS misreads when spoken as a kana-only string.
 * Display / karaoke keep the surface characters; only the audio string changes.
 */
function speakParticleKana(kana: string): string {
  if (!kana) return kana;

  const saved: string[] = [];
  const protect = (re: RegExp, input: string): string =>
    input.replace(re, (m) => {
      const i = saved.length;
      saved.push(m);
      return `\uE000${i}\uE001`;
    });

  let out = protect(HA_CONTENT, kana);
  out = protect(HE_CONTENT, out);
  out = out.replace(/は/g, "わ");
  out = out.replace(/へ/g, "え");
  out = out.replace(/\uE000(\d+)\uE001/g, (_, i) => saved[Number(i)]!);
  return out;
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
  const spoken = reading
    .split(/\s+/)
    .filter(Boolean)
    .map(speakReadingToken)
    .join("")
    .trim();

  return spoken || surface;
}
