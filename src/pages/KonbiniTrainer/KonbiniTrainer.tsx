import { useCallback, useEffect, useMemo, useState } from 'react';
import './konbini-trainer.css';
import { DECKS, SCRIPTS } from './data';
import { Furigana } from './furigana';
import { useJapaneseVoice } from './useJapaneseVoice';
import type { DeckId, Progress, Register, Variant } from './types';

const STORAGE_KEY = 'jlpt-trainer:konbini:v1';

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

/* ---- progress persistence ---- */

function loadProgress(): Progress {
  if (typeof window === 'undefined') return { known: [], practiced: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { known: [], practiced: [] };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      known: Array.isArray(parsed.known) ? parsed.known : [],
      practiced: Array.isArray(parsed.practiced) ? parsed.practiced : [],
    };
  } catch {
    return { known: [], practiced: [] };
  }
}

function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Private mode or a full quota: progress just won't persist.
    }
  }, [progress]);

  const toggle = useCallback((field: keyof Progress, id: string) => {
    setProgress((prev) => {
      const list = prev[field];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [field]: next };
    });
  }, []);

  return { progress, toggle };
}

/* ---- page ---- */

export default function KonbiniTrainer() {
  const [tab, setTab] = useState<'cards' | 'scripts'>('cards');
  const [deckId, setDeckId] = useState<DeckId>('core');
  const [register, setRegister] = useState<Register>('formal');
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [openScript, setOpenScript] = useState<string | null>(null);

  const { progress, toggle } = useProgress();
  const { speak, voiceName, supported } = useJapaneseVoice();

  const deck = useMemo(() => DECKS.find((d) => d.id === deckId) ?? DECKS[0], [deckId]);
  const card = deck.cards[Math.min(index, deck.cards.length - 1)];
  const variant: Variant = card[register];
  const isKnown = progress.known.includes(card.id);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + deck.cards.length) % deck.cards.length);
      setReveal(0);
    },
    [deck.cards.length],
  );

  const selectDeck = (id: DeckId) => {
    setDeckId(id);
    setIndex(0);
    setReveal(0);
  };

  const script = SCRIPTS.find((s) => s.id === openScript) ?? null;

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
          onClick={() => setTab('cards')}
        >
          <Layers /> Flashcards
        </button>
        <button
          type="button"
          className={`fm-tab-btn ${tab === 'scripts' ? 'active' : ''}`}
          onClick={() => setTab('scripts')}
        >
          <MessageSquare /> Scripts
        </button>
      </nav>

      <div className="fm-registerrow">
        {(['formal', 'friendly'] as const).map((r) => (
          <button
            type="button"
            key={r}
            className={`fm-register ${register === r ? 'active' : ''}`}
            onClick={() => setRegister(r)}
          >
            {r}
          </button>
        ))}
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
            <button type="button" className="fm-speak" onClick={() => speak(variant.jp)}>
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

            <span className="fm-jp">
              <Furigana text={variant.jp} />
            </span>
            {reveal >= 1 && <span className="fm-ro">{variant.ro}</span>}
            {reveal >= 2 && <span className="fm-en">{variant.en}</span>}
            {reveal < 2 && <span className="fm-hint">tap for {reveal === 0 ? 'romaji' : 'english'}</span>}
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
              onClick={() => setOpenScript(s.id)}
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
          <button type="button" className="fm-backbtn" onClick={() => setOpenScript(null)}>
            <ChevronLeft size={13} /> all scenarios
          </button>

          <div className="fm-thread">
            {script.lines.map((line, i) => {
              const text = line[register];
              return (
                <div
                  key={i}
                  className={`fm-bubblewrap ${line.who === 'staff' ? 'right' : 'left'}`}
                >
                  <button type="button" className="fm-bubble" onClick={() => speak(text.jp)}>
                    <span className="fm-who">{line.who === 'staff' ? 'you' : 'customer'}</span>
                    <span className="fm-jp">
                      <Furigana text={text.jp} />
                    </span>
                    <span className="fm-ro">{text.ro}</span>
                    <span className="fm-en">{text.en}</span>
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
