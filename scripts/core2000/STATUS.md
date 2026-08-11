# Core 2000 merge status

## Audit (exact spelling match)

| Metric | Count |
|---|---|
| Existing trainer words | 750 (IDs 4001–4750) |
| Candidate list | 2000 unique |
| Exact matches (preserve existing metadata) | 213 |
| Existing not in candidate list (KEEP) | 537 |
| Candidates missing from trainer | 1787 |
| New items to add (to reach 2000) | 1250 |
| Candidates displaced | 537 (ranks ~1391–2000 among missing) |
| New ID range | 4751–6000 |

## Selection rule applied

Keep all 750 existing → add highest-priority missing candidates by rank → displace lowest-priority leftover candidates.

Artifacts:
- `scripts/core2000/merge-audit.json`
- `scripts/core2000/selection-plan.json`
- `scripts/core2000/to-add.txt`
- `scripts/core2000/displaced.txt`

## Infrastructure done

- `src/config/vocabularyCourse.ts` (counts still 750/75 until content lands)
- Lesson id regex supports `lesson-100+`
- TOC vocab builders + quiz mapping use course constants
- `TocItemId` uses template literals; `quizIds` generated from lesson count
- Audit script uses `N2_VOCAB_ITEM_COUNT`

## Still required for full import

1. Author 1250 new VocabularySeed records (reading, meaning, phrase, sentence, wordType, folder, kanji)
2. Append to `vocabulary.ts` + KANJI map updates
3. Add lessons 76–200 (+ thematic regroup if desired)
4. Bump `N2_VOCAB_ITEM_COUNT` → 2000 and `N2_VOCAB_LESSON_COUNT` → 200
5. Update tests; run build / test / lint / audit:vocabulary
