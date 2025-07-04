import GameStatus from "./GameStatus";

interface GameEndOverlayProps {
  status: string;
  stats?: {
    totalCardsPlayed: number;
    rounds: number;
  };
}

export default function GameEndOverlay({ status, stats }: GameEndOverlayProps) {
  if (!["victory", "defeat", "vitoria", "derrota"].includes(status)) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="max-w-md w-full">
        <GameStatus status={status} stats={stats} />
      </div>
    </div>
  );
} 