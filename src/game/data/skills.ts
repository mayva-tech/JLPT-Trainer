export type SkillGroupId =
  | "listening"
  | "conversation"
  | "grammar"
  | "vocabulary";

export type SkillNodeId =
  | "listening-basic"
  | "listening-casual"
  | "listening-fast"
  | "listening-reduced"
  | "listening-native"
  | "conv-basic"
  | "conv-fillers"
  | "conv-repair"
  | "conv-polite"
  | "conv-keigo"
  | "grammar-n3"
  | "grammar-n2-everyday"
  | "grammar-n2-nuance"
  | "grammar-advanced"
  | "vocab-daily"
  | "vocab-transport"
  | "vocab-gov"
  | "vocab-work"
  | "vocab-social";

export type SkillNode = {
  id: SkillNodeId;
  group: SkillGroupId;
  japaneseName: string;
  englishName: string;
  description: string;
  /** Quests completed required to unlock. */
  requiresQuests: number;
  /** Optional prior skill node. */
  requiresNode?: SkillNodeId;
  /** Gameplay effect flag consumed by QuestRunner / UI. */
  effect?: "extra-repair" | "hide-en-bonus" | "listening-assist";
};

export const SKILL_NODES: readonly SkillNode[] = [
  {
    id: "listening-basic",
    group: "listening",
    japaneseName: "基礎リスニング",
    englishName: "Basic Listening",
    description: "Follow clear counter Japanese.",
    requiresQuests: 0,
  },
  {
    id: "listening-casual",
    group: "listening",
    japaneseName: "カジュアル聞き取り",
    englishName: "Casual Speech",
    description: "Neighbor and café speech patterns.",
    requiresQuests: 2,
    requiresNode: "listening-basic",
  },
  {
    id: "listening-fast",
    group: "listening",
    japaneseName: "速い発話",
    englishName: "Fast Speech",
    description: "Station announcements and rushed clerks.",
    requiresQuests: 4,
    requiresNode: "listening-casual",
    effect: "listening-assist",
  },
  {
    id: "listening-reduced",
    group: "listening",
    japaneseName: "縮約形",
    englishName: "Reduced Sounds",
    description: "Catch ちゃう / てる forms in the wild.",
    requiresQuests: 8,
    requiresNode: "listening-fast",
  },
  {
    id: "listening-native",
    group: "listening",
    japaneseName: "ネイティブ速度",
    englishName: "Native Speed",
    description: "Comfort with full-speed dialogue.",
    requiresQuests: 14,
    requiresNode: "listening-reduced",
  },
  {
    id: "conv-basic",
    group: "conversation",
    japaneseName: "基本応答",
    englishName: "Basic Response",
    description: "はい / お願いします / すみません.",
    requiresQuests: 0,
  },
  {
    id: "conv-fillers",
    group: "conversation",
    japaneseName: "つなぎ言葉",
    englishName: "Natural Fillers",
    description: "えっと、そうですね — buy thinking time.",
    requiresQuests: 2,
    requiresNode: "conv-basic",
  },
  {
    id: "conv-repair",
    group: "conversation",
    japaneseName: "会話修復",
    englishName: "Conversation Repair",
    description: "One extra Try again after a miss.",
    requiresQuests: 3,
    requiresNode: "conv-fillers",
    effect: "extra-repair",
  },
  {
    id: "conv-polite",
    group: "conversation",
    japaneseName: "丁寧語",
    englishName: "Polite Japanese",
    description: "Counter and clinic です/ます.",
    requiresQuests: 5,
    requiresNode: "conv-repair",
  },
  {
    id: "conv-keigo",
    group: "conversation",
    japaneseName: "敬語",
    englishName: "Keigo",
    description: "City Hall and phone support formality.",
    requiresQuests: 10,
    requiresNode: "conv-polite",
  },
  {
    id: "grammar-n3",
    group: "grammar",
    japaneseName: "N3基礎",
    englishName: "N3 Foundation",
    description: "たい / てください / から.",
    requiresQuests: 1,
  },
  {
    id: "grammar-n2-everyday",
    group: "grammar",
    japaneseName: "N2日常",
    englishName: "N2 Everyday Grammar",
    description: "ていただけますか / わけです.",
    requiresQuests: 4,
    requiresNode: "grammar-n3",
  },
  {
    id: "grammar-n2-nuance",
    group: "grammar",
    japaneseName: "N2ニュアンス",
    englishName: "N2 Nuance",
    description: "せっかく / わけではない.",
    requiresQuests: 8,
    requiresNode: "grammar-n2-everyday",
  },
  {
    id: "grammar-advanced",
    group: "grammar",
    japaneseName: "上級表現",
    englishName: "Advanced Expression",
    description: "Workplace hedging and soft refusals.",
    requiresQuests: 12,
    requiresNode: "grammar-n2-nuance",
  },
  {
    id: "vocab-daily",
    group: "vocabulary",
    japaneseName: "日常生活",
    englishName: "Daily Life",
    description: "Konbini, bags, heating, receipts.",
    requiresQuests: 0,
  },
  {
    id: "vocab-transport",
    group: "vocabulary",
    japaneseName: "交通",
    englishName: "Transportation",
    description: "改札、乗り換え、遅延.",
    requiresQuests: 3,
    requiresNode: "vocab-daily",
  },
  {
    id: "vocab-gov",
    group: "vocabulary",
    japaneseName: "役所",
    englishName: "Government / City Hall",
    description: "転入届、記入、提出.",
    requiresQuests: 1,
    requiresNode: "vocab-daily",
  },
  {
    id: "vocab-work",
    group: "vocabulary",
    japaneseName: "職場",
    englishName: "Workplace",
    description: "共有、確認、予定.",
    requiresQuests: 8,
    requiresNode: "vocab-gov",
  },
  {
    id: "vocab-social",
    group: "vocabulary",
    japaneseName: "社会会話",
    englishName: "Social Conversation",
    description: "Neighbors, invitations, small talk.",
    requiresQuests: 5,
    requiresNode: "vocab-daily",
  },
] as const;

export const SKILL_GROUP_LABELS: Record<
  SkillGroupId,
  { ja: string; en: string }
> = {
  listening: { ja: "リスニング", en: "Listening" },
  conversation: { ja: "会話", en: "Speaking / Conversation" },
  grammar: { ja: "文法", en: "Grammar" },
  vocabulary: { ja: "語彙", en: "Vocabulary" },
};
