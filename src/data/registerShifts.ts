import type { RegisterShift } from "../types/speechStyle";

/**
 * The same person, speaking differently depending on who is listening.
 *
 * This is the antidote to "women say X, men say Y". Gendered speech in Japanese
 * is not a fixed property of the speaker — it moves with the relationship, the
 * setting and how much of themselves the speaker wants to show.
 */
export const registerShifts: readonly RegisterShift[] = [
  {
    id: "shift-office-woman",
    speaker: "Yuki, 29 — works in a Tokyo office",
    summary:
      "Her pronoun barely changes. What changes is the ending of the sentence.",
    contexts: [
      {
        context: "With a client",
        japanese: "私が確認いたします。",
        note: "私 plus humble keigo. あたし here would be unthinkable.",
      },
      {
        context: "With colleagues",
        japanese: "私が確認しますね。",
        note: "Still 私, but plain polite plus a softening ね.",
      },
      {
        context: "With friends",
        japanese: "私が見とくよ。",
        note: "Many women never switch away from 私 at all — including here.",
      },
      {
        context: "With her partner",
        japanese: "あたしが見とく。",
        note: "あたし appears only in the most relaxed setting, if at all.",
      },
    ],
  },
  {
    id: "shift-office-man",
    speaker: "Ren, 31 — works at the same company",
    summary:
      "僕 at work is not childish; 俺 with friends is not rude. Both are ordinary adult speech.",
    contexts: [
      {
        context: "With a client",
        japanese: "私が確認いたします。",
        note: "私 is standard for men in business. 僕 would be slightly too casual here.",
      },
      {
        context: "With colleagues",
        japanese: "僕が確認しておきます。",
        note: "僕 reads as courteous and unaggressive — a normal office choice.",
      },
      {
        context: "With friends",
        japanese: "俺が見とくよ。",
        note: "俺 is simply the default among friends, carrying no rudeness.",
      },
      {
        context: "With close male friends",
        japanese: "俺が見とくわ。",
        note: "Note this わ is the flat Kansai-style わ, not the rising feminine one.",
      },
    ],
  },
  {
    id: "shift-teen",
    speaker: "Sora, 17 — high school student",
    summary:
      "Teenage speech is where gender marking is loudest, and where it fades fastest with age.",
    contexts: [
      {
        context: "With a teacher",
        japanese: "すみません、わかりません。",
        note: "Full polite forms. No trace of the register below.",
      },
      {
        context: "With classmates",
        japanese: "ごめん、わかんない。",
        note: "わかんない is neutral — used by everyone in this age group.",
      },
      {
        context: "Boys among themselves",
        japanese: "わりい、わかんねえ。",
        note: "The ee contraction appears almost exclusively here.",
      },
      {
        context: "Girls among themselves",
        japanese: "ごめん、まじわかんない。",
        note: "Intensifiers rather than sound changes — まじ, すっごい, めっちゃ.",
      },
    ],
  },
  {
    id: "shift-family",
    speaker: "Keiko, 62 — talking to different generations",
    summary:
      "Older women use the classic feminine forms that younger women have largely dropped.",
    contexts: [
      {
        context: "To a neighbour",
        japanese: "そうですわね、困りましたわ。",
        note: "The 〜わ that sounds theatrical from a 25-year-old is ordinary here.",
      },
      {
        context: "To her adult daughter",
        japanese: "あんた、ちゃんと食べてるの。",
        note: "あんた from a mother is affectionate, not an insult.",
      },
      {
        context: "To her grandchild",
        japanese: "早く食べなさい。",
        note: "〜なさい is the standard instructive form to a child.",
      },
    ],
  },
  {
    id: "shift-couple",
    speaker: "A couple at home",
    summary:
      "Partners often drop the most register, which is exactly why it sounds intimate.",
    contexts: [
      {
        context: "Her, asking",
        japanese: "ねえ、それ取ってくれる？",
        note: "〜てくれる？ is neutral and warm. 〜てくれ would sound curt.",
      },
      {
        context: "Him, asking",
        japanese: "ちょっとそれ取って。",
        note: "Bare 〜て between partners is normal, not brusque.",
      },
      {
        context: "Him, in public with her",
        japanese: "これ、持つよ。",
        note: "Many men soften noticeably in public, dropping 俺 and rough endings.",
      },
    ],
  },
];
