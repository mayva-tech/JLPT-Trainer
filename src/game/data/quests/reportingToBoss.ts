import type { ConversationDefinition, QuestDefinition } from "../../types";

/**
 * Chapter 4 · Reporting to Your Boss
 * 上司に報告 — 報連相: conclusion first, status %, problem, next action.
 *
 * Facts locked early: 80% / 仕様確認 / 金曜 — recalled later.
 * reportingTags drive mission-result Professional Fit notes.
 */
export const REPORTING_TO_BOSS_CONVERSATION: ConversationDefinition = {
  startNodeId: "arrive",
  resultSummaryTitle: "REPORT CARD",
  nodes: [
    {
      id: "arrive",
      japanese: "鈴木マネージャーに進捗を報告します。結論から、短く。",
      reading:
        "すずき マネージャー に しんちょく を ほうこく します けつろん から みじかく",
      english:
        "Time to update Suzuki-manager.\n\n報連相 (report / contact / consult): lead with the conclusion, then status, problem, and next action.",
      nextNodeId: "notes-prep",
      speech: { autoPlay: true, language: "en" },
    },
    {
      id: "notes-prep",
      japanese:
        "メモを確認します。進捗は80%。残りは仕様確認。提出期限は金曜です。",
      reading:
        "メモ を かくにん します しんちょく は はちじゅう パーセント のこり は しよう かくにん ていしゅつ きげん は きんようび です",
      english:
        "Check your notes: progress 80%. Pending: spec confirmation. Deadline: Friday.",
      setsFacts: {
        progressPercent: "80%",
        pendingItem: "仕様確認",
        deadline: "金曜",
      },
      factLabels: {
        progressPercent: "Progress",
        pendingItem: "Pending item",
        deadline: "Deadline",
      },
      nextNodeId: "approach",
      speech: { autoPlay: true },
      helpHint: "Lock 80% / 仕様確認 / 金曜 — the manager may ask again later.",
    },
    {
      id: "approach",
      npcId: "suzuki-manager",
      japanese: "あ、どうぞ。",
      reading: "あ どうぞ",
      english: "Ah — go ahead.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Even with a manager, soft timing check first.",
      vocabHint: "今お時間よろしいでしょうか",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ap-ex",
          japanese: "失礼します。今お時間よろしいでしょうか。進捗のご報告です。",
          reading:
            "しつれい します いま おじかん よろしい でしょう か しんちょく の ごほうこく です",
          english:
            "Excuse me — do you have a moment? I'd like to report progress.",
          quality: "excellent",
          nextNodeId: "prompt",
          relationshipDelta: 1,
          feedback:
            "🌟 Very natural\n\nTiming check + purpose — polished before a boss report.",
          vocabHint: "今お時間よろしいでしょうか",
        },
        {
          id: "ap-nat",
          japanese: "すみません、進捗の報告をお願いできますか。",
          reading: "すみません しんちょく の ほうこく を おねがい できます か",
          english: "Sorry — may I give a progress update?",
          quality: "natural",
          nextNodeId: "prompt",
          relationshipDelta: 1,
          feedback: "✓ Natural\n\nClear purpose for the interruption.",
        },
        {
          id: "ap-awk",
          japanese: "ちょっといいですか。いろいろあって…",
          reading: "ちょっと いい です か いろいろ あって",
          english: "Got a sec? There's a bunch of stuff…",
          quality: "awkward",
          nextNodeId: "prompt",
          feedback:
            "△ Awkward\n\nVague 「いろいろ」before facts wastes a manager's time.",
        },
      ],
    },
    {
      id: "prompt",
      npcId: "suzuki-manager",
      japanese: "はい、どうぞ。結論からお願いします。",
      reading: "はい どうぞ けつろん から おねがい します",
      english: "Yes — please start with the conclusion.",
      objectiveType: "social-choice",
      socialContext: "manager",
      register: "business",
      helpHint:
        "Lead with outcome + %. Avoid long excuses or detail dumps before the conclusion.",
      vocabHint: "結論から言うと",
      speech: { autoPlay: true },
      choices: [
        {
          id: "rep-ex",
          japanese:
            "結論から申し上げます。進捗は80%です。残りは仕様確認で、金曜までに完了予定です。",
          reading:
            "けつろん から もうしあげます しんちょく は はちじゅう パーセント です のこり は しよう かくにん で きんようび まで に かんりょう よてい です",
          english:
            "Conclusion first: we're at 80%. Spec confirmation remains; on track for Friday.",
          quality: "excellent",
          nextNodeId: "good-react",
          relationshipDelta: 2,
          reportingTags: ["conclusion-first", "clear", "action-stated"],
          feedback:
            "🌟 Excellent 報連相\n\nConclusion → % → pending item → deadline/next action. Concise and boss-ready.",
          vocabHint: "結論から言うと",
        },
        {
          id: "rep-nat",
          japanese: "進捗は80%です。仕様確認が残っています。",
          reading:
            "しんちょく は はちじゅう パーセント です しよう かくにん が のこって います",
          english: "Progress is 80%. Spec confirmation is still pending.",
          quality: "natural",
          nextNodeId: "good-react",
          relationshipDelta: 1,
          reportingTags: ["clear", "action-stated"],
          feedback:
            "✓ Natural\n\nClear status. Naming the deadline (金曜) would make it even stronger.",
        },
        {
          id: "rep-excuse",
          japanese:
            "申し訳ありません。いろいろ忙しくて、まだ全部は終わっていなくて、昨日も遅くまで…",
          reading:
            "もうしわけ ありません いろいろ いそがしくて まだ ぜんぶ は おわって いなくて きのう も おそく まで",
          english:
            "I'm so sorry — I've been busy, it's not all done, I stayed late yesterday…",
          quality: "awkward",
          nextNodeId: "excuse-react",
          reportingTags: ["excuse-heavy"],
          feedback:
            "△ Awkward — excuse-heavy\n\nApologies before facts bury the status. Lead with 結論, then mention blockers briefly.",
        },
        {
          id: "rep-detail",
          japanese:
            "まず月曜日にメールを確認して、そのあと表を直して、会議のメモも見て、それから…",
          reading:
            "まず げつようび に メール を かくにん して そのあと ひょう を なおして かいぎ の メモ も みて それから",
          english:
            "First I checked email Monday, then fixed the sheet, then meeting notes, and then…",
          quality: "incorrect",
          nextNodeId: "detail-react",
          reportingTags: ["too-much-detail"],
          confidenceDelta: -1,
          communicationDelta: -8,
          feedback:
            "✕ Too much detail before the conclusion\n\nManagers need 結論・進捗% first — not a play-by-play diary.",
        },
      ],
    },
    {
      id: "good-react",
      npcId: "suzuki-manager",
      japanese: "わかりました。進捗と期限、はっきりしていますね。",
      reading: "わかりました しんちょく と きげん はっきり して います ね",
      english: "Got it. Progress and deadline are clear.",
      nextNodeId: "recall-percent",
      speech: { autoPlay: true },
    },
    {
      id: "excuse-react",
      npcId: "suzuki-manager",
      japanese:
        "気持ちはわかりますが、先に数字と期限をください。進捗は何パーセントですか。",
      reading:
        "きもち は わかります が さき に すうじ と きげん を ください しんちょく は なん パーセント です か",
      english:
        "I understand the feeling, but give me numbers and the deadline first. What percent are you at?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Recover: state % and deadline cleanly — no more apology stack.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "ex-rec",
          japanese: "すみません。進捗は80%で、金曜までに仕様確認を終えます。",
          reading:
            "すみません しんちょく は はちじゅう パーセント で きんようび まで に しよう かくにん を おえます",
          english:
            "Sorry. Progress is 80%; I'll finish spec confirmation by Friday.",
          quality: "excellent",
          nextNodeId: "recall-deadline",
          relationshipDelta: 1,
          reportingTags: ["conclusion-first", "clear", "action-stated"],
          feedback:
            "🌟 Recovered\n\nShort apology, then facts — that's the reset.",
          checksFact: "progressPercent",
          expectedFactValue: "80%",
        },
        {
          id: "ex-more",
          japanese: "本当に申し訳なくて…次は気をつけます。",
          reading: "ほんとう に もうしわけ なくて つぎ は き を つけます",
          english: "I'm truly so sorry… I'll be more careful next time.",
          quality: "awkward",
          nextNodeId: "recall-deadline",
          reportingTags: ["excuse-heavy"],
          feedback:
            "△ Still excuse-heavy\n\nThey asked for % — answer with 80% and 金曜.",
        },
      ],
    },
    {
      id: "detail-react",
      npcId: "suzuki-manager",
      japanese:
        "手順はあとで結構です。まず結論を。今、何パーセントで、何が残っていますか。",
      reading:
        "てじゅん は あと で けっこう です まず けつろん を いま なん パーセント で なに が のこって います か",
      english:
        "The play-by-play can wait. Conclusion first — what percent, and what's left?",
      objectiveType: "social-choice",
      socialContext: "manager",
      register: "business",
      helpHint: "Answer with 80% + 仕様確認 — no more chronological dump.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "det-rec",
          japanese: "はい。進捗80%です。残りは仕様確認です。",
          reading:
            "はい しんちょく はちじゅう パーセント です のこり は しよう かくにん です",
          english: "Right. 80% progress. Spec confirmation remains.",
          quality: "excellent",
          nextNodeId: "recall-deadline",
          relationshipDelta: 1,
          reportingTags: ["conclusion-first", "clear"],
          feedback:
            "🌟 Recovered\n\nConclusion-first after a redirect — good professional recovery.",
          checksFact: "progressPercent",
          expectedFactValue: "80%",
          vocabHint: "仕様確認",
        },
        {
          id: "det-again",
          japanese: "それで、表の三行目を直したあと、メールの件なんですが…",
          reading:
            "それで ひょう の さんぎょうめ を なおした あと メール の けん なんです が",
          english:
            "So after I fixed row three of the sheet, about that email…",
          quality: "incorrect",
          nextNodeId: "recall-deadline",
          reportingTags: ["too-much-detail"],
          confidenceDelta: -1,
          communicationDelta: -8,
          feedback:
            "✕ Still too much detail\n\nThey asked for % and what's left — not another diary entry.",
        },
      ],
    },
    {
      id: "recall-percent",
      npcId: "suzuki-manager",
      japanese: "確認ですが、進捗は何パーセントでしたか。",
      reading: "かくにん です が しんちょく は なん パーセント でした か",
      english: "Just to confirm — what percent was the progress?",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Recall from your notes: 80%.",
      vocabHint: "パーセント",
      speech: { autoPlay: true },
      choices: [
        {
          id: "pct-ex",
          japanese: "80%です。",
          reading: "はちじゅう パーセント です",
          english: "Eighty percent.",
          quality: "excellent",
          nextNodeId: "recall-deadline",
          reportingTags: ["clear"],
          feedback: "🌟 Exact recall\n\n「80%」matches the notes you locked earlier.",
          checksFact: "progressPercent",
          expectedFactValue: "80%",
        },
        {
          id: "pct-nat",
          japanese: "だいたい80%です。",
          reading: "だいたい はちじゅう パーセント です",
          english: "About 80%.",
          quality: "natural",
          nextNodeId: "recall-deadline",
          reportingTags: ["clear"],
          feedback: "✓ Natural\n\nClose enough — exact 80% is even cleaner.",
          checksFact: "progressPercent",
          expectedFactValue: "80%",
        },
        {
          id: "pct-wrong",
          japanese: "50%くらいです。",
          reading: "ごじゅう パーセント くらい です",
          english: "Around 50%.",
          quality: "incorrect",
          nextNodeId: "recall-deadline",
          confidenceDelta: -1,
          communicationDelta: -8,
          feedback:
            "✕ Misremembered\n\nYour notes said 80%, not 50%. Accuracy builds trust in 報告.",
          checksFact: "progressPercent",
          expectedFactValue: "50%",
        },
      ],
    },
    {
      id: "recall-deadline",
      npcId: "suzuki-manager",
      japanese: "提出期限はいつでしたか。",
      reading: "ていしゅつ きげん は いつ でした か",
      english: "When was the submission deadline?",
      objectiveType: "social-choice",
      socialContext: "manager",
      register: "business",
      helpHint: "Recall: 金曜.",
      vocabHint: "金曜",
      speech: { autoPlay: true },
      choices: [
        {
          id: "dl-ex",
          japanese: "金曜です。それまでに仕様確認を終えます。",
          reading: "きんようび です それ まで に しよう かくにん を おえます",
          english: "Friday. I'll finish spec confirmation by then.",
          quality: "excellent",
          nextNodeId: "next-action",
          relationshipDelta: 1,
          reportingTags: ["clear", "action-stated"],
          feedback:
            "🌟 Clear\n\nDeadline + next action — 報連相 complete.",
          checksFact: "deadline",
          expectedFactValue: "金曜",
          vocabHint: "仕様確認",
        },
        {
          id: "dl-nat",
          japanese: "金曜日です。",
          reading: "きんようび です",
          english: "Friday.",
          quality: "natural",
          nextNodeId: "next-action",
          reportingTags: ["clear"],
          feedback: "✓ Natural\n\nCorrect deadline recall.",
          checksFact: "deadline",
          expectedFactValue: "金曜",
        },
        {
          id: "dl-wrong",
          japanese: "来週の月曜です。",
          reading: "らいしゅう の げつようび です",
          english: "Next Monday.",
          quality: "incorrect",
          nextNodeId: "next-action",
          confidenceDelta: -1,
          communicationDelta: -8,
          feedback:
            "✕ Wrong day\n\nNotes said 金曜. Mixing up deadlines is exactly what 報告 is meant to prevent.",
          checksFact: "deadline",
          expectedFactValue: "来週の月曜",
        },
      ],
    },
    {
      id: "next-action",
      npcId: "suzuki-manager",
      japanese: "わかりました。詰まったら早めに相談してください。",
      reading: "わかりました つまったら はやめ に そうだん して ください",
      english: "Understood. If you get stuck, consult early.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Acknowledge + commit to the next action (連絡・相談).",
      vocabHint: "相談する",
      speech: { autoPlay: true },
      choices: [
        {
          id: "na-ex",
          japanese:
            "はい。仕様確認で不明点があれば、すぐにご相談します。",
          reading:
            "はい しよう かくにん で ふめいてん が あれば すぐ に ごそうだん します",
          english:
            "Yes. If anything is unclear in the spec check, I'll consult you right away.",
          quality: "excellent",
          nextNodeId: "closing",
          relationshipDelta: 2,
          reportingTags: ["action-stated", "clear"],
          feedback:
            "🌟 Excellent close\n\nYou restated the pending item and promised early 相談 — that's 連・相.",
          vocabHint: "相談する",
        },
        {
          id: "na-nat",
          japanese: "承知しました。問題があれば連絡します。",
          reading: "しょうち しました もんだい が あれば れんらく します",
          english: "Understood. I'll contact you if there's a problem.",
          quality: "natural",
          nextNodeId: "closing",
          relationshipDelta: 1,
          reportingTags: ["action-stated"],
          feedback: "✓ Natural\n\nClear commitment to 連絡.",
          vocabHint: "承知しました",
        },
        {
          id: "na-awk",
          japanese: "大丈夫です。一人で何とかします。",
          reading: "だいじょうぶ です ひとり で なんとか します",
          english: "It's fine. I'll handle it alone.",
          quality: "awkward",
          nextNodeId: "closing",
          feedback:
            "△ Awkward\n\nSkipping 相談 when stuck is the opposite of 報連相.",
        },
      ],
    },
    {
      id: "closing",
      npcId: "suzuki-manager",
      japanese: "では、お願いします。",
      reading: "では おねがい します",
      english: "All right — please proceed.",
      objectiveType: "social-choice",
      socialContext: "boss",
      register: "business",
      helpHint: "Close politely: 失礼します / 承知しました.",
      speech: { autoPlay: true },
      choices: [
        {
          id: "cl-ex",
          japanese: "承知しました。失礼します。",
          reading: "しょうち しました しつれい します",
          english: "Understood. Excuse me.",
          quality: "excellent",
          nextNodeId: "success",
          relationshipDelta: 1,
          feedback:
            "🌟 Very natural\n\n「承知しました」+ 「失礼します」— clean exit from a manager's desk.",
          vocabHint: "失礼します",
        },
        {
          id: "cl-nat",
          japanese: "はい、失礼します。",
          reading: "はい しつれい します",
          english: "Yes — excuse me.",
          quality: "natural",
          nextNodeId: "success",
          feedback: "✓ Natural\n\nPolite close.",
        },
        {
          id: "cl-awk",
          japanese: "じゃ、行きます。",
          reading: "じゃ いきます",
          english: "Okay, I'm off.",
          quality: "awkward",
          nextNodeId: "success",
          feedback:
            "△ Awkward\n\nToo casual after a formal report — prefer 失礼します.",
        },
      ],
    },
    {
      id: "success",
      japanese:
        "報告完了。結論→進捗→残件→期限→次の行動。これが報連相の型です。",
      reading:
        "ほうこく かんりょう けつろん しんちょく ざんけん きげん つぎ の こうどう これ が ほうれんそう の かた です",
      english:
        "Report complete. Conclusion → progress → pending → deadline → next action — that's 報連相.",
      endState: "success",
      speech: { autoPlay: true },
    },
  ],
};

