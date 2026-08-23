import type {
  StyleNaturalness,
  StylePoliteness,
  StyleRelationship,
  StyleSpeaker,
  StyleStrength,
} from "../../../types/speechStyle";

export const STRENGTH_LABELS: Record<StyleStrength, string> = {
  "strongly-feminine": "Strongly feminine",
  "somewhat-feminine": "Somewhat feminine",
  neutral: "Neutral",
  "somewhat-masculine": "Somewhat masculine",
  "strongly-masculine": "Strongly masculine",
};

export const POLITENESS_LABELS: Record<StylePoliteness, string> = {
  formal: "Formal",
  polite: "Polite",
  casual: "Casual",
  "very-casual": "Very casual",
  rough: "Rough",
};

export const NATURALNESS_LABELS: Record<StyleNaturalness, string> = {
  "very-common": "Very common",
  common: "Common",
  situational: "Situational",
  "old-fashioned": "Old-fashioned",
  "anime-drama": "Anime / drama",
  rough: "Rough",
};

export const SPEAKER_LABELS: Record<StyleSpeaker, string> = {
  "young-woman": "Young woman",
  "adult-woman": "Adult woman",
  "young-man": "Young man",
  "adult-man": "Adult man",
  "older-speaker": "Older speaker",
  anyone: "Anyone",
};

export const RELATIONSHIP_LABELS: Record<StyleRelationship, string> = {
  stranger: "Stranger",
  coworker: "Coworker",
  friend: "Friend",
  "close-friend": "Close friend",
  partner: "Partner",
  family: "Family",
};
