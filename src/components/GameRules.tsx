import React from "react";

interface GameRulesProps {
  variant?: "desktop" | "mobile";
}

const GameRules: React.FC<GameRulesProps> = ({ variant }) => (
  <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow text-gray-800 ${variant === 'desktop' ? 'hidden lg:block' : 'block lg:hidden'} w-full`}> 
    <h2 className="text-lg font-bold mb-2 text-yellow-700">Regras do Jogo</h2>
    <ul className="list-disc pl-5 text-sm space-y-1">
      <li>O objetivo é jogar todas as cartas nas pilhas centrais, cooperando com os outros jogadores.</li>
      <li>Existem 4 pilhas: 2 crescentes (de 1 a 99) e 2 decrescentes (de 100 a 2).</li>
      <li>Em pilhas crescentes, só pode jogar carta maior que o topo ou exatamente 10 abaixo.</li>
      <li>Em pilhas decrescentes, só pode jogar carta menor que o topo ou exatamente 10 acima.</li>
      <li>No seu turno, jogue pelo menos 2 cartas (ou 1 se o baralho acabou).</li>
      <li>Após jogar, compre cartas até ficar com 6 (se houver no baralho).</li>
      <li>Se nenhum jogador puder jogar, o jogo termina em derrota.</li>
      <li>Se todas as cartas forem jogadas, todos vencem!</li>
    </ul>
  </div>
);

export default GameRules; 