import React, { useState, useRef } from "react";
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
  const [dragOverPile, setDragOverPile] = useState<keyof Piles | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const playError = () => {
    if (!errorAudioRef.current) {
      errorAudioRef.current = new window.Audio('/sounds/error.mp3');
    }
    errorAudioRef.current.currentTime = 0;
    errorAudioRef.current.play();
  };

  const handleCardClick = (card: number) => {
    if (!isCurrentPlayer) return;
    setSelectedCard(card);
    setError(null);
  };

  const handleCardDragStart = (event: React.DragEvent, card: number) => {
    if (!isCurrentPlayer) return;
    event.dataTransfer.setData('text/plain', card.toString());
    setSelectedCard(card);
  };

  const handlePileClick = (pileKey: keyof Piles) => {
    if (!isCurrentPlayer || selectedCard === null) return;
    const pileType = pileTypes[pileKey];
    const topCard = piles[pileKey][piles[pileKey].length - 1];
    if (!isValidMove(pileType, topCard, selectedCard)) {
      setError("Jogada inválida para esta pilha.");
      playError();
      return;
    }
    onPlay(selectedCard, pileKey);
    setSelectedCard(null);
    setSelectedPile(null);
    setError(null);
  };

  const handlePileDrop = (event: React.DragEvent, pileKey: keyof Piles) => {
    event.preventDefault();
    setDragOverPile(null);
    if (!isCurrentPlayer) return;
    const card = parseInt(event.dataTransfer.getData('text/plain'), 10);
    const pileType = pileTypes[pileKey];
    const topCard = piles[pileKey][piles[pileKey].length - 1];
    if (!isValidMove(pileType, topCard, card)) {
      setError("Jogada inválida para esta pilha.");
      playError();
      return;
    }
    onPlay(card, pileKey);
    setSelectedCard(null);
    setSelectedPile(null);
    setError(null);
  };

  const handlePileDragOver = (event: React.DragEvent, pileKey: keyof Piles) => {
    event.preventDefault();
    setDragOverPile(pileKey);
  };

  const handlePileDragLeave = (event: React.DragEvent, pileKey: keyof Piles) => {
    event.preventDefault();
    setDragOverPile(prev => (prev === pileKey ? null : prev));
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-6 w-full">
        {Object.entries(piles).map(([key, pile]) => {
          const pileKey = key as keyof Piles;
          return (
            <div
              key={key}
              onDrop={event => handlePileDrop(event, pileKey)}
              onDragOver={event => handlePileDragOver(event, pileKey)}
              onDragLeave={event => handlePileDragLeave(event, pileKey)}
              className={`w-full h-full transition-all ${dragOverPile === pileKey ? 'ring-4 ring-red-500' : ''}`}
            >
              <Pile
                label={pileLabels[pileKey]}
                topCard={pile[pile.length - 1]}
                type={pileTypes[pileKey]}
                selected={selectedPile === pileKey}
                onClick={() => handlePileClick(pileKey)}
                disabled={!isCurrentPlayer || selectedCard === null}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        {player.cards.map((card) => (
          <div
            key={card}
            draggable={isCurrentPlayer}
            onDragStart={event => handleCardDragStart(event, card)}
          >
            <Card
              value={card}
              selected={selectedCard === card}
              onClick={() => handleCardClick(card)}
              disabled={!isCurrentPlayer}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {!isCurrentPlayer && <p className="text-gray-500 mt-4">Aguarde sua vez...</p>}
    </div>
  );
} 