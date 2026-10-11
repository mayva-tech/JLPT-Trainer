import { useMemo, useRef, useState } from "react";
import {
  buildGrammarGroups,
  buildRelations,
  buildWordGroups,
  GLOSSARY_LEVELS,
} from "../data/glossaryIndex";
import { WORD_RELATION_TYPE_LABELS } from "../data/wordRelations";
import type { JlptLevel } from "../types/level";
import { glossaryMatcher } from "../utils/glossarySearch";
import { FuriganaWrapText } from "./FuriganaWrapText";

type Tab = "words" | "grammar" | "related";

export type GlossaryNavigateTarget =
  | { kind: "word"; lessonId: string; vocabularyId: number }
  | { kind: "grammar"; lessonId: string; grammarId: number };

type Props = {
  onNavigate: (target: GlossaryNavigateTarget) => void;
};

const WORD_GROUPS = buildWordGroups();
const GRAMMAR_GROUPS = buildGrammarGroups();
const RELATIONS = buildRelations();

/**
 * In-app content glossary: every word and grammar pattern in the app, N5 to
 * N1, plus the synonym / antonym pairs. One page per JLPT level; a search
 * (English, Japanese or romaji) looks through all levels at once.
 * Rows are tappable and open the matching Player slide.
 */
export function GlossaryView({ onNavigate }: Props) {
  const [level, setLevel] = useState<JlptLevel>("N2");
  const [tab, setTab] = useState<Tab>("words");
  const [query, setQuery] = useState("");
  const refs = {
    words: useRef<HTMLElement | null>(null),
    grammar: useRef<HTMLElement | null>(null),
    related: useRef<HTMLElement | null>(null),
  };

  const match = useMemo(() => glossaryMatcher(query), [query]);
  const searching = match !== null;
  const inScope = (l: JlptLevel) => searching || l === level;

  const wordSections = useMemo(
    () =>
      WORD_GROUPS.filter((g) => inScope(g.level))
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (v) => !match || match({ surface: v.word, reading: v.reading, meaning: v.meaning })
          ),
        }))
        .filter((g) => g.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [match, level, searching]
  );

  const grammarSections = useMemo(
    () =>
      GRAMMAR_GROUPS.filter((g) => inScope(g.level))
        .map((g) => ({
          ...g,
          rows: g.rows.filter(
            ({ item }) =>
              !match ||
              match({
                surface: item.pattern,
                reading: item.patternReading,
                meaning: item.meaning,
                extra: item.aliases,
              })
          ),
        }))
        .filter((g) => g.rows.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [match, level, searching]
  );

  const relationRows = useMemo(
    () =>
      RELATIONS.filter(
        (r) =>
          inScope(r.jlptLevel) &&
          (!match ||
            match({ surface: r.word1.japanese, reading: r.word1.reading, meaning: r.word1.meaning }) ||
            match({ surface: r.word2.japanese, reading: r.word2.reading, meaning: r.word2.meaning }))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [match, level, searching]
  );

  const count = {
    words: wordSections.reduce((n, g) => n + g.items.length, 0),
    grammar: grammarSections.reduce((n, g) => n + g.rows.length, 0),
    related: relationRows.length,
  };

  const levelTotals = useMemo(() => {
    const totals = new Map<JlptLevel, { words: number; grammar: number; related: number }>();
    for (const l of GLOSSARY_LEVELS) totals.set(l, { words: 0, grammar: 0, related: 0 });
    for (const g of WORD_GROUPS) totals.get(g.level)!.words += g.items.length;
    for (const g of GRAMMAR_GROUPS) totals.get(g.level)!.grammar += g.rows.length;
    for (const r of RELATIONS) totals.get(r.jlptLevel)!.related += 1;
    return totals;
  }, []);
  const here = levelTotals.get(level)!;

  const tabs: { id: Tab; label: string }[] = [
    { id: "words", label: "Words" },
    { id: "grammar", label: "Grammar" },
    { id: "related", label: "Related 類義・反対" },
  ];
  const show = (id: Tab) => searching || tab === id;

  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade glossary-panel">
        <div className="category-chip">Reference</div>
        <h1 className="toc-title">Content Glossary</h1>
        <p className="toc-subtitle">
          {level} · {here.words} words · {here.grammar} grammar patterns · {here.related} synonym / antonym pairs ·
          tap a row to open its slide · search looks through every level
        </p>

        <div className="toc-page-nav" role="tablist" aria-label="Glossary levels">
          {GLOSSARY_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={level === l}
              className={level === l ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="glossary-controls">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "toc-item toc-item--active" : "toc-item"}
              onClick={() => {
                setTab(id);
                refs[id].current?.scrollIntoView?.({ block: "start" });
              }}
            >
              {label} ({searching ? count[id] : here[id]})
            </button>
          ))}
          <input
            type="search"
            className="glossary-search"
            placeholder="Search English, 日本語 or romaji…"
            aria-label="Search words, grammar and related words"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="glossary-scroll">
          {searching && count.words + count.grammar + count.related === 0 ? (
            <p className="glossary-empty">Nothing matches “{query.trim()}”. Try English, kana or romaji.</p>
          ) : null}

          {show("words") && (!searching || count.words > 0) ? (
            <section ref={refs.words} className="glossary-block">
              {searching ? <h2 className="glossary-block-title">Words · {count.words}</h2> : null}
              {wordSections.map((g) => (
                <section key={g.lessonId} className="glossary-section">
                  <h2 className="toc-group-title">
                    {g.title} <span className="glossary-count">({g.items.length})</span>
                  </h2>
                  <table className="glossary-table">
                    <tbody>
                      {g.items.map((v) => (
                        <tr key={v.id}>
                          <td className="glossary-id">{v.id}</td>
                          <td className="glossary-ja" lang="ja">
                            <button
                              type="button"
                              className="glossary-link"
                              onClick={() =>
                                onNavigate({ kind: "word", lessonId: g.lessonId, vocabularyId: v.id })
                              }
                            >
                              <FuriganaWrapText
                                surface={v.word}
                                reading={v.reading}
                                className="glossary-furi"
                                showFurigana
                              />
                            </button>
                          </td>
                          <td className="glossary-en">{v.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
              {!searching && wordSections.length === 0 ? (
                <p className="glossary-empty">No {level} words yet.</p>
              ) : null}
            </section>
          ) : null}

          {show("grammar") && (!searching || count.grammar > 0) ? (
            <section ref={refs.grammar} className="glossary-block">
              {searching ? <h2 className="glossary-block-title">Grammar · {count.grammar}</h2> : null}
              {grammarSections.map((g) => (
                <section key={g.id} className="glossary-section">
                  <h2 className="toc-group-title">
                    {g.title} <span className="glossary-count">({g.rows.length})</span>
                  </h2>
                  <table className="glossary-table">
                    <tbody>
                      {g.rows.map(({ item, lessonId, openId, viaFamily }) => (
                        <tr key={item.id}>
                          <td className="glossary-id">{item.id}</td>
                          <td className="glossary-ja" lang="ja">
                            {lessonId ? (
                              <button
                                type="button"
                                className="glossary-link"
                                title={viaFamily ? "Opens the main pattern of this family" : undefined}
                                onClick={() =>
                                  onNavigate({ kind: "grammar", lessonId, grammarId: openId })
                                }
                              >
                                <FuriganaWrapText
                                  surface={item.pattern}
                                  reading={item.patternReading}
                                  className="glossary-furi"
                                  showFurigana
                                />
                              </button>
                            ) : (
                              <span className="glossary-static">
                                <FuriganaWrapText
                                  surface={item.pattern}
                                  reading={item.patternReading}
                                  className="glossary-furi"
                                  showFurigana
                                />
                              </span>
                            )}
                          </td>
                          <td className="glossary-en">
                            {item.meaning}
                            {viaFamily ? <span className="glossary-note"> · variant</span> : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
              {!searching && grammarSections.length === 0 ? (
                <p className="glossary-empty">No {level} grammar in the app yet.</p>
              ) : null}
            </section>
          ) : null}

          {show("related") && (!searching || count.related > 0) ? (
            <section ref={refs.related} className="glossary-block">
              {searching ? <h2 className="glossary-block-title">Related words · {count.related}</h2> : null}
              {relationRows.length > 0 ? (
                <table className="glossary-table glossary-table--pairs">
                  <tbody>
                    {relationRows.map((r) => (
                      <tr key={r.id}>
                        <td className="glossary-id">{r.jlptLevel}</td>
                        <td className="glossary-ja" lang="ja">
                          <FuriganaWrapText
                            surface={r.word1.japanese}
                            reading={r.word1.reading}
                            className="glossary-furi"
                            showFurigana
                          />
                        </td>
                        <td className="glossary-rel" title={WORD_RELATION_TYPE_LABELS[r.type].english}>
                          {WORD_RELATION_TYPE_LABELS[r.type].symbol}
                        </td>
                        <td className="glossary-ja" lang="ja">
                          <FuriganaWrapText
                            surface={r.word2.japanese}
                            reading={r.word2.reading}
                            className="glossary-furi"
                            showFurigana
                          />
                        </td>
                        <td className="glossary-en">
                          {r.word1.meaning} / {r.word2.meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : !searching ? (
                <p className="glossary-empty">No {level} synonym / antonym pairs yet.</p>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
