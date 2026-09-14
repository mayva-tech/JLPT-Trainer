import { PeraPeraQuestApp } from "../../game/pages/PeraPeraQuestApp";

type Props = {
  onOpenTrainer?: () => void;
};

/**
 * Game Mode entry — now the home of ペラペラクエスト (Pera Pera Quest).
 * Classic arcade modes live under Training Dojo inside the RPG shell.
 */
export default function GameMode({ onOpenTrainer }: Props) {
  return <PeraPeraQuestApp onOpenTrainer={onOpenTrainer} />;
}
