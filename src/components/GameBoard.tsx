import React, { useState } from "react";
import { Piles, IPlayer } from "@/domain/types";
import { isValidMove, PileType } from "@/domain/isValidMove";

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
          <button
            key={key}
            className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-lg border-2 transition-all
              ${key.startsWith("asc") ? "border-blue-400 bg-blue-100" : "border-red-400 bg-red-100"}
              ${selectedPile === key ? "ring-4 ring-yellow-400" : ""}
            `}
            onClick={() => handlePileClick(key as keyof Piles)}
            disabled={!isCurrentPlayer || selectedCard === null}
          >
            <span className="font-bold text-lg mb-2">{pileLabels[key as keyof Piles]}</span>
            <span className="text-2xl font-mono">{pile[pile.length - 1]}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        {player.cards.map((card) => (
          <button
            key={card}
            className={`w-14 h-20 flex items-center justify-center rounded-lg shadow-lg text-xl font-bold border-2 transition-all
              ${selectedCard === card ? "border-yellow-400 ring-4 ring-yellow-300" : "border-gray-300"}
              ${isCurrentPlayer ? "bg-white hover:bg-yellow-100 cursor-pointer" : "bg-gray-200 cursor-not-allowed"}
            `}
            onClick={() => handleCardClick(card)}
            disabled={!isCurrentPlayer}
          >
            {card}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!isCurrentPlayer && <p className="text-gray-500 mt-4">Aguarde sua vez...</p>}
    </div>
  );
} 