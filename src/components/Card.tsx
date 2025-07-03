import React from "react";

interface CardProps {
  value: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function Card({ value, selected, onClick, disabled }: CardProps) {
  return (
    <button
      className={`w-14 h-20 flex items-center justify-center rounded-lg shadow-lg text-xl font-bold border-2 transition-all
        ${selected ? "border-yellow-400 ring-4 ring-yellow-300" : "border-gray-300"}
        ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white hover:bg-yellow-100 cursor-pointer"}
      `}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {value}
    </button>
  );
} 