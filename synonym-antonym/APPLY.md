# Apply: Synonyms & Antonyms (類義語・反対語)

Copy the `src/` and `scripts/` trees over the repo root. Only **one existing
file changes**: `src/App.tsx`. Everything else is new.

## PowerShell

```powershell
# from the repo root, with the downloaded folder at .\synonym-antonym\
Copy-Item -Path .\synonym-antonym\src\*    -Destination .\src\     -Recurse -Force
Copy-Item -Path .\synonym-antonym\scripts\* -Destination .\scripts\ -Recurse -Force

npx oxlint
npx tsc -b
npx vitest run
npm run build
npm run dev
```

## Regenerating the dataset

`src/data/wordRelations.ts` is generated. Edit the `.tsv` sources, never the
`.ts` file:

```powershell
# add or edit lines in scripts\word-relations\*.tsv, then:
node scripts\generateWordRelations.mjs
npx vitest run src/data/wordRelations.test.ts
```

Source line format (11 pipe-delimited fields, nuance may be empty):

```
level|type|word1|reading1|meaning1|pos1|word2|reading2|meaning2|pos2|nuance
```

`pos` codes: `n` `v` `ia` `na` `adv` `exp`.

The generator sorts by level → type → reading and assigns ids
(`rel-n2-001` …), so new lines can go anywhere in any file.

## Gates that must stay green

`src/data/wordRelations.test.ts` enforces the data-quality rules: no duplicate
ids, no duplicate pairs in either direction, no word paired with itself, a
nuance note on every synonym pair, both relationship types present at every
level, and the per-level size targets.
