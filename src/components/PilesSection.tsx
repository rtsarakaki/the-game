import React from 'react';
import Piles from './Piles';
import type { PilesType } from './Hand';

interface PilesSectionProps {
  piles: PilesType;
  isMyTurn: boolean;
  isTouchDevice: boolean;
  draggedCard: number | null;
  selectedCard: number | null;
  setSelectedCard: (card: number | null) => void;
  setErrorDrop: (error: string | null) => void;
  handlePlayCard: (card: number, pileKey: keyof PilesType) => Promise<void>;
  canDropCard: (card: number, pileKey: keyof PilesType) => boolean;
  dropTarget: string | null;
  setDropTarget: (target: string | null) => void;
  lastDrop: string | null;
  errorDrop: string | null;
}

const PilesSection: React.FC<PilesSectionProps> = ({
  piles,
  isMyTurn,
  isTouchDevice,
  draggedCard,
  selectedCard,
  setSelectedCard,
  setErrorDrop,
  handlePlayCard,
  canDropCard,
  dropTarget,
  setDropTarget,
  lastDrop,
  errorDrop,
}) => (
  <section>
    <h2 className="text-lg font-semibold mb-2 text-gray-800">Piles (top)</h2>
    <Piles
      pilhas={piles}
      isMyTurn={isMyTurn}
      isTouchDevice={isTouchDevice}
      draggedCard={draggedCard}
      selectedCard={selectedCard}
      setSelectedCard={setSelectedCard}
      setErrorDrop={setErrorDrop}
      handlePlayCard={handlePlayCard}
      canDropCard={canDropCard}
      dropTarget={dropTarget}
      setDropTarget={setDropTarget}
      lastDrop={lastDrop}
      errorDrop={errorDrop}
    />
  </section>
);

export default PilesSection; 