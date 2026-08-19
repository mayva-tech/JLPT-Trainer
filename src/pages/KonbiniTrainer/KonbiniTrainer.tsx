import { useMemo, useRef, useState } from 'react';
import './konbini-trainer.css';
import { DECKS, SCRIPTS } from './data';
import { Furigana, stripFurigana } from '../../lib/japanese/furigana';
import { useJapaneseVoice } from '../../lib/japanese/useJapaneseVoice';
import { useProgress } from '../../lib/japanese/useProgress';
import type { Register, Script, Variant } from '../../lib/japanese/types';
import { speechService, SPEECH_RATE_NORMAL } from '../../services/speechService';

const STORAGE_KEY = 'jlpt-trainer:konbini:v1';

type PlayPart = 'jp' | 'en';

/* ---- icons (inline: the repo has no icon dependency) ---- */

interface IconProps {
  size?: number;
}

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

const Layers = ({ size = 15 }: IconProps) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </svg>
);

const MessageSquare = ({ size = 15 }: IconProps) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </svg>
);

const ChevronLeft = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const Check = ({ size = 15 }: IconProps) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Volume = ({ size = 13 }: IconProps) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
  </svg>
);

/* ---- page ---- */

export default function KonbiniTrainer() {
  const [tab, setTab] = useState<'cards' | 'scripts'>('cards');
  const [deckId, setDeckId] = useState('core');
  const [register, setRegister] = useState<Register>('formal');
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [openScript, setOpenScript] = useState<string | null>(null);
  const [playingCard, setPlayingCard] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [playPart, setPlayPart] = useState<PlayPart | null>(null);
  const [playRegister, setPlayRegister] = useState<Register | null>(null);
  const [playLineIndex, setPlayLineIndex] = useState<number | null>(null);
  const playSessionRef = useRef(0);

  const { progress, toggle } = useProgress(STORAGE_KEY);
  const { speak, voiceName, supported } = useJapaneseVoice();

  const deck = useMemo(() => DECKS.find((d) => d.id === deckId) ?? DECKS[0], [deckId]);
  const card = deck.cards[Math.min(index, deck.cards.length - 1)];
  const shownRegister = playRegister ?? register;
  const variant: Variant = card[shownRegister];
  const isKnown = progress.known.includes(card.id);
  const script = SCRIPTS.find((s) => s.id === openScript) ?? null;
  const playDisabled = tab === 'scripts' && !script;

  function stopAuto() {
    playSessionRef.current += 1;
    setPlayingCard(false);
    setPlayingAll(false);
    setPlayPart(null);
    setPlayRegister(null);
    setPlayLineIndex(null);
  }

  function go(delta: number) {
    speechService.stop();
    stopAuto();
    setIndex((i) => (i + delta + deck.cards.length) % deck.cards.length);
    setReveal(0);
  }

  function selectDeck(id: string) {
    speechService.stop();
    stopAuto();
    setDeckId(id);
    setIndex(0);
    setReveal(0);
  }

  function playVariantSequence(
    source: Variant,
    session: number,
    onComplete: () => void,
  ) {
    const alive = () => session === playSessionRef.current;
    const finish = () => {
      if (!alive()) return;
      onComplete();
    };

    const speakJa = (onEnd: () => void) => {
      if (!alive()) return;
      const plain = stripFurigana(source.jp);
      if (!plain.trim()) {
        onEnd();
        return;
      }
      setPlayPart('jp');
      speechService.speakJapanese(
        plain,
        { onEnd, onError: finish },
        SPEECH_RATE_NORMAL,
      );
    };

    const speakEn = (onEnd: () => void) => {
      if (!alive()) return;
      if (!source.en.trim()) {
        onEnd();
        return;
      }
      setPlayPart('en');
      speechService.speakEnglish(
        source.en,
        { onEnd, onError: finish },
        SPEECH_RATE_NORMAL,
      );
    };

    speakJa(() => speakEn(() => speakJa(finish)));
  }

  function playBothRegisters(
    formal: Variant,
    friendly: Variant,
    session: number,
    onComplete: () => void,
  ) {
    const alive = () => session === playSessionRef.current;
    const sameLine = formal.jp === friendly.jp && formal.en === friendly.en;
    if (sameLine) {
      setPlayRegister(null);
      playVariantSequence(formal, session, onComplete);
      return;
    }
    setPlayRegister('formal');
    playVariantSequence(formal, session, () => {
      if (!alive()) return;
      setPlayRegister('friendly');
      playVariantSequence(friendly, session, onComplete);
    });
  }

  function playScriptSequence(
    target: Script,
    session: number,
    onComplete: () => void,
  ) {
    const alive = () => session === playSessionRef.current;

    const runLine = (lineIndex: number) => {
      if (!alive()) return;
      const line = target.lines[lineIndex];
      if (!line) {
        onComplete();
        return;
      }
      setPlayLineIndex(lineIndex);
      playBothRegisters(line.formal, line.friendly, session, () => {
        if (!alive()) return;
        runLine(lineIndex + 1);
      });
    };

    runLine(0);
  }

  function playCurrent() {
    if (playDisabled) return;
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingAll(false);
    setPlayingCard(true);
    setPlayLineIndex(null);

    const done = () => {
      if (session !== playSessionRef.current) return;
      setPlayingCard(false);
      setPlayPart(null);
      setPlayRegister(null);
      setPlayLineIndex(null);
    };

    if (tab === 'cards') {
      setReveal(2);
      playBothRegisters(card.formal, card.friendly, session, done);
      return;
    }

    if (!script) {
      done();
      return;
    }
    playScriptSequence(script, session, done);
  }

  function playAll() {
    if (playingAll) {
      speechService.stop();
      stopAuto();
      return;
    }

    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingCard(false);
    setPlayingAll(true);
    const alive = () => session === playSessionRef.current;

    if (tab === 'cards') {
      const cards = deck.cards;
      if (cards.length === 0) {
        stopAuto();
        return;
      }
      setIndex(0);
      setReveal(2);

      const run = (cardIndex: number) => {
        if (!alive()) return;
        const item = cards[cardIndex];
        if (!item) {
          stopAuto();
          return;
        }
        setIndex(cardIndex);
        setReveal(2);
        playBothRegisters(item.formal, item.friendly, session, () => {
          if (!alive()) return;
          const next = cardIndex + 1;
          if (next >= cards.length) {
            stopAuto();
            return;
          }
          run(next);
        });
      };

      run(0);
      return;
    }

    if (SCRIPTS.length === 0) {
      stopAuto();
      return;
    }

    const runScript = (scriptIndex: number) => {
      if (!alive()) return;
      const item = SCRIPTS[scriptIndex];
      if (!item) {
        stopAuto();
        return;
      }
      setOpenScript(item.id);
      playScriptSequence(item, session, () => {
        if (!alive()) return;
        const next = scriptIndex + 1;
        if (next >= SCRIPTS.length) {
          stopAuto();
          return;
        }
        runScript(next);
      });
    };

    runScript(0);
  }

  return (
    <div className="fm-root">
      <header className="fm-header">
        <p className="fm-title">コンビニ日本語トレーナー</p>
        <p className="fm-sub">Family Mart Japanese Trainer</p>
        <p className="fm-voice">
          {supported ? `voice: ${voiceName ?? 'no Japanese voice installed'}` : 'audio unavailable'}
        </p>
      </header>

      <nav className="fm-tabs">
        <button
          type="button"
          className={`fm-tab-btn ${tab === 'cards' ? 'active' : ''}`}
          onClick={() => {
            speechService.stop();
            stopAuto();
            setTab('cards');
          }}
        >
          <Layers /> Flashcards
        </button>
        <button
          type="button"
          className={`fm-tab-btn ${tab === 'scripts' ? 'active' : ''}`}
          onClick={() => {
            speechService.stop();
            stopAuto();
            setTab('scripts');
          }}
        >
          <MessageSquare /> Scripts
        </button>
      </nav>

      <div className="fm-registerrow">
        {(['formal', 'friendly'] as const).map((r) => (
          <button
            type="button"
            key={r}
            className={`fm-register fm-register--${r} ${shownRegister === r ? 'active' : ''}`}
            onClick={() => {
              speechService.stop();
              stopAuto();
              setRegister(r);
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="fm-playrow">
        <button
          type="button"
          className={`fm-playbtn ${playingCard ? 'active' : ''}`}
          disabled={playDisabled}
          title={
            tab === 'cards'
              ? 'Play this card: formal, then casual polite'
              : script
                ? 'Play this scenario: formal, then casual polite on each line'
                : 'Open a scenario to play it'
          }
          onClick={playCurrent}
        >
          ▶ Play
        </button>
        <button
          type="button"
          className={`fm-playbtn ${playingAll ? 'active' : ''}`}
          title={
            tab === 'cards'
              ? 'Play every card in this deck from the start'
              : 'Play every scenario from the start'
          }
          onClick={playAll}
        >
          {playingAll ? '■ Stop All' : '▶ Play All'}
        </button>
      </div>

      {tab === 'cards' && (
        <>
          <div className="fm-chiprow">
            {DECKS.map((d) => (
              <button
                type="button"
                key={d.id}
                className={`fm-chip ${deckId === d.id ? 'active' : ''}`}
                onClick={() => selectDeck(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="fm-cardtop">
            <p className="fm-counter">
              {index + 1} / {deck.cards.length} · {progress.known.length} known
            </p>
            <button
              type="button"
              className="fm-speak"
              onClick={() => {
                speechService.stop();
                stopAuto();
                speak(variant.jp);
              }}
            >
              <Volume /> listen
            </button>
          </div>

          <button
            type="button"
            className="fm-card"
            onClick={() => setReveal((r) => Math.min(r + 1, 2))}
            aria-label="Reveal the next part of this card"
          >
            <span className="fm-cardlabel">{card.label}</span>

            <span className={`fm-jp${playPart === 'jp' ? ' fm-speaking' : ''}`}>
              <Furigana text={variant.jp} />
            </span>
            {(reveal >= 1 || playingCard || playingAll) && (
              <span className="fm-ro">{variant.ro}</span>
            )}
            {(reveal >= 2 || playingCard || playingAll) && (
              <span className={`fm-en${playPart === 'en' ? ' fm-speaking' : ''}`}>
                {variant.en}
              </span>
            )}
            {reveal < 2 && !playingCard && !playingAll && (
              <span className="fm-hint">tap for {reveal === 0 ? 'romaji' : 'english'}</span>
            )}
          </button>

          <div className="fm-nav">
            <button type="button" className="fm-navbtn" onClick={() => go(-1)} aria-label="Previous card">
              <ChevronLeft />
            </button>
            <button
              type="button"
              className={`fm-knownbtn ${isKnown ? 'done' : ''}`}
              onClick={() => {
                toggle('known', card.id);
                if (!isKnown) go(1);
              }}
            >
              <Check /> {isKnown ? 'Known' : 'Mark as known'}
            </button>
            <button type="button" className="fm-navbtn" onClick={() => go(1)} aria-label="Next card">
              <ChevronRight />
            </button>
          </div>
        </>
      )}

      {tab === 'scripts' && !script && (
        <div className="fm-scriptlist">
          {SCRIPTS.map((s) => (
            <button
              type="button"
              key={s.id}
              className="fm-scriptitem"
              onClick={() => {
                speechService.stop();
                stopAuto();
                setOpenScript(s.id);
              }}
            >
              <span className={`fm-dot ${progress.practiced.includes(s.id) ? 'done' : ''}`} />
              <span className="fm-scriptname">
                <Furigana text={s.title} />
                <small>{s.titleEn}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'scripts' && script && (
        <>
          <div className="fm-scenehead">
            <button
              type="button"
              className="fm-backbtn"
              onClick={() => {
                speechService.stop();
                stopAuto();
                setOpenScript(null);
              }}
            >
              <ChevronLeft size={13} /> all scenarios
            </button>
            <h3 className="fm-scenetitle">
              <Furigana text={script.title} />
            </h3>
            <p className="fm-scenesub">{script.titleEn}</p>
          </div>

          <div className="fm-thread">
            {script.lines.map((line, i) => {
              const text = line[shownRegister];
              const lineActive = playLineIndex === i && (playingCard || playingAll);
              return (
                <div
                  key={i}
                  className={`fm-bubblewrap ${line.who === 'self' ? 'right' : 'left'}`}
                >
                  <button
                    type="button"
                    className={`fm-bubble${lineActive ? ' fm-line-active' : ''}`}
                    onClick={() => {
                      speechService.stop();
                      stopAuto();
                      speak(text.jp);
                    }}
                  >
                    <span className="fm-who-row">
                      <span className="fm-who">
                        {line.who === 'self' ? 'you' : 'customer'}
                      </span>
                      <span className={`fm-regtag fm-regtag--${shownRegister}`}>
                        {shownRegister}
                      </span>
                    </span>
                    <span className={`fm-jp${lineActive && playPart === 'jp' ? ' fm-speaking' : ''}`}>
                      <Furigana text={text.jp} />
                    </span>
                    <span className="fm-ro">{text.ro}</span>
                    <span className={`fm-en${lineActive && playPart === 'en' ? ' fm-speaking' : ''}`}>
                      {text.en}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={`fm-practicebtn ${progress.practiced.includes(script.id) ? 'done' : ''}`}
            onClick={() => toggle('practiced', script.id)}
          >
            <Check /> {progress.practiced.includes(script.id) ? 'Practiced' : 'Mark as practiced'}
          </button>
        </>
      )}
    </div>
  );
}
