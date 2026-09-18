export type PassportAchievementId =
  | "konbini-master"
  | "transfer-success"
  | "city-hall-survivor"
  | "phone-fear-cleared"
  | "no-subtitle-clear"
  | "first-week-hero"
  | "repair-ace"
  | "clinic-checkin"
  | "read-the-room"
  | "graceful-refusal"
  | "senpai-survivor"
  | "hourensou-master"
  | "business-phone-survivor"
  | "owned-the-mistake"
  | "spoke-up-meeting"
  | "no-subtitles-ch5"
  | "got-it-first-try"
  | "reduction-master"
  | "read-the-context";

export type PassportAchievement = {
  id: PassportAchievementId;
  japaneseName: string;
  englishName: string;
  description: string;
  /** Quest id that unlocks this when completed (optional). */
  requireQuestId?: string;
  /** Flag name that unlocks this. */
  requireFlag?: string;
};

export const PASSPORT_ACHIEVEMENTS: readonly PassportAchievement[] = [
  {
    id: "konbini-master",
    japaneseName: "コンビニマスター",
    englishName: "Konbini Master",
    description: "Cleared your first convenience-store mission.",
    requireQuestId: "convenience-first-shop",
  },
  {
    id: "transfer-success",
    japaneseName: "乗り換え成功",
    englishName: "Transfer Success",
    description: "Navigated the station without getting lost.",
    requireQuestId: "station-master",
  },
  {
    id: "city-hall-survivor",
    japaneseName: "市役所サバイバー",
    englishName: "City Hall Survivor",
    description: "Filed your 転入届 and lived to tell the tale.",
    requireQuestId: "city-hall-register",
  },
  {
    id: "phone-fear-cleared",
    japaneseName: "電話恐怖症克服",
    englishName: "Phone Fear Cleared",
    description: "Survived a Japanese phone call.",
    requireQuestId: "phone-call",
  },
  {
    id: "no-subtitle-clear",
    japaneseName: "字幕なしクリア",
    englishName: "No-Subtitle Clear",
    description: "Finished a mission with Immersion Mode (no English).",
    requireFlag: "achievement:no-subtitle-clear",
  },
  {
    id: "first-week-hero",
    japaneseName: "初週ヒーロー",
    englishName: "First Week Hero",
    description: "Cleared the Chapter 1 communication boss.",
    requireQuestId: "first-week-challenge",
  },
  {
    id: "repair-ace",
    japaneseName: "修復マスター",
    englishName: "Repair Ace",
    description: "Successfully repaired a conversation mid-mission.",
    requireFlag: "achievement:repair-ace",
  },
  {
    id: "clinic-checkin",
    japaneseName: "クリニック初診",
    englishName: "Clinic Check-in",
    description: "Completed your first clinic visit.",
    requireQuestId: "clinic-visit",
  },
  {
    id: "read-the-room",
    japaneseName: "空気読めた",
    englishName: "Read the Room",
    description: "Cleared the Chapter 3 Social Intelligence Challenge.",
    requireQuestId: "relationships-challenge",
  },
  {
    id: "graceful-refusal",
    japaneseName: "いい断り方",
    englishName: "Graceful Refusal",
    description: "Practiced soft refusal with Ken.",
    requireQuestId: "saying-no",
  },
  {
    id: "senpai-survivor",
    japaneseName: "先輩との会話",
    englishName: "Senpai Survivor",
    description: "Asked Sato-senpai for help without sounding bossy.",
    requireQuestId: "senpai-favor",
  },
  {
    id: "hourensou-master",
    japaneseName: "報連相マスター",
    englishName: "Clear Reporting",
    description: "Reported status to your boss with a clear conclusion.",
    requireQuestId: "reporting-to-boss",
  },
  {
    id: "business-phone-survivor",
    japaneseName: "電話対応クリア",
    englishName: "Business Phone Survivor",
    description: "Handled an external business phone call.",
    requireQuestId: "business-phone",
  },
  {
    id: "owned-the-mistake",
    japaneseName: "ミス報告できた",
    englishName: "Owned the Mistake",
    description: "Reported a workplace mistake with recovery steps.",
    requireQuestId: "report-mistake",
  },
  {
    id: "spoke-up-meeting",
    japaneseName: "会議で発言",
    englishName: "Spoke Up in the Meeting",
    description: "Disagreed politely and suggested an alternative in a meeting.",
    requireQuestId: "meeting-speak",
  },
  {
    id: "no-subtitles-ch5",
    japaneseName: "字幕なし",
    englishName: "No Subtitles",
    description: "Cleared a Chapter 5 mission with Immersion / no English assist.",
    requireFlag: "achievement:no-subtitles-ch5",
  },
  {
    id: "got-it-first-try",
    japaneseName: "一発で聞けた",
    englishName: "Got It First Try",
    description: "Hit perfect first-listen on a Chapter 5 listening mission.",
    requireFlag: "achievement:got-it-first-try",
  },
  {
    id: "reduction-master",
    japaneseName: "省略マスター",
    englishName: "Reduction Master",
    description: "Cleared Contraction City and recognized everyday reductions.",
    requireQuestId: "contraction-city",
  },
  {
    id: "read-the-context",
    japaneseName: "空気でわかった",
    englishName: "Read the Context",
    description: "Cleared Read Between the Lines.",
    requireQuestId: "read-between-lines",
  },
] as const;
