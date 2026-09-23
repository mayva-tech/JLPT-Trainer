import type { QuestDefinition } from "../../types";

/**
 * Chapter 2 · Office
 * 職場での一日 — First Day at Work
 *
 * Correct answer positions (0-based): 1, 2, 0, 1, 2, 0, 1
 */
export const FIRST_DAY_OFFICE_QUEST: QuestDefinition = {
  id: "first-day-office",
  title: "First Day at Work",
  japaneseTitle: "職場での一日",
  japaneseTitleReading: "しょくば で の いちにち",
  locationId: "office",
  chapter: 2,
  description:
    "First day at the office: greet your team leader, understand a multi-part task, ask for clarification instead of bluffing, report honestly, and read a short workplace message.",
  difficulty: "hard",
  recommendedLevel: 6,
  startingConfidence: 5,
  requiresQuestIds: ["phone-call"],
  icon: "🏢",
  meetNpcIds: ["suzuki-manager", "mika-coworker"],
  objectives: [
    { id: "greeting", label: "First-day greeting" },
    { id: "task", label: "Understand a multi-part assignment" },
    { id: "clarify", label: "Ask for clarification" },
    { id: "permission", label: "Request permission" },
    { id: "correction", label: "Receive a correction" },
    { id: "report", label: "Report incomplete work honestly" },
    { id: "message", label: "Interpret a short workplace message" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa:
        "本日からことば町のオフィスで働き始めます。上司と同僚に、ちゃんと日本語で挨拶しよう。",
      promptReading:
        "ほんじつ から ことばまち の オフィス で はたらき はじめます。じょうし と どうりょう に、 ちゃんと にほんご で あいさつ しよう。",
      promptEn:
        "Today is your first day at the office in Kotoba Town.\n\nGreet people properly, understand instructions, and never pretend you understood when you didn’t.",
      costsConfidence: false,
    },
    {
      id: "first-greeting",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "suzuki-manager",
      promptJa: "あ、今日からですね。自己紹介をお願いします。",
      promptReading: "あ、きょう から です ね。じこしょうかい を おねがい します。",
      promptEn: "Suzuki, your team leader, greets you. Choose a natural first-day line.",
      skillHint: "politeness",
      vocabHint: "本日からお世話になります",
      helpHint:
        "「本日からお世話になります。よろしくお願いいたします。」is a classic first-day greeting.",
      choices: [
        {
          id: "a",
          labelJa: "やあ、よろしく。今日から来たよ。",
          reading: "やあ、 よろしく。きょう から きた よ。",
          labelEn: "Hey — I started today.",
          correct: false,
          feedbackWrong: "❌ Too casual for a first greeting with your manager.",
        },
        {
          id: "b",
          labelJa:
            "おはようございます。本日からお世話になります。よろしくお願いいたします。",
          reading:
            "おはよう ございます。ほんじつ から おせわ に なります。よろしく おねがい いたします。",
          labelEn:
            "Good morning. I’ll be in your care starting today. Nice to meet you.",
          correct: true,
          feedbackCorrect:
            "✅ Morning greeting + 本日からお世話になります + よろしく — solid first day.",
        },
        {
          id: "c",
          labelJa: "お電話ありがとうございます。",
          reading: "おでんわ ありがとう ございます。",
          labelEn: "Thank you for calling.",
          correct: false,
          feedbackWrong: "❌ Phone-support opener — you’re the new hire.",
        },
      ],
    },
    {
      id: "task-brief",
      kind: "listening",
      objectiveType: "listening",
      npcId: "suzuki-manager",
      promptJa: "上司の指示を聞いてください。何をしますか。",
      promptReading: "じょうし の しじ を きいて ください。なに を します か。",
      promptEn: "Listen to your manager’s instructions. What will you do?",
      listenText:
        "この資料なんですが、午後の会議までに数字を確認して、修正したものを共有してもらえますか。",
      listenReading:
        "この しりょう なんです が、ごご の かいぎ まで に すうじ を かくにん して、しゅうせい した もの を きょうゆう して もらえます か。",
      skillHint: "listening",
      vocabHint: "共有する",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint:
        "Three actions: 確認する → 修正する → 共有する, before the afternoon meeting.",
      choices: [
        {
          id: "a",
          labelJa: "印刷だけして机に置く。",
          reading: "いんさつ だけ して つくえ に おく。",
          labelEn: "Just print it and leave it on the desk.",
          correct: false,
          feedbackWrong: "❌ Sharing a corrected file is required — not just printing.",
        },
        {
          id: "b",
          labelJa: "会議をキャンセルする。",
          reading: "かいぎ を キャンセル する。",
          labelEn: "Cancel the meeting.",
          correct: false,
          feedbackWrong: "❌ The meeting stays; the document must be ready.",
        },
        {
          id: "c",
          labelJa:
            "数字を確認し、修正して、午後の会議までに共有する。",
          reading:
            "すうじ を かくにん し、 しゅうせい して、 ごご の かいぎ まで に きょうゆう する。",
          labelEn:
            "Confirm the numbers, correct the file, and share it before the afternoon meeting.",
          correct: true,
          feedbackCorrect:
            "✅ All three: confirm numbers, correct the file, share before the meeting.",
        },
      ],
    },
    {
      id: "dont-bluff",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "suzuki-manager",
      promptJa: "大丈夫そうですか。",
      promptReading: "だいじょうぶ そう です か。",
      promptEn:
        "You didn’t fully catch every detail. What’s the best move?",
      skillHint: "conversation",
      vocabHint: "確認させてください",
      helpHint:
        "Don’t say 「はい、わかりました」if you didn’t understand. Clarify.",
      choices: [
        {
          id: "a",
          labelJa:
            "すみません、確認させてください。修正した資料を午後の会議までに共有すればいいですか。",
          reading:
            "すみません、 かくにん させて ください。しゅうせい した しりょう を ごご の かいぎ まで に きょうゆう すれば いい です か。",
          labelEn:
            "Sorry — let me confirm. I should share the corrected document before the afternoon meeting, right?",
          correct: true,
          feedbackCorrect:
            "✅ Communication over bluffing.\n\n「確認させてください」+ restating the task.",
        },
        {
          id: "b",
          labelJa: "はい、わかりました。",
          labelEn: "Yes, understood.",
          correct: false,
          feedbackWrong:
            "❌ Tempting — but you didn’t fully understand. Clarify instead.",
        },
        {
          id: "c",
          labelJa: "無理です。やりません。",
          reading: "むり です。やりません。",
          labelEn: "Impossible. I won’t do it.",
          correct: false,
          feedbackWrong: "❌ Too blunt. Ask to confirm the steps first.",
        },
      ],
    },
    {
      id: "ask-permission",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "suzuki-manager",
      promptJa: "何かあれば声をかけてください。",
      promptReading: "なにか あれば こえ を かけて ください。",
      promptEn: "You need to leave your desk briefly to check a printed draft. Ask permission.",
      skillHint: "politeness",
      vocabHint: "〜てもよろしいでしょうか",
      helpHint: "「〜てもよろしいでしょうか」softly asks permission.",
      choices: [
        {
          id: "a",
          labelJa: "ちょっと行ってくる。",
          reading: "ちょっと いって くる。",
          labelEn: "Gonna step out.",
          correct: false,
          feedbackWrong: "❌ Too casual for your manager on day one.",
        },
        {
          id: "b",
          labelJa: "印刷室に少し行ってもよろしいでしょうか。",
          reading: "いんさつしつ に すこし いって も よろしい でしょう か。",
          labelEn: "May I step over to the print room briefly?",
          correct: true,
          feedbackCorrect:
            "✅ Soft permission request with 「〜てもよろしいでしょうか」.",
        },
        {
          id: "c",
          labelJa: "少々お待ちください。確認いたします。",
          reading: "しょうしょう おまち ください。かくにん いたします。",
          labelEn: "Please wait. I’ll check.",
          correct: false,
          feedbackWrong: "❌ Phone-support hold language.",
        },
      ],
    },
    {
      id: "coworker-correction",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "mika-coworker",
      promptJa:
        "あ、その表なんだけど、B列の合計がずれてるみたい。念のためもう一回見てみて。",
      promptReading:
        "あ、その ひょう なんだけど、ビーれつ の ごうけい が ずれてる みたい。ねんのため もう いっかい みて みて。",
      promptEn: "Mika (coworker) flags an error. Respond professionally but not stiff.",
      skillHint: "conversation",
      vocabHint: "念のため",
      helpHint: "With a coworker: polite, lighter than manager keigo.",
      choices: [
        {
          id: "a",
          labelJa: "恐れ入りますが、ご指摘いただき誠にありがとうございます。",
          reading:
            "おそれいります が、 ごしてき いただき まことに ありがとう ございます。",
          labelEn: "I humbly thank you for your most gracious correction.",
          correct: false,
          feedbackWrong:
            "❌ Over-formal for Mika. Keep it professional but lighter.",
        },
        {
          id: "b",
          labelJa: "別にずれてないよ。",
          reading: "べつ に ずれて ない よ。",
          labelEn: "It’s not off.",
          correct: false,
          feedbackWrong: "❌ Defensive — she asked you to check again.",
        },
        {
          id: "c",
          labelJa: "ありがとう。念のため確認するね。",
          reading: "ありがとう。ねんのため かくにん する ね。",
          labelEn: "Thanks — I’ll double-check just in case.",
          correct: true,
          feedbackCorrect:
            "✅ Natural coworker tone + 念のため確認.",
        },
      ],
    },
    {
      id: "honest-report",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "suzuki-manager",
      promptJa: "資料のほう、進みはどうですか。",
      promptReading: "しりょう の ほう、すすみ は どう です か。",
      promptEn: "You’re not finished yet. Report honestly.",
      skillHint: "politeness",
      vocabHint: "〜までには終わる予定です",
      helpHint:
        "Don’t pretend you’re done. 「まだ終わっていませんが、〜までには終わる予定です」.",
      choices: [
        {
          id: "a",
          labelJa:
            "申し訳ありません。まだ終わっていませんが、4時までには終わる予定です。",
          reading:
            "もうしわけ ありません。まだ おわって いません が、 よじ まで に は おわる よてい です。",
          labelEn:
            "I’m sorry — it’s not finished yet, but I plan to finish by 4.",
          correct: true,
          feedbackCorrect:
            "✅ Honest status + realistic ETA. Never fake “done.”",
        },
        {
          id: "b",
          labelJa: "はい、全部終わりました。",
          reading: "はい、 ぜんぶ おわりました。",
          labelEn: "Yes, everything’s finished.",
          correct: false,
          feedbackWrong:
            "❌ Pretending it’s done will blow up at the meeting.",
        },
        {
          id: "c",
          labelJa: "うん、なんかやってる。",
          labelEn: "Yeah, working on stuff.",
          correct: false,
          feedbackWrong: "❌ Too casual and unclear for a manager update.",
        },
      ],
    },
    {
      id: "chat-message",
      kind: "reading",
      objectiveType: "reading",
      npcId: "mika-coworker",
      promptJa: "みかからチャットが来ました。意味は？",
      promptReading: "みか から チャット が きました。いみ は？",
      bodyJa:
        "先ほど共有したファイル、会議前にもう一度確認お願い！間に合いそう？",
      promptEn: "What is Mika asking?",
      skillHint: "reading",
      vocabHint: "先ほど",
      helpHint: "先ほど = a little while ago. 間に合う = make it in time.",
      speech: { karaokeMode: "after-answer", autoPlay: false },
      choices: [
        {
          id: "a",
          labelJa: "会議を延期すると言っている。",
          reading: "かいぎ を えんき する と いって いる。",
          labelEn: "She’s saying to postpone the meeting.",
          correct: false,
          feedbackWrong: "❌ She’s asking you to re-check, not postpone.",
        },
        {
          id: "b",
          labelJa:
            "少し前に共有したファイルを会議前にもう一度確認してほしい。間に合うか聞いている。",
          reading:
            "すこし まえ に きょうゆう した ファイル を かいぎまえ に もう いちど かくにん して ほしい。まにあう か きいて いる。",
          labelEn:
            "She wants you to re-check the file shared earlier before the meeting, and asks if you’ll make it in time.",
          correct: true,
          feedbackCorrect:
            "✅ 先ほど共有 + 会議前に確認 + 間に合いそう？",
        },
        {
          id: "c",
          labelJa: "ランチに行こうと誘っている。",
          reading: "ランチ に いこう と さそって いる。",
          labelEn: "She’s inviting you to lunch.",
          correct: false,
          feedbackWrong: "❌ Work message about the shared file.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      promptJa:
        "初出勤おつかれさま。分からないときは確認。次は一日まるごとの社会生活チャレンジだ。",
      promptReading:
        "はつしゅっきん おつかれさま。わからない とき は かくにん。つぎ は いちにち まるごと の しゃかいせいかつ チャレンジ だ。",
      promptEn:
        "First day clear. Clarifying beats bluffing.\n\nNext: the Chapter 2 boss — Social Life Challenge.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 250,
    replayXp: 30,
    skillRewards: {
      politeness: 5,
      conversation: 5,
      listening: 4,
      grammar: 3,
      reading: 2,
    },
    replaySkillRewards: {
      politeness: 1,
      conversation: 1,
    },
    unlockQuestIds: ["social-life-challenge"],
    nextQuestTeaser: {
      id: "social-life-challenge",
      title: "Social Life Challenge",
      japaneseTitle: "社会生活チャレンジ",
    },
  },
  unlocks: {
    questIds: ["social-life-challenge"],
  },
};
