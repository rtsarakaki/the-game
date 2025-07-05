import React from 'react';
import Hand from './Hand';

interface PlayerHandSectionProps {
  cards: number[];
  isMyTurn: boolean;
  isTouchDevice: boolean;
  draggedCard: number | null;
  selectedCard: number | null;
  setDraggedCard: (card: number | null) => void;
  setSelectedCard: (card: number | null) => void;
  setErrorDrop: (error: string | null) => void;
}

const PlayerHandSection: React.FC<PlayerHandSectionProps> = ({
  cards,
  isMyTurn,
  isTouchDevice,
  draggedCard,
  selectedCard,
  setDraggedCard,
  setSelectedCard,
  setErrorDrop,
}) => (
  <section>
    <h2 className="text-lg font-semibold mb-2 text-gray-800">Your Cards</h2>
    <Hand
      cartas={cards}
      isMyTurn={isMyTurn}
      isTouchDevice={isTouchDevice}
      draggedCard={draggedCard}
      selectedCard={selectedCard}
      setDraggedCard={setDraggedCard}
      setSelectedCard={setSelectedCard}
      setErrorDrop={setErrorDrop}
    />
  </section>
);

export default PlayerHandSection; 