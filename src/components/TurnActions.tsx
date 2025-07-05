import React from "react";

interface TurnActionsProps {
  isMyTurn: boolean;
  canEndTurn: boolean;
  onEndTurn: () => void;
  endTurnError?: React.ReactNode | null;
}

const TurnActions: React.FC<TurnActionsProps> = ({ isMyTurn, canEndTurn, onEndTurn, endTurnError }) => (
  <section className="flex flex-col gap-2 mt-4">
    {isMyTurn && canEndTurn && (
      <>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition disabled:opacity-50"
          onClick={onEndTurn}
        >
          Finalizar minha vez
        </button>
        {endTurnError && <span className="text-red-500 text-sm mt-2">{endTurnError}</span>}
      </>
    )}
  </section>
);

export default TurnActions; 