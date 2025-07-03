import React, { useState } from "react";
import { Piles, IPlayer } from "@/domain/types";
import { isValidMove, PileType } from "@/domain/isValidMove";
import Pile from "./Pile";
import Card from "./Card";

interface GameBoardProps {
  piles: Piles;
  player: IPlayer;
  onPlay: (card: number, pileKey: keyof Piles) => void;
  isCurrentPlayer: boolean;
}

const pileLabels: Record<keyof Piles, string> = {
  asc1: "Subida 1",
  asc2: "Subida 2",
  desc1: "Descida 1",
  desc2: "Descida 2",
};

const pileTypes: Record<keyof Piles, PileType> = {
  asc1: "asc",
  asc2: "asc",
  desc1: "desc",
  desc2: "desc",
};

export default function GameBoard({ piles, player, onPlay, isCurrentPlayer }: GameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedPile, setSelectedPile] = useState<keyof Piles | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCardClick = (card: number) => {
    if (!isCurrentPlayer) return;
    setSelectedCard(card);
    setError(null);
  };

  const handlePileClick = (pileKey: keyof Piles) => {
    if (!isCurrentPlayer || selectedCard === null) return;
    const pileType = pileTypes[pileKey];
    const topCard = piles[pileKey][piles[pileKey].length - 1];
    if (!isValidMove(pileType, topCard, selectedCard)) {
      setError("Jogada inválida para esta pilha.");
      return;
    }
    onPlay(selectedCard, pileKey);
    setSelectedCard(null);
    setSelectedPile(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-6 w-full">
        {Object.entries(piles).map(([key, pile]) => (
          <Pile
            key={key}
            label={pileLabels[key as keyof Piles]}
            topCard={pile[pile.length - 1]}
            type={pileTypes[key as keyof Piles]}
            selected={selectedPile === key}
            onClick={() => handlePileClick(key as keyof Piles)}
            disabled={!isCurrentPlayer || selectedCard === null}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        {player.cards.map((card) => (
          <Card
            key={card}
            value={card}
            selected={selectedCard === card}
            onClick={() => handleCardClick(card)}
            disabled={!isCurrentPlayer}
          />
        ))}
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!isCurrentPlayer && <p className="text-gray-500 mt-4">Aguarde sua vez...</p>}
    </div>
  );
} 