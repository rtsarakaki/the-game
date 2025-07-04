import React from "react";
import { PileType } from "@/domain/isValidMove";
import Card from "./Card";

interface PileProps {
  label: string;
  topCard: number;
  type: PileType;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function Pile({ label, topCard, type, selected, onClick, disabled }: PileProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-lg border-2 transition-all
        ${type === "asc" ? "border-blue-400 bg-blue-100" : "border-red-400 bg-red-100"}
        ${selected ? "ring-4 ring-yellow-400" : ""}
      `}
    >
      <span className="font-bold text-lg mb-2">{label}</span>
      <Card
        value={topCard}
        selected={selected}
        onClick={onClick}
        disabled={disabled}
        variant="pile"
      />
    </div>
  );
} 