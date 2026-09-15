import type { QuestDefinition } from "../../types";

/**
 * Chapter 2 · Boss
 * 社会生活チャレンジ — Social Life Challenge
 *
 * “Can you get through one day in Japanese alone?”
 * Clinic callback → commute notice → work instruction → phone → honest report → N2-ish message.
 */
export const SOCIAL_LIFE_CHALLENGE_QUEST: QuestDefinition = {
  id: "social-life-challenge",
  title: "Social Life Challenge",
  japaneseTitle: "社会生活チャレンジ",
  locationId: "office",
  chapter: 2,
  description:
    "Can you get through one full day in Japanese alone? Clinic callback, commute change, multi-part work, a phone interruption, honest reporting, and a denser internal message — without emptying Confidence.",
  difficulty: "boss",
  recommendedLevel: 7,
  startingConfidence: 5,
  requiresQuestIds: ["first-day-office"],
  icon: "⭐",
  meetNpcIds: ["suzuki-manager", "mika-coworker", "arai-phone", "doctor-nakamura"],
  objectives: [
    { id: "morning-call", label: "Understand the clinic callback" },
    { id: "commute", label: "Handle a commute notice" },
    { id: "work-order", label: "Prioritize a multi-part work request" },
    { id: "phone-interrupt", label: "Handle a work-hour phone call" },
    { id: "deadline", label: "Report an incomplete deadline honestly" },
    { id: "n2-message", label: "Interpret an internal correction notice" },
    { id: "wrap", label: "Close the day with your manager" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa: "日本語だけで、一日を乗り切れるか？朝から夜まで、社会生活の本番だ。",
      promptEn:
        "Boss challenge: Can you get through one day in Japanese alone?\n\nMorning clinic call, commute surprise, office pressure, phone interrupt, honest status, and a denser message — Confidence starts at 5.",
      costsConfidence: false,
    },

    // ── Morning · Clinic callback ────────────────────────────────────
    {
      id: "morning-clinic-call",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa: "朝、クリニックから電話が来ました。内容は？",
      listenText:
        "先日受診された件ですが、検査結果に問題はありませんでした。処方薬は指示どおりお飲みください。",
      listenReading:
        "せんじつ じゅしん された けん です が、けんさ けっか に もんだい は ありません でした。しょほうやく は しじ どおり おのみ ください。",
      skillHint: "listening",
      vocabHint: "検査結果",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint: "問題はありません = no problems. 処方薬 = prescribed medicine.",
      choices: [
        {
          id: "a",
          labelJa:
            "検査結果は問題なし。薬は指示どおり飲む。",
          correct: true,
          feedbackCorrect:
            "✅ Clear morning news: results OK + keep taking the medicine as directed.",
        },
        {
          id: "b",
          labelJa: "すぐ再診に来るように言われた。",
          correct: false,
          feedbackWrong: "❌ No urgent return visit was requested.",
        },
        {
          id: "c",
          labelJa: "保険証の再発行が必要だと言われた。",
          correct: false,
          feedbackWrong: "❌ Not about insurance reissue.",
        },
        {
          id: "d",
          labelJa: "会議資料を共有してほしいと言われた。",
          correct: false,
          feedbackWrong: "❌ That’s office talk — this is the clinic.",
        },
      ],
    },

    // ── Commute ──────────────────────────────────────────────────────
    {
      id: "commute-notice",
      kind: "listening",
      objectiveType: "listening",
      promptJa: "駅の掲示・放送です。予定はどう変わりますか。",
      listenText:
        "さくら線は遅延のため、到着まで約15分ほど余分にお時間がかかります。余裕をもってお越しください。",
      listenReading:
        "さくらせん は ちえん のため、とうちゃく まで やく じゅうごふん ほど よぶん に おじかん が かかります。よゆう を もって おこし ください。",
      skillHint: "listening",
      vocabHint: "遅延",
      speech: {
        karaokeMode: "after-answer",
        announcement: true,
        autoPlay: true,
      },
      helpHint: "遅延 = delay. 余裕をもって = leave extra time / don’t cut it close.",
      choices: [
        {
          id: "a",
          labelJa: "約15分遅れそうなので、余裕を見て向かう。",
          correct: true,
          feedbackCorrect:
            "✅ Delay ~15 minutes — leave earlier margin, don’t rush blindly.",
        },
        {
          id: "b",
          labelJa: "全線運休なので在宅する。",
          correct: false,
          feedbackWrong: "❌ Delay, not a full suspension.",
        },
        {
          id: "c",
          labelJa: "快速が増便されたので早く着く。",
          correct: false,
          feedbackWrong: "❌ Extra time needed — not faster service.",
        },
        {
          id: "d",
          labelJa: "クリニックの予約がキャンセルされた。",
          correct: false,
          feedbackWrong: "❌ Commute notice, not a clinic booking change.",
        },
      ],
    },

    // ── Work · multi-part + priority ─────────────────────────────────
    {
      id: "work-priority",
      kind: "listening",
      objectiveType: "listening",
      npcId: "suzuki-manager",
      promptJa: "鈴木さんからの指示です。いちばん先に何をしますか。",
      listenText:
        "朝一で昨日の数字を確認してから、修正版を共有してください。そのあとで午後の会議用のメモを用意してもらえますか。確認が先です。",
      listenReading:
        "あさいち で きのう の すうじ を かくにん して から、しゅうせいばん を きょうゆう して ください。そのあと で ごご の かいぎよう の メモ を ようい して もらえます か。かくにん が さき です。",
      skillHint: "listening",
      vocabHint: "確認が先",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint: "Order matters: confirm → share corrected version → then prep meeting notes.",
      choices: [
        {
          id: "a",
          labelJa: "まず昨日の数字を確認する。",
          correct: true,
          feedbackCorrect:
            "✅ 「確認が先」— confirm numbers before sharing or writing notes.",
        },
        {
          id: "b",
          labelJa: "先に会議メモを全部書く。",
          correct: false,
          feedbackWrong: "❌ Notes come after confirm + share.",
        },
        {
          id: "c",
          labelJa: "確認せずに古いファイルを共有する。",
          correct: false,
          feedbackWrong: "❌ Never share before confirming.",
        },
        {
          id: "d",
          labelJa: "電話を切って帰宅する。",
          correct: false,
          feedbackWrong: "❌ Work just started.",
        },
      ],
    },

    // ── Afternoon phone interrupt ────────────────────────────────────
    {
      id: "afternoon-phone",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa: "作業中に電話。用件は何ですか。",
      listenText:
        "お疲れさまです。先日の再診枠の件で、念のため日時の最終確認をさせてください。",
      listenReading:
        "おつかれさま です。せんじつ の さいしんわく の けん で、ねんのため にちじ の さいしゅうかくにん を させて ください。",
      skillHint: "listening",
      vocabHint: "最終確認",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint: "最終確認 = final confirmation of date/time.",
      choices: [
        {
          id: "a",
          labelJa: "再診の日時を最終確認したい。",
          correct: true,
          feedbackCorrect: "✅ Purpose: final check of the follow-up slot.",
        },
        {
          id: "b",
          labelJa: "新しい仕事の面接をしたい。",
          correct: false,
          feedbackWrong: "❌ Clinic appointment follow-up, not a job interview.",
        },
        {
          id: "c",
          labelJa: "資料の共有リンクを送りたい。",
          correct: false,
          feedbackWrong: "❌ Not about file sharing.",
        },
        {
          id: "d",
          labelJa: "クレームを伝えたい。",
          correct: false,
          feedbackWrong: "❌ Tone is confirmation, not a complaint.",
        },
      ],
    },
    {
      id: "phone-repeat-or-confirm",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "arai-phone",
      promptJa:
        "木曜日の午後3時のままで変更はございません。…すみません、少し早口でした。",
      promptReading:
        "もくようび の ごご さんじ の まま で へんこう は ございません。…すみません、すこし はやくち でした。",
      promptEn: "You almost missed the day/time. Best recovery?",
      skillHint: "politeness",
      vocabHint: "もう一度お願いできますか",
      helpHint: "Ask for repetition, then confirm — don’t bluff.",
      choices: [
        {
          id: "a",
          labelJa:
            "恐れ入りますが、もう一度お願いできますか。木曜日の午後3時で変更なし、ということでよろしいでしょうか。",
          labelEn:
            "Sorry — could you say that again? So Thursday 3 p.m. with no change, correct?",
          correct: true,
          feedbackCorrect:
            "✅ Repeat request + confirmation phrase — real phone fluency.",
        },
        {
          id: "b",
          labelJa: "はい、わかりました。",
          labelEn: "Yes, understood.",
          correct: false,
          feedbackWrong: "❌ You nearly missed it — confirm the slot.",
        },
        {
          id: "c",
          labelJa: "全部終わりました。問題ありません。",
          labelEn: "Everything’s finished. No problems.",
          correct: false,
          feedbackWrong: "❌ Wrong script for a booking confirmation.",
        },
        {
          id: "d",
          labelJa: "じゃあ切るね。",
          labelEn: "Gonna hang up.",
          correct: false,
          feedbackWrong: "❌ Rude and incomplete.",
        },
      ],
    },

    // ── Office problem · honest deadline ─────────────────────────────
    {
      id: "deadline-honesty",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "suzuki-manager",
      promptJa: "会議まであと少しですが、数字の確認は終わりましたか。",
      promptReading:
        "かいぎ まで あと すこし です が、すうじ の かくにん は おわりました か。",
      promptEn: "You’re not finished. Report realistically.",
      skillHint: "politeness",
      vocabHint: "申し訳ありません",
      helpHint: "Honest ETA beats fake completion.",
      choices: [
        {
          id: "a",
          labelJa:
            "申し訳ありません。まだ確認が終わっていませんが、4時までには終わる予定です。",
          labelEn:
            "I’m sorry — confirmation isn’t finished yet, but I plan to finish by 4.",
          correct: true,
          feedbackCorrect:
            "✅ Apology + honest status + ETA. Do not pretend you’re done.",
        },
        {
          id: "b",
          labelJa: "はい、全部確認済みです。",
          labelEn: "Yes, everything’s already confirmed.",
          correct: false,
          feedbackWrong: "❌ Rewarding a lie would wreck the meeting.",
        },
        {
          id: "c",
          labelJa: "知りません。誰かやってください。",
          labelEn: "No idea. Someone else should do it.",
          correct: false,
          feedbackWrong: "❌ Own the task and give a plan.",
        },
        {
          id: "d",
          labelJa: "薬を飲んで安静にします。",
          labelEn: "I’ll take medicine and rest.",
          correct: false,
          feedbackWrong: "❌ Clinic advice — wrong moment.",
        },
      ],
    },

    // ── Final N2-ish internal message ────────────────────────────────
    {
      id: "n2-internal-message",
      kind: "reading",
      objectiveType: "reading",
      promptJa: "社内メッセージです。あなたはどうしますか。",
      promptReading: "しゃない メッセージ です。あなた は どう します か。",
      bodyJa:
        "お疲れさまです。先ほど共有した資料ですが、一部数字に誤りが見つかったため、現在修正しています。会議開始までには差し替える予定ですので、古いファイルは使用しないようお願いいたします。",
      promptEn: "What should you do?",
      skillHint: "reading",
      vocabHint: "差し替える",
      helpHint:
        "差し替える = replace (the file). 古いファイルは使用しない = don’t use the old file.",
      speech: { karaokeMode: "after-answer", autoPlay: false },
      choices: [
        {
          id: "a",
          labelJa:
            "古いファイルは使わず、会議前に差し替えられる修正版を待つ／使う。",
          correct: true,
          feedbackCorrect:
            "✅ Don’t use the old file; a corrected version will replace it before the meeting.",
        },
        {
          id: "b",
          labelJa: "古いファイルのまま会議で説明する。",
          correct: false,
          feedbackWrong: "❌ Explicitly asked not to use the old file.",
        },
        {
          id: "c",
          labelJa: "メッセージを無視して帰宅する。",
          correct: false,
          feedbackWrong: "❌ You need the corrected materials for the meeting.",
        },
        {
          id: "d",
          labelJa: "クリニックに再診予約を取り直す。",
          correct: false,
          feedbackWrong: "❌ Internal document notice — not medical.",
        },
      ],
    },

    // ── Wrap with manager ────────────────────────────────────────────
    {
      id: "day-wrap",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "suzuki-manager",
      promptJa:
        "今日は大変でしたね。最初は分からないことも多いと思いますが、確認しながら進めれば大丈夫ですよ。",
      promptReading:
        "きょう は たいへん でした ね。さいしょ は わからない こと も おおい と おもいます が、かくにん しながら すすめれば だいじょうぶ です よ。",
      promptEn: "Choose a natural closing response.",
      skillHint: "conversation",
      vocabHint: "確認しながら",
      helpHint: "Thank them and commit to checking when unsure.",
      choices: [
        {
          id: "a",
          labelJa:
            "ありがとうございます。これからも分からないことがあれば確認するようにします。",
          labelEn:
            "Thank you. I’ll keep checking whenever something isn’t clear.",
          correct: true,
          feedbackCorrect:
            "✅ Grateful + growth mindset. Matches Chapter 2’s core lesson.",
        },
        {
          id: "b",
          labelJa: "もう全部分かってます。問題ないです。",
          labelEn: "I already understand everything. No issues.",
          correct: false,
          feedbackWrong: "❌ Overconfident — the point is to keep confirming.",
        },
        {
          id: "c",
          labelJa: "はい、ポイントカードはあります。",
          labelEn: "Yes, I have a point card.",
          correct: false,
          feedbackWrong: "❌ Konbini leftover.",
        },
        {
          id: "d",
          labelJa: "運転見合わせですので諦めます。",
          labelEn: "Service is suspended, so I’ll give up.",
          correct: false,
          feedbackWrong: "❌ Station phrasing — wrong register and mood.",
        },
      ],
    },

    {
      id: "outro",
      kind: "outro",
      promptJa:
        "社会生活チャレンジ、クリア。確認する力で一日を乗り越えた。次は人間関係の章へ——近日公開。",
      promptEn:
        "Chapter 2 clear. You survived a full social day by listening, confirming, and staying honest.\n\nComing next: 第3章・人間関係 — Work, Friends & Relationships.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 350,
    replayXp: 35,
    skillRewards: {
      conversation: 5,
      listening: 5,
      politeness: 5,
      reading: 4,
      grammar: 3,
      vocabulary: 3,
    },
    replaySkillRewards: {
      conversation: 1,
      listening: 1,
      politeness: 1,
    },
    unlockQuestIds: [],
    nextQuestTeaser: {
      id: "chapter-3-teaser",
      title: "Work, Friends & Relationships",
      japaneseTitle: "第3章・人間関係",
    },
  },
  unlocks: {
    questIds: [],
  },
};
