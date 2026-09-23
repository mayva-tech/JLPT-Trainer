import type { QuestDefinition } from "../../types";

/**
 * Chapter 2 · Boss
 * 社会生活チャレンジ — Social Life Challenge
 *
 * Correct answer positions (0-based): 0, 2, 1, 0, 2, 1, 2, 0
 */
export const SOCIAL_LIFE_CHALLENGE_QUEST: QuestDefinition = {
  id: "social-life-challenge",
  title: "Social Life Challenge",
  japaneseTitle: "社会生活チャレンジ",
  japaneseTitleReading: "しゃかいせいかつ ちゃれんじ",
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
      promptReading:
        "にほんご だけ で、 いちにち を のりきれる か？あさ から よる まで、 しゃかいせいかつ の ほんばん だ。",
      promptEn:
        "Boss challenge: Can you get through one day in Japanese alone?\n\nMorning clinic call, commute surprise, office pressure, phone interrupt, honest status, and a denser message — Confidence starts at 5.",
      costsConfidence: false,
    },
    {
      id: "morning-clinic-call",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa: "朝、クリニックから電話が来ました。内容は？",
      promptReading: "あさ、 クリニック から でんわ が きました。ないよう は？",
      promptEn: "Morning call from the clinic. What did they say?",
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
          reading: "けんさけっか は もんだい なし。くすり は しじ どおり のむ。",
          labelEn:
            "Test results are fine. Take the medicine as directed.",
          correct: true,
          feedbackCorrect:
            "✅ Clear morning news: results OK + keep taking the medicine as directed.",
        },
        {
          id: "b",
          labelJa: "すぐ再診に来るように言われた。",
          reading: "すぐ さいしん に くる ように いわれた。",
          labelEn: "They told me to come in for a follow-up right away.",
          correct: false,
          feedbackWrong: "❌ No urgent return visit was requested.",
        },
        {
          id: "c",
          labelJa: "保険証の再発行が必要だと言われた。",
          reading: "ほけんしょう の さいはっこう が ひつよう だ と いわれた。",
          labelEn: "They said I need to reissue my insurance card.",
          correct: false,
          feedbackWrong: "❌ Not about insurance reissue.",
        },
      ],
    },
    {
      id: "commute-notice",
      kind: "listening",
      objectiveType: "listening",
      promptJa: "駅の掲示・放送です。予定はどう変わりますか。",
      promptReading: "えき の けいじ・ほうそう です。よてい は どう かわります か。",
      promptEn: "Station notice and announcement. How does your plan change?",
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
          labelJa: "全線運休なので在宅する。",
          reading: "ぜんせん うんきゅう な ので ざいたく する。",
          labelEn: "All lines are suspended, so I’ll work from home.",
          correct: false,
          feedbackWrong: "❌ Delay, not a full suspension.",
        },
        {
          id: "b",
          labelJa: "快速が増便されたので早く着く。",
          reading: "かいそく が ぞうびん された ので はやく つく。",
          labelEn: "More express trains, so I’ll arrive earlier.",
          correct: false,
          feedbackWrong: "❌ Extra time needed — not faster service.",
        },
        {
          id: "c",
          labelJa: "約15分遅れそうなので、余裕を見て向かう。",
          reading: "やく じゅうごふん おくれ そう な ので、 よゆう を みて むかう。",
          labelEn: "Looks like about a 15-minute delay, so I’ll leave with extra time.",
          correct: true,
          feedbackCorrect:
            "✅ Delay ~15 minutes — leave earlier margin, don’t rush blindly.",
        },
      ],
    },
    {
      id: "work-priority",
      kind: "listening",
      objectiveType: "listening",
      npcId: "suzuki-manager",
      promptJa: "鈴木さんからの指示です。いちばん先に何をしますか。",
      promptReading:
        "すずきさん から の しじ です。いちばん さき に なに を します か。",
      promptEn: "Instructions from Suzuki. What do you do first?",
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
          labelJa: "先に会議メモを全部書く。",
          reading: "さき に かいぎ メモ を ぜんぶ かく。",
          labelEn: "Write all the meeting notes first.",
          correct: false,
          feedbackWrong: "❌ Notes come after confirm + share.",
        },
        {
          id: "b",
          labelJa: "まず昨日の数字を確認する。",
          reading: "まず きのう の すうじ を かくにん する。",
          labelEn: "First, confirm yesterday’s numbers.",
          correct: true,
          feedbackCorrect:
            "✅ 「確認が先」— confirm numbers before sharing or writing notes.",
        },
        {
          id: "c",
          labelJa: "確認せずに古いファイルを共有する。",
          reading: "かくにん せず に ふるい ファイル を きょうゆう する。",
          labelEn: "Share the old file without checking.",
          correct: false,
          feedbackWrong: "❌ Never share before confirming.",
        },
      ],
    },
    {
      id: "afternoon-phone",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa: "作業中に電話。用件は何ですか。",
      promptReading: "さぎょうちゅう に でんわ。ようけん は なん です か。",
      promptEn: "A call while you’re working. What’s it about?",
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
          reading: "さいしん の にちじ を さいしゅうかくにん したい。",
          labelEn: "They want a final confirmation of the follow-up date and time.",
          correct: true,
          feedbackCorrect: "✅ Purpose: final check of the follow-up slot.",
        },
        {
          id: "b",
          labelJa: "新しい仕事の面接をしたい。",
          reading: "あたらしい しごと の めんせつ を したい。",
          labelEn: "They want to interview you for a new job.",
          correct: false,
          feedbackWrong: "❌ Clinic appointment follow-up, not a job interview.",
        },
        {
          id: "c",
          labelJa: "資料の共有リンクを送りたい。",
          reading: "しりょう の きょうゆう リンク を おくりたい。",
          labelEn: "They want to send a shared link to documents.",
          correct: false,
          feedbackWrong: "❌ Not about file sharing.",
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
          labelJa: "はい、わかりました。",
          labelEn: "Yes, understood.",
          correct: false,
          feedbackWrong: "❌ You nearly missed it — confirm the slot.",
        },
        {
          id: "b",
          labelJa: "全部終わりました。問題ありません。",
          reading: "ぜんぶ おわりました。もんだい ありません。",
          labelEn: "Everything’s finished. No problems.",
          correct: false,
          feedbackWrong: "❌ Wrong script for a booking confirmation.",
        },
        {
          id: "c",
          labelJa:
            "恐れ入りますが、もう一度お願いできますか。木曜日の午後3時で変更なし、ということでよろしいでしょうか。",
          reading:
            "おそれいります が、 もう いちど おねがい できます か。もくようび の ごご さんじ で へんこう なし、 と いう こと で よろしい でしょう か。",
          labelEn:
            "Sorry — could you say that again? So Thursday 3 p.m. with no change, correct?",
          correct: true,
          feedbackCorrect:
            "✅ Repeat request + confirmation phrase — real phone fluency.",
        },
      ],
    },
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
          labelJa: "はい、全部確認済みです。",
          reading: "はい、 ぜんぶ かくにんずみ です。",
          labelEn: "Yes, everything’s already confirmed.",
          correct: false,
          feedbackWrong: "❌ Rewarding a lie would wreck the meeting.",
        },
        {
          id: "b",
          labelJa:
            "申し訳ありません。まだ確認が終わっていませんが、4時までには終わる予定です。",
          reading:
            "もうしわけ ありません。まだ かくにん が おわって いません が、 よじ まで に は おわる よてい です。",
          labelEn:
            "I’m sorry — confirmation isn’t finished yet, but I plan to finish by 4.",
          correct: true,
          feedbackCorrect:
            "✅ Apology + honest status + ETA. Do not pretend you’re done.",
        },
        {
          id: "c",
          labelJa: "知りません。誰かやってください。",
          reading: "しりません。だれ か やって ください。",
          labelEn: "No idea. Someone else should do it.",
          correct: false,
          feedbackWrong: "❌ Own the task and give a plan.",
        },
      ],
    },
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
          labelJa: "古いファイルのまま会議で説明する。",
          reading: "ふるい ファイル の まま かいぎ で せつめい する。",
          labelEn: "Present in the meeting using the old file as-is.",
          correct: false,
          feedbackWrong: "❌ Explicitly asked not to use the old file.",
        },
        {
          id: "b",
          labelJa: "メッセージを無視して帰宅する。",
          reading: "メッセージ を むし して きたく する。",
          labelEn: "Ignore the message and go home.",
          correct: false,
          feedbackWrong: "❌ You need the corrected materials for the meeting.",
        },
        {
          id: "c",
          labelJa:
            "古いファイルは使わず、会議前に差し替えられる修正版を待つ／使う。",
          reading:
            "ふるい ファイル は つかわず、 かいぎまえ に さしかえられる しゅうせいばん を まつ／つかう。",
          labelEn:
            "Don’t use the old file — wait for / use the corrected version before the meeting.",
          correct: true,
          feedbackCorrect:
            "✅ Don’t use the old file; a corrected version will replace it before the meeting.",
        },
      ],
    },
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
          reading:
            "ありがとう ございます。これから も わからない こと が あれば かくにん する ように します。",
          labelEn:
            "Thank you. I’ll keep checking whenever something isn’t clear.",
          correct: true,
          feedbackCorrect:
            "✅ Grateful + growth mindset. Matches Chapter 2’s core lesson.",
        },
        {
          id: "b",
          labelJa: "もう全部分かってます。問題ないです。",
          reading: "もう ぜんぶ わかって ます。もんだい ない です。",
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
      ],
    },
    {
      id: "outro",
      kind: "outro",
      promptJa:
        "社会生活チャレンジ、クリア。確認する力で一日を乗り越えた。次は人間関係の章へ——近日公開。",
      promptReading:
        "しゃかいせいかつ チャレンジ、 クリア。かくにん する ちから で いちにち を のりこえた。つぎ は にんげんかんけい の しょう へ——きんじつ こうかい。",
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
