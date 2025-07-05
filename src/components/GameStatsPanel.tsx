import React from "react";
import StatsPanel from "@/components/StatsPanel";

interface GameStatsPanelProps {
  cardsLeft: number;
  currentPlayerName?: string;
  gameStatus?: string;
}

const GameStatsPanel: React.FC<GameStatsPanelProps> = (props) => (
  <StatsPanel {...props} />
);

export default GameStatsPanel; 