import React from "react";
import StatsPanel from "@/components/StatsPanel";

interface GameStatsPanelProps {
  totalCardsPlayed: number;
  cardsLeft: number;
  playersLeft: number;
  rounds: number;
}

const GameStatsPanel: React.FC<GameStatsPanelProps> = (props) => (
  <StatsPanel {...props} />
);

export default GameStatsPanel; 