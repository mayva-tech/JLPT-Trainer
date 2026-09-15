import type { QuestDefinition } from "../../types";

/**
 * Chapter 2 · Phone
 * 電話で問い合わせ — Handle a Phone Inquiry
 *
 * Harder than the clinic: no visual context. Listening-first steps hide
 * English meaning until after the answer.
 */
export const PHONE_CALL_QUEST: QuestDefinition = {
  id: "phone-call",
  title: "Handle a Phone Inquiry",
  japaneseTitle: "電話で問い合わせ",
  locationId: "phone-center",
  chapter: 2,
  description:
    "Confirm a clinic follow-up appointment by phone. Formal support Japanese, polite recovery when you miss something, and careful confirmation of day and time.",
  difficulty: "hard",
  recommendedLevel: 5,
  startingConfidence: 5,
  requiresQuestIds: ["clinic-visit"],
  icon: "📞",
  meetNpcIds: ["arai-phone"],
  objectives: [
    { id: "open", label: "State your inquiry purpose" },
    { id: "repeat", label: "Politely ask for repetition" },
    { id: "wait", label: "Handle “please wait”" },
    { id: "confirm-time", label: "Confirm day and time" },
    { id: "acknowledge", label: "Acknowledge the booking" },
  ],
  steps: [
    {
      id: "intro",
      kind: "intro",
      promptJa:
        "クリニックの再診予約を電話で確認します。画面は見えません。耳と丁寧さが頼りです。",
      promptEn:
        "You need to confirm a follow-up appointment at the clinic by phone.\n\nNo visual cues this time — listen carefully, stay polite, and confirm details.",
      costsConfidence: false,
    },
    {
      id: "staff-greeting",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa: "電話の最初の一言を聞いてください。相手は誰ですか。",
      // Listening-first: no English giveaway of the spoken line.
      listenText: "お電話ありがとうございます。ことばクリニック予約係の新井です。",
      listenReading:
        "おでんわ ありがとう ございます。ことば クリニック よやくがかり の あらい です。",
      skillHint: "listening",
      vocabHint: "お電話ありがとうございます",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint: "電話応対の定番挨拶。会社名・部署・名前の順が多い。",
      choices: [
        {
          id: "a",
          labelJa: "ことばクリニックの予約係・新井さんだ。",
          correct: true,
          feedbackCorrect:
            "✅ Formal phone opening: thanks → clinic → role → name.",
        },
        {
          id: "b",
          labelJa: "カフェ琴の葉のケンだ。",
          correct: false,
          feedbackWrong: "❌ Wrong workplace — listen for クリニック.",
        },
        {
          id: "c",
          labelJa: "市役所の田中さんだ。",
          correct: false,
          feedbackWrong: "❌ Not City Hall.",
        },
        {
          id: "d",
          labelJa: "駅の山本さんだ。",
          correct: false,
          feedbackWrong: "❌ Not the station.",
        },
      ],
    },
    {
      id: "state-purpose",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "arai-phone",
      promptJa: "かしこまりました。どのようなご用件でしょうか。",
      promptReading: "かしこまりました。どの ような ごようけん でしょう か。",
      promptEn: "State why you’re calling — about your follow-up appointment.",
      skillHint: "politeness",
      vocabHint: "お伺いしたいんですが",
      helpHint:
        "「〜についてお伺いしたいんですが」is a soft phone inquiry opener.",
      choices: [
        {
          id: "a",
          labelJa: "再診の予約についてお伺いしたいんですが。",
          labelEn: "I’d like to ask about my follow-up appointment.",
          correct: true,
          feedbackCorrect:
            "✅ Soft purpose with 「お伺いしたいんですが」.",
        },
        {
          id: "b",
          labelJa: "熱があって、のどが痛いです。",
          labelEn: "I have a fever and a sore throat.",
          correct: false,
          feedbackWrong:
            "❌ Symptom talk for the doctor — here you’re calling about a booking.",
        },
        {
          id: "c",
          labelJa: "袋ください。",
          labelEn: "A bag, please.",
          correct: false,
          feedbackWrong: "❌ Konbini Japanese.",
        },
        {
          id: "d",
          labelJa: "はい、わかりました。",
          labelEn: "Yes, understood.",
          correct: false,
          feedbackWrong: "❌ You haven’t stated your purpose yet.",
        },
      ],
    },
    {
      id: "missed-detail",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa:
        "スタッフが少し速く話しました。聞き取れなかったとき、いちばん良い返答は？",
      listenText:
        "それでは、来週木曜日の午後三時枠で、中村先生の再診でお取りできますが、そのままでよろしいでしょうか。",
      listenReading:
        "それでは、らいしゅう もくようび の ごご さんじ わく で、なかむらせんせい の さいしん で おとり できます が、そのまま で よろしい でしょう か。",
      skillHint: "politeness",
      vocabHint: "恐れ入りますが",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint:
        "Real fluency includes recovery: politely ask to hear it again.",
      choices: [
        {
          id: "a",
          labelJa: "恐れ入りますが、もう一度お願いできますか。",
          correct: true,
          feedbackCorrect:
            "✅ Perfect recovery.\n\nAsking for repetition is a skill — not a failure.",
        },
        {
          id: "b",
          labelJa: "はい、わかりました。",
          correct: false,
          feedbackWrong:
            "❌ Bluffing when you didn’t catch the details risks the wrong booking.",
        },
        {
          id: "c",
          labelJa: "運転見合わせですので諦めます。",
          correct: false,
          feedbackWrong: "❌ Station announcement language — hang up politely instead… by asking again.",
        },
        {
          id: "d",
          labelJa: "じゃあ切るね。",
          correct: false,
          feedbackWrong: "❌ Too abrupt and rude for a formal call.",
        },
      ],
    },
    {
      id: "please-wait",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "arai-phone",
      promptJa: "少々お待ちください。確認いたします。",
      promptReading: "しょうしょう おまち ください。かくにん いたします。",
      promptEn: "Staff asks you to wait while they check. What’s a natural reply?",
      skillHint: "politeness",
      vocabHint: "少々お待ちください",
      helpHint: "「はい、お願いします」or a soft acknowledgment works.",
      choices: [
        {
          id: "a",
          labelJa: "はい、お願いします。",
          labelEn: "Yes, please.",
          correct: true,
          feedbackCorrect: "✅ Short and polite while they confirm.",
        },
        {
          id: "b",
          labelJa: "急いでください。今すぐです。",
          labelEn: "Hurry — right now.",
          correct: false,
          feedbackWrong: "❌ Too pushy for a support call.",
        },
        {
          id: "c",
          labelJa: "今日、受診したいんですが。",
          labelEn: "I’d like to be seen today.",
          correct: false,
          feedbackWrong: "❌ You’re already mid-call about a booking.",
        },
        {
          id: "d",
          labelJa: "ポイントカードはありますか。",
          labelEn: "Do you have a point card?",
          correct: false,
          feedbackWrong: "❌ Wrong script entirely.",
        },
      ],
    },
    {
      id: "confirm-slot",
      kind: "listening",
      objectiveType: "listening",
      npcId: "arai-phone",
      promptJa: "確認の一文を聞いてください。予約はいつですか。",
      listenText: "では、木曜日の午後3時ということでよろしいでしょうか。",
      listenReading:
        "では、もくようび の ごご さんじ という こと で よろしい でしょう か。",
      skillHint: "listening",
      vocabHint: "ということでよろしいでしょうか",
      speech: { karaokeMode: "after-answer", autoPlay: true },
      helpHint:
        "「〜ということでよろしいでしょうか」confirms a shared understanding.",
      choices: [
        {
          id: "a",
          labelJa: "木曜日の午後3時で合っているか確認している。",
          correct: true,
          feedbackCorrect:
            "✅ Day + time locked: 木曜日の午後3時.",
        },
        {
          id: "b",
          labelJa: "月曜日の朝9時に変更したいと言っている。",
          correct: false,
          feedbackWrong: "❌ They’re confirming Thursday 3 p.m., not Monday morning.",
        },
        {
          id: "c",
          labelJa: "予約をキャンセルすると言っている。",
          correct: false,
          feedbackWrong: "❌ This is confirmation, not cancellation.",
        },
        {
          id: "d",
          labelJa: "薬を三日分出すと言っている。",
          correct: false,
          feedbackWrong: "❌ Doctor’s instruction — not this phone line.",
        },
      ],
    },
    {
      id: "acknowledge",
      kind: "dialogue",
      objectiveType: "dialogue",
      npcId: "arai-phone",
      promptJa: "木曜日の午後3時でお取りしました。",
      promptReading: "もくようび の ごご さんじ で おとり しました。",
      promptEn: "Confirm you understand the booked slot.",
      skillHint: "politeness",
      vocabHint: "承知しました",
      helpHint: "「承知しました」is formal acknowledgment on the phone.",
      choices: [
        {
          id: "a",
          labelJa: "承知しました。木曜日の午後3時ですね。念のため確認させてください。",
          labelEn:
            "Understood. Thursday at 3 p.m., yes? Let me confirm once more.",
          correct: true,
          feedbackCorrect:
            "✅ 「承知しました」+ restating day/time + 念のため確認 — excellent phone manners.",
        },
        {
          id: "b",
          labelJa: "うん、わかった。じゃあね。",
          labelEn: "Yeah, got it. Bye.",
          correct: false,
          feedbackWrong: "❌ Too casual for clinic support.",
        },
        {
          id: "c",
          labelJa: "はい、わかりました。（日時は言わない）",
          labelEn: "Yes, understood — without repeating the time.",
          correct: false,
          feedbackWrong:
            "❌ Better to restate 木曜日の午後3時 so both sides match.",
        },
        {
          id: "d",
          labelJa: "まだ終わっていませんが、4時までには終わる予定です。",
          labelEn: "It’s not finished yet, but I plan to finish by 4.",
          correct: false,
          feedbackWrong: "❌ Workplace progress report — wrong context.",
        },
      ],
    },
    {
      id: "outro",
      kind: "outro",
      promptJa:
        "電話、おつかれさま。聞き返しと確認ができれば、通話は怖くない。次は職場だ。",
      promptEn:
        "Phone inquiry clear. Asking for repetition and confirming details are real skills.\n\nNext: your first day at the office.",
      costsConfidence: false,
    },
  ],
  rewards: {
    xp: 210,
    replayXp: 25,
    skillRewards: {
      listening: 5,
      politeness: 4,
      conversation: 3,
      vocabulary: 2,
    },
    replaySkillRewards: {
      listening: 1,
      politeness: 1,
    },
    unlockLocationIds: ["office"],
    unlockQuestIds: ["first-day-office"],
    nextQuestTeaser: {
      id: "first-day-office",
      title: "First Day at Work",
      japaneseTitle: "職場での一日",
    },
  },
  unlocks: {
    locationIds: ["office"],
    questIds: ["first-day-office"],
  },
};
