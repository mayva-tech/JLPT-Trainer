# Core 2000 — Import Complete

Vocabulary course expanded from 750 to 2,000 items (IDs 4001–6000).

## Final numbers

| Metric | Count |
|---|---|
| Existing trainer words preserved | 750 (IDs 4001–4750) |
| New items added | 1,250 (IDs 4751–6000) |
| Final vocabulary count | 2,000 |
| Unique words | 2,000 |
| Lessons | 200 (10 words each) |
| Quizzes | 200 |
| Candidate overlap (exact match) | 213 |
| Existing not in candidate list (kept) | 537 |
| Candidates displaced | 537 |
| Missing kanji resolved | 195 |

## Merge strategy applied

Keep all 750 existing → add 1,250 highest-priority missing candidates by rank → displace 537 lowest-priority candidates.

## Key files

| Purpose | Path |
|---|---|
| Course constants | `src/config/vocabularyCourse.ts` |
| New seeds (generated TS) | `src/data/vocabularyCore2000Seeds.ts` |
| New lessons 76–200 | `src/data/lessonsCore2000.ts` |
| Course-wide test | `src/data/core2000Course.test.ts` |
| Audit artifacts | `scripts/core2000/` |
| Seed JSON batches | `scripts/core2000/seeds/` |
| Full inventory | `scripts/core2000/final-selection.tsv` |
| Human review items | `scripts/core2000/review-needed.txt` |

## Validation

- `npm run build` — pass
- `npm run test` — 161/161 pass
- `npm run lint` — pass (pre-existing React hook warnings only)
- `npm run audit:vocabulary` — exit 0
