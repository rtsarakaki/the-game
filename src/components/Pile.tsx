import React from "react";
import { PileType } from "@/domain/isValidMove";

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
    <button
      className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-lg border-2 transition-all
        ${type === "asc" ? "border-blue-400 bg-blue-100" : "border-red-400 bg-red-100"}
        ${selected ? "ring-4 ring-yellow-400" : ""}
      `}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <span className="font-bold text-lg mb-2">{label}</span>
      <span className="text-2xl font-mono">{topCard}</span>
    </button>
  );
} 