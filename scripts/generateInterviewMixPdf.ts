/**
 * Generate HTML + PDF for the N3 JP+EN mix interview script (Nanami only).
 *
 * Usage:  npm run interview-mix-pdf
 *
 * Writes:
 *   public/interview-prep-n3-mix.html
 *   public/interview-prep-n3-mix.pdf
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { interviewMixSections } from "../src/data/interviewPrepMix";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const htmlPath = join(publicDir, "interview-prep-n3-mix.html");
const pdfPath = join(publicDir, "interview-prep-n3-mix.pdf");

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHtml(): string {
  const sections = interviewMixSections
    .map((section) => {
      const lines = section.lines
        .map(
          (line) => `
        <div class="line">
          <div class="ja">${escapeHtml(line.japanese)}</div>
          <div class="romaji">${escapeHtml(line.romaji)}</div>
        </div>`
        )
        .join("\n");

      return `
    <section class="section">
      <h2>N3 Mix ${section.number}. ${escapeHtml(section.title)} · ${escapeHtml(section.titleEn)}</h2>
      <p class="spoken-title">
        <span class="label">Title (Nanami)</span>
        ${escapeHtml(`セクション${section.number}。${section.title}`)}
      </p>
      <div class="lines">${lines}</div>
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>N3 JP+EN Mix Interview Prep — Full Script</title>
  <style>
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Yu Gothic", "YuGothic", "Meiryo", "Noto Sans JP", sans-serif;
      color: #111;
      line-height: 1.55;
      max-width: 820px;
      margin: 0 auto;
      padding: 24px 20px 48px;
      font-size: 12.5pt;
    }
    h1 {
      font-size: 20pt;
      margin: 0 0 6px;
      letter-spacing: 0.02em;
    }
    .subtitle {
      color: #444;
      margin: 0 0 28px;
      font-size: 11pt;
    }
    .section {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 28px;
      padding-bottom: 18px;
      border-bottom: 1px solid #e5e7eb;
    }
    h2 {
      font-size: 13.5pt;
      margin: 0 0 10px;
      color: #1e3a8a;
    }
    .spoken-title {
      font-size: 10pt;
      color: #555;
      background: #f3f4f6;
      padding: 8px 10px;
      border-radius: 6px;
      margin: 0 0 12px;
    }
    .label {
      display: block;
      font-size: 9pt;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .line { margin-bottom: 10px; }
    .ja { font-size: 12.5pt; font-weight: 600; }
    .romaji {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 10.5pt;
      color: #111;
      letter-spacing: 0.03em;
      margin-top: 2px;
    }
    @media print {
      body { padding: 0; max-width: none; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>N3 JP+EN Mix Interview Prep</h1>
  <p class="subtitle">
    Nanami voiceover only · natural spoken JP + EN mix with romaji<br />
    ${interviewMixSections.length} sections
  </p>
  ${sections}
</body>
</html>`;
}

function findBrowser(): string | null {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function printPdf(browser: string, htmlFile: string, outPdf: string): void {
  const fileUrl = pathToFileURL(htmlFile).href;
  const result = spawnSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${outPdf}`,
      fileUrl,
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join("\n");
    throw new Error(
      `Browser PDF export failed (exit ${result.status}). ${detail}`
    );
  }
  if (!existsSync(outPdf)) {
    throw new Error(`PDF was not created at ${outPdf}`);
  }
}

mkdirSync(publicDir, { recursive: true });
writeFileSync(htmlPath, buildHtml(), "utf8");
console.log(`Wrote ${htmlPath}`);

const browser = findBrowser();
if (!browser) {
  console.warn(
    "Chrome/Edge not found — skipped PDF. Open the HTML and Print → Save as PDF."
  );
  process.exit(0);
}

printPdf(browser, htmlPath, pdfPath);
console.log(`Wrote ${pdfPath}`);
