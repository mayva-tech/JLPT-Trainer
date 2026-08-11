import fs from "fs";
const t = fs.readFileSync("src/data/vocabulary.ts", "utf8");
const m = [...t.matchAll(/wordType: "([^"]+)"/g)].map((x) => x[1]);
const c = {};
for (const x of m) c[x] = (c[x] || 0) + 1;
console.log(
  Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${v}\t${k}`)
    .join("\n")
);
