import React from "react";

interface PlayerListProps {
  players: string[];
  currentPlayer?: string;
}

export default function PlayerList({ players, currentPlayer }: PlayerListProps) {
  return (
    <ul className="space-y-1">
      {players.map((name) => (
        <li
          key={name}
          className={`text-gray-700 ${currentPlayer === name ? "font-bold text-blue-700" : ""}`}
        >
          {name}
          {currentPlayer === name && <span className="ml-2 text-xs text-blue-500">(vez)</span>}
        </li>
      ))}
    </ul>
  );
} 