import { useCallback, useEffect, useRef, useState } from "react";
import type { PhoneScenario } from "../../../types/phoneCall";
import type { SpeechHighlight } from "../../../services/speechService";
import {
  speechService,
  SPEECH_RATE_NORMAL,
} from "../../../services/speechService";
import { buildJapaneseHighlightUnits } from "../../../utils/speechHighlightUnits";
import { PhoneRuby } from "./PhoneRuby";

export type IntroPhase = "title" | "titleEn" | "situation" | null;

interface PhoneStudyProps {
  scenario: PhoneScenario;
  onSpeak: (text: string) => void;
  onIntroState?: (phase: IntroPhase, highlight: SpeechHighlight | null) => void;
}

/* ---- inline karaoke renderers ---- */

export function KaraokeJapanese({
  text,
  highlight,
}: {
  text: string;
  highlight: SpeechHighlight | null;
}) {
  const units = buildJapaneseHighlightUnits(text);
  return (
    <>
      {units.map((unit, ui) => {
        const slice = text.slice(unit.start, unit.end);
        let state = "";
        if (highlight) {
          if (highlight.start < unit.end && highlight.end > unit.start) {
            state = "speech-active";
          } else if (unit.end <= highlight.start) {
            state = "speech-spoken";
          }
        }
        return (
          <span
            className={`speech-char ${state}`.trim()}
            key={`${unit.start}-${ui}`}
          >
            {slice}
          </span>
        );
      })}
    </>
  );
}

export function KaraokeEnglish({
  text,
  highlight,
}: {
  text: string;
  highlight: SpeechHighlight | null;
}) {
  const parts: { text: string; start: number }[] = [];
  const re = /(\s+|\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    parts.push({ text: match[0], start: match.index });
  }
  return (
    <>
      {parts.map((part, i) => {
        const start = part.start;
        const end = start + part.text.length;
        const isSpace = /^\s+$/.test(part.text);
        let state = "";
        if (highlight && !isSpace) {
          if (highlight.start < end && highlight.end > start) {
            state = "speech-active";
          } else if (end <= highlight.start) {
            state = "speech-spoken";
          }
        }
        return (
          <span key={i} className={`speech-char ${state}`.trim()}>
            {part.text}
          </span>
        );
      })}
    </>
  );
}


const JP_RE = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\uFF00-\uFFEF\u3005\u3006\u30F6、。！？「」『』（）〜]+/g;

interface MixedSegment {
  text: string;
  lang: "ja" | "en";
  offset: number;
}

function splitMixed(text: string): MixedSegment[] {
  const segments: MixedSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  JP_RE.lastIndex = 0;
  while ((m = JP_RE.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ text: text.slice(last, m.index), lang: "en", offset: last });
    }
    segments.push({ text: m[0], lang: "ja", offset: m.index });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), lang: "en", offset: last });
  }
  return segments;
}

