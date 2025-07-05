import React from "react";

export type PilesType = {
  asc1: number[];
  asc2: number[];
  desc1: number[];
  desc2: number[];
};

interface HandProps {
  cartas: number[];
  isMyTurn: boolean;
  isTouchDevice: boolean;
  draggedCard: number | null;
  selectedCard: number | null;
  setDraggedCard: (c: number | null) => void;
  setSelectedCard: (c: number | null) => void;
  setErrorDrop: (k: string | null) => void;
}

const Hand: React.FC<HandProps> = ({ cartas, isMyTurn, isTouchDevice, draggedCard, selectedCard, setDraggedCard, setSelectedCard, setErrorDrop }) => (
  <div className="flex justify-center items-end" style={{ minHeight: 150 }}>
    {cartas.map((c, idx) => (
      <span
        key={c}
        className={`relative select-none card-baralho inline-block bg-white text-gray-900 rounded-lg border-2 border-gray-300 shadow-lg px-6 py-8 md:px-8 md:py-12 text-2xl md:text-3xl font-extrabold text-center transition-transform duration-150 cursor-${isMyTurn ? (isTouchDevice ? "pointer" : "grab") : "not-allowed"} ${draggedCard === c || selectedCard === c ? "opacity-60 scale-105 border-blue-500" : "hover:scale-105 hover:border-blue-400"} ${idx > 0 ? '-ml-4 md:-ml-8' : ''}`}
        draggable={isMyTurn && !isTouchDevice}
        onDragStart={() => !isTouchDevice && setDraggedCard(c)}
        onDragEnd={() => !isTouchDevice && setDraggedCard(null)}
        onClick={() => {
          if (!isMyTurn) return;
          if (isTouchDevice) {
            setSelectedCard(selectedCard === c ? null : c);
          } else {
            setSelectedCard(c);
          }
          setErrorDrop(null);
        }}
        style={{ minWidth: 96, minHeight: 140, maxWidth: 96, maxHeight: 140, zIndex: draggedCard === c ? 10 : idx + 1 }}
      >
        <span className="absolute top-2 left-3 text-base text-gray-500 font-bold">{c}</span>
        <span className="absolute bottom-2 right-3 text-base text-gray-500 font-bold rotate-180">{c}</span>
        <span className="h-full flex items-center justify-center text-3xl md:text-4xl font-extrabold">{c}</span>
      </span>
    ))}
  </div>
);

export default Hand; 