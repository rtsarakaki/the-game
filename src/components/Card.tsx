import React from "react";

interface CardProps {
  value: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'hand' | 'pile';
}

export default function Card({ value, selected, onClick, disabled, variant = 'hand' }: CardProps) {
  const base = 'flex items-center justify-center rounded-lg shadow-lg text-xl font-bold border-2 transition-all relative select-none';
  const hand = `${selected ? "border-yellow-400 ring-4 ring-yellow-300" : "border-gray-300"} ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white hover:bg-yellow-100 cursor-pointer"}`;
  const pile = 'border-gray-300 bg-white cursor-default';
  const classes = `${base} ${variant === 'pile' ? pile : hand}`;
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type="button"
      tabIndex={variant === 'pile' ? -1 : 0}
      style={{ minWidth: 96, minHeight: 140, maxWidth: 96, maxHeight: 140 }}
    >
      <span className="absolute top-2 left-3 text-base text-gray-500 font-bold">{value}</span>
      <span className="absolute bottom-2 right-3 text-base text-gray-500 font-bold rotate-180">{value}</span>
      <span className="block h-full flex items-center justify-center text-3xl md:text-4xl font-extrabold">{value}</span>
    </button>
  );
} 