export function PhoneStudy({ scenario, onIntroState }: PhoneStudyProps) {
  const [showFurigana, setShowFurigana] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [activeKind, setActiveKind] = useState<"jp" | "en" | null>(null);
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(null);
  const [introHighlight, setIntroHighlight] = useState<SpeechHighlight | null>(null);

  useEffect(() => {
    onIntroState?.(introPhase, introHighlight);
  }, [introPhase, introHighlight, onIntroState]);

  // Solo speak state: tracks which element is being spoken individually
  const [soloId, setSoloId] = useState<string | null>(null);
  const [, setSoloLang] = useState<"ja" | "en" | null>(null);
  const [soloHighlight, setSoloHighlight] = useState<SpeechHighlight | null>(null);

  const cancelRef = useRef(false);

  const clearSolo = useCallback(() => {
    setSoloId(null);
    setSoloLang(null);
    setSoloHighlight(null);
  }, []);

  /**
   * Speak JP with karaoke. When `reading` (full kana) is available, feed it
   * as a single-token "reading" so `buildJapaneseSpeakText` uses it for audio
   * and `forceFallback` kicks in for surface-text-weighted karaoke timing.
   */
  const speakJpSolo = useCallback((text: string, id: string, _reading?: string) => {
    setSoloId(id);
    setSoloLang("ja");
    setSoloHighlight(null);
    speechService.speakJapanese(
      text,
      {
        onBoundary: (h) => setSoloHighlight(h),
        onEnd: () => { setSoloId(null); setSoloLang(null); setSoloHighlight(null); },
        onError: () => { setSoloId(null); setSoloLang(null); setSoloHighlight(null); },
      },
      SPEECH_RATE_NORMAL
    );
  }, []);

  const speakEnSolo = useCallback((text: string, id: string) => {
    setSoloId(id);
    setSoloLang("en");
    setSoloHighlight(null);
    speechService.speakEnglish(
      text,
      {
        onBoundary: (h) => setSoloHighlight(h),
        onEnd: () => { setSoloId(null); setSoloLang(null); setSoloHighlight(null); },
        onError: () => { setSoloId(null); setSoloLang(null); setSoloHighlight(null); },
      },
      SPEECH_RATE_NORMAL
    );
  }, []);

  /** Speak mixed JP/EN with karaoke — segments get highlighted per-language. */
  const speakMixedSolo = useCallback((text: string, id: string) => {
    const segments = splitMixed(text).filter((s) => s.text.trim());
    if (segments.length === 0) return;

    setSoloId(id);
    setSoloHighlight(null);

    let i = 0;
    const next = () => {
      if (i >= segments.length) {
        clearSolo();
        return;
      }
      const seg = segments[i++];
      setSoloLang(seg.lang);
      setSoloHighlight(null);
      const cb = {
        onBoundary: (h: SpeechHighlight) => setSoloHighlight(h),
        onEnd: next,
        onError: next,
      };
      if (seg.lang === "ja") {
        speechService.speakJapanese(seg.text, cb, SPEECH_RATE_NORMAL);
      } else {
        speechService.speakEnglish(seg.text, cb, SPEECH_RATE_NORMAL);
      }
    };
    next();
  }, [clearSolo]);

  const speakLine = useCallback(
    (japanese: string, reading: string, lineIndex: number) => {
      speakJpSolo(japanese, `line-${lineIndex}`, reading);
    },
    [speakJpSolo]
  );

  const playAll = useCallback(() => {
    if (playing) {
      cancelRef.current = true;
      speechService.stop();
      setPlaying(false);
      setActiveLine(null);
      setActiveKind(null);
      setHighlight(null);
      setIntroPhase(null);
      setIntroHighlight(null);
      return;
    }

    cancelRef.current = false;
    setPlaying(true);
    setIntroPhase(null);
    setIntroHighlight(null);

    const lines = scenario.dialogue;
    let i = 0;

    const doSpeakJp = (text: string, _reading: string): Promise<void> =>
      new Promise((resolve) => {
        setActiveKind("jp");
        setHighlight(null);
        speechService.speakJapanese(
          text,
          {
            onBoundary: (h) => setHighlight(h),
            onEnd: () => resolve(),
            onError: () => resolve(),
          },
          SPEECH_RATE_NORMAL
        );
      });

    const doSpeakEn = (text: string): Promise<void> =>
      new Promise((resolve) => {
        setActiveKind("en");
        setHighlight(null);
        speechService.speakEnglish(
          text,
          {
            onBoundary: (h) => setHighlight(h),
            onEnd: () => resolve(),
            onError: () => resolve(),
          },
          SPEECH_RATE_NORMAL
        );
      });

    const pause = (ms: number): Promise<void> =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const introJp = (text: string, phase: "title"): Promise<void> =>
      new Promise((resolve) => {
        setIntroPhase(phase);
        setIntroHighlight(null);
        speechService.speakJapanese(
          text,
          {
            onBoundary: (h) => setIntroHighlight(h),
            onEnd: () => resolve(),
            onError: () => resolve(),
          },
          SPEECH_RATE_NORMAL
        );
      });

    const introEn = (text: string, phase: "titleEn" | "situation"): Promise<void> =>
      new Promise((resolve) => {
        setIntroPhase(phase);
        setIntroHighlight(null);
        speechService.speakEnglish(
          text,
          {
            onBoundary: (h) => setIntroHighlight(h),
            onEnd: () => resolve(),
            onError: () => resolve(),
          },
          SPEECH_RATE_NORMAL
        );
      });

    const next = async () => {
      if (cancelRef.current) return;
      await introJp(scenario.title, "title");
      if (cancelRef.current) return;
      await pause(300);
      if (cancelRef.current) return;
      await introEn(scenario.titleEn, "titleEn");
      if (cancelRef.current) return;
      await pause(400);
      if (cancelRef.current) return;
      await introEn(scenario.situation, "situation");
      if (cancelRef.current) return;
      setIntroPhase(null);
      setIntroHighlight(null);
      await pause(600);

      // Dialogue
      while (i < lines.length && !cancelRef.current) {
        setActiveLine(i);
        await doSpeakJp(lines[i].japanese, lines[i].reading);
        if (cancelRef.current) break;
        setHighlight(null);
        await pause(400);
        if (cancelRef.current) break;
        await doSpeakEn(lines[i].english);
        if (cancelRef.current) break;
        setHighlight(null);
        await pause(600);
        i++;
      }
      setPlaying(false);
      setActiveLine(null);
      setActiveKind(null);
      setHighlight(null);
      setIntroPhase(null);
      setIntroHighlight(null);
    };

    next();
  }, [playing, scenario.dialogue]);

  const soloFor = (id: string) =>
    soloId === id ? soloHighlight : null;

  return (
    <div>
      <div className="pt-toggles">
        <button
          type="button"
          className="pt-btn"
          aria-pressed={showFurigana}
          onClick={() => setShowFurigana(!showFurigana)}
        >
          ふりがな
        </button>
        <button
          type="button"
          className="pt-btn"
          aria-pressed={showEnglish}
          onClick={() => setShowEnglish(!showEnglish)}
        >
          English
        </button>
        <button
          type="button"
          className={`pt-btn ${playing ? "pt-btn--primary" : "pt-btn--play-all"}`}
          onClick={playAll}
        >
          {playing ? "⏹ Stop" : "▶ Play All"}
        </button>
      </div>

      <ol className="pt-dialogue">
        {scenario.dialogue.map((line, i) => {
          const lineId = `line-${i}`;
          const isPlayAllActive = activeLine === i && playing;
          const isSoloActive = soloId === lineId && !playing;

          const jpHighlight =
            isPlayAllActive && activeKind === "jp"
              ? highlight
              : isSoloActive
                ? soloHighlight
                : null;

          const enHighlight =
            isPlayAllActive && activeKind === "en" ? highlight : null;

          return (
            <li
              key={i}
              className={`pt-line${isPlayAllActive || isSoloActive ? " pt-line--active" : ""}`}
              data-side={
                line.speaker === scenario.learner ? "learner" : "other"
              }
            >
              <span className="pt-speaker" lang="ja">
                {line.speaker === "A" ? scenario.roleA : scenario.roleB}
              </span>
              <p className="pt-line-jp" lang="ja">
                <span>
                  {jpHighlight ? (
                    <KaraokeJapanese
                      text={line.japanese}
                      highlight={jpHighlight}
                    />
                  ) : showFurigana ? (
                    <PhoneRuby
                      japanese={line.japanese}
                      reading={line.reading}
                    />
                  ) : (
                    line.japanese
                  )}
                </span>
                <button
                  type="button"
                  className="pt-speak"
                  aria-label="Speak line"
                  onClick={() => speakLine(line.japanese, line.reading, i)}
                >
                  🔊
                </button>
              </p>
              {showEnglish && (
                <p className="pt-line-en">
                  {enHighlight ? (
                    <KaraokeEnglish
                      text={line.english}
                      highlight={enHighlight}
                    />
                  ) : (
                    line.english
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {scenario.keyPhrases.length > 0 && (
        <div className="pt-block">
          <h3 className="pt-block-title">Key Phrases</h3>
          <ul className="pt-phrases">
            {scenario.keyPhrases.map((phrase, i) => {
              const jpId = `phrase-jp-${i}`;
              const enId = `phrase-en-${i}`;
              const noteId = `phrase-note-${i}`;
              return (
                <li key={i}>
                  <p className="pt-phrase-jp" lang="ja">
                    <span>
                      {soloFor(jpId) ? (
                        <KaraokeJapanese
                          text={phrase.japanese}
                          highlight={soloFor(jpId)}
                        />
                      ) : showFurigana ? (
                        <PhoneRuby
                          japanese={phrase.japanese}
                          reading={phrase.reading}
                        />
                      ) : (
                        phrase.japanese
                      )}
                    </span>
                    <button
                      type="button"
                      className="pt-speak"
                      aria-label="Speak phrase"
                      onClick={() => speakJpSolo(phrase.japanese, jpId, phrase.reading)}
                    >
                      🔊
                    </button>
                  </p>
                  <p className="pt-phrase-en">
                    {soloFor(enId) ? (
                      <KaraokeEnglish
                        text={phrase.english}
                        highlight={soloFor(enId)}
                      />
                    ) : (
                      phrase.english
                    )}
                    <button
                      type="button"
                      className="pt-speak pt-speak--inline"
                      aria-label="Speak English"
                      onClick={() => speakEnSolo(phrase.english, enId)}
                    >
                      🔊
                    </button>
                  </p>
                  <p className={`pt-phrase-note${soloId === noteId ? " pt-speaking" : ""}`} lang="ja">
                    {phrase.note}
                    <button
                      type="button"
                      className="pt-speak pt-speak--inline"
                      aria-label="Speak note"
                      onClick={() => speakMixedSolo(phrase.note, noteId)}
                    >
                      🔊
                    </button>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {scenario.vocabulary.length > 0 && (
        <div className="pt-block">
          <h3 className="pt-block-title">Vocabulary</h3>
          <ul className="pt-vocab">
            {scenario.vocabulary.map((word, i) => {
              const jpId = `vocab-jp-${i}`;
              const enId = `vocab-en-${i}`;
              return (
                <li key={i}>
                  <span className="pt-vocab-jp" lang="ja">
                    {soloFor(jpId) ? (
                      <KaraokeJapanese
                        text={word.japanese}
                        highlight={soloFor(jpId)}
                      />
                    ) : showFurigana ? (
                      <PhoneRuby
                        japanese={word.japanese}
                        reading={word.reading}
                      />
                    ) : (
                      word.japanese
                    )}
                    <button
                      type="button"
                      className="pt-speak pt-speak--inline"
                      aria-label="Speak word"
                      onClick={() => speakJpSolo(word.japanese, jpId, word.reading)}
                    >
                      🔊
                    </button>
                  </span>
                  <span className="pt-vocab-en">
                    {soloFor(enId) ? (
                      <KaraokeEnglish
                        text={word.english}
                        highlight={soloFor(enId)}
                      />
                    ) : (
                      word.english
                    )}
                    <button
                      type="button"
                      className="pt-speak pt-speak--inline"
                      aria-label="Speak English"
                      onClick={() => speakEnSolo(word.english, enId)}
                    >
                      🔊
                    </button>
                  </span>
                  <span className="pt-vocab-pos">{word.partOfSpeech}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {scenario.politeness && (
        <div className="pt-block pt-politeness">
          <h3 className="pt-block-title">
            Politeness Notes
            <button
              type="button"
              className="pt-speak pt-speak--inline"
              aria-label="Speak politeness notes"
              onClick={() => speakMixedSolo(scenario.politeness, "politeness")}
            >
              🔊
            </button>
          </h3>
          <p className={soloId === "politeness" ? "pt-speaking" : ""} lang="ja">
            {scenario.politeness}
          </p>
        </div>
      )}
    </div>
  );
}
