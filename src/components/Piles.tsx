import React from "react";
import Card from "@/components/Card";

export type PilesType = {
  asc1: number[];
  asc2: number[];
  desc1: number[];
  desc2: number[];
};

interface PilesProps {
  pilhas: PilesType;
  isMyTurn: boolean;
  isTouchDevice: boolean;
  draggedCard: number | null;
  selectedCard: number | null;
  setSelectedCard: (c: number | null) => void;
  setErrorDrop: (k: string | null) => void;
  handlePlayCard: (card: number, pileKey: keyof PilesType) => Promise<void>;
  canDropCard: (card: number, pileKey: keyof PilesType) => boolean;
  dropTarget: string | null;
  setDropTarget: (k: string | null) => void;
  lastDrop: string | null;
  errorDrop: string | null;
}

const Piles: React.FC<PilesProps> = ({ pilhas, isMyTurn, isTouchDevice, draggedCard, selectedCard, setSelectedCard, setErrorDrop, handlePlayCard, canDropCard, dropTarget, setDropTarget, lastDrop, errorDrop }) => (
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(pilhas).map(([key, pile]) => {
      const type = key.startsWith("asc") ? "asc" : "desc";
      return (
        <div
          key={key}
          className={`flex flex-col items-center ${dropTarget === key ? "border-blue-500 border-2" : "border-transparent"} ${lastDrop === key ? "ring-4 ring-green-400 scale-105 animate-pulse" : ""} ${errorDrop === key ? "border-red-500 ring-2 ring-red-400" : ""}`}
          onDragOver={e => {
            if (isTouchDevice) return;
            e.preventDefault();
            if (isMyTurn) setDropTarget(key);
            if (isMyTurn && draggedCard !== null && !canDropCard(draggedCard, key as keyof PilesType)) {
              setErrorDrop(key);
            } else {
              setErrorDrop(null);
            }
          }}
          onDragLeave={() => {
            if (isTouchDevice) return;
            setDropTarget(null);
            setErrorDrop(null);
          }}
          onDrop={e => {
            if (isTouchDevice) return;
            e.preventDefault();
            if (isMyTurn && draggedCard !== null) {
              if (!canDropCard(draggedCard, key as keyof PilesType)) {
                setErrorDrop(key);
                setTimeout(() => setErrorDrop(null), 500);
                return;
              }
              handlePlayCard(draggedCard, key as keyof PilesType);
            }
            setDropTarget(null);
          }}
          onClick={() => {
            if (!isMyTurn || !isTouchDevice) return;
            if (selectedCard !== null) {
              if (!canDropCard(selectedCard, key as keyof PilesType)) {
                setErrorDrop(key);
                setTimeout(() => setErrorDrop(null), 500);
                return;
              }
              handlePlayCard(selectedCard, key as keyof PilesType);
              setSelectedCard(null);
            }
          }}
        >
          <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            {key.toUpperCase()} <span>{type === "asc" ? "⬆️" : "⬇️"}</span>
          </span>
          <Card
            value={pile[pile.length - 1]}
            selected={false}
            onClick={() => {
              if (!isMyTurn || !isTouchDevice) return;
              if (selectedCard !== null) {
                if (!canDropCard(selectedCard, key as keyof PilesType)) {
                  setErrorDrop(key);
                  setTimeout(() => setErrorDrop(null), 500);
                  return;
                }
                handlePlayCard(selectedCard, key as keyof PilesType);
                setSelectedCard(null);
              }
            }}
            disabled={!isMyTurn || selectedCard === null}
            variant="pile"
          />
        </div>
      );
    })}
  </div>
);

export default Piles; 