export const REPORTING_TO_BOSS_QUEST: QuestDefinition = {
  id: "reporting-to-boss",
  title: "Reporting to Your Boss",
  japaneseTitle: "上司に報告",
  japaneseTitleReading: "じょうし に ほうこく",
  locationId: "office",
  chapter: 4,
  description:
    "Practice 報連相 with Suzuki-manager: lead with the conclusion, state progress (80%), name the pending item (仕様確認), own the Friday deadline, and commit to the next action — without drowning them in excuses or detail.",
  difficulty: "hard",
  recommendedLevel: 7,
  startingConfidence: 4,
  requiresQuestIds: ["morning-office"],
  objectives: [
    { id: "approach", label: "Ask for a moment to report" },
    { id: "conclusion", label: "Lead with the conclusion" },
    { id: "recall", label: "Recall progress % and deadline" },
    { id: "action", label: "State the next action" },
    { id: "close", label: "Close politely" },
  ],
  steps: [],
  conversation: REPORTING_TO_BOSS_CONVERSATION,
  rewards: {
    xp: 200,
    replayXp: 25,
    skillRewards: {
      listening: 2,
      conversation: 4,
      politeness: 5,
    },
    replaySkillRewards: {
      conversation: 1,
      politeness: 1,
    },
    coins: 50,
    unlockQuestIds: ["business-phone"],
    nextQuestTeaser: {
      id: "business-phone",
      title: "Business Phone Call",
      japaneseTitle: "仕事の電話",
    },
    relationshipNpcIds: ["suzuki-manager"],
  },
  unlocks: {
    questIds: ["business-phone"],
  },
  meetNpcIds: ["suzuki-manager"],
  icon: "📋",
};
