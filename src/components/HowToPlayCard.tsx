import React from 'react';
import SectionCard from './SectionCard';

const HowToPlayCard: React.FC = () => (
  <SectionCard className="text-center max-w-md">
    <h2 className="text-lg font-semibold mb-2 text-gray-800">Como jogar:</h2>
    <ul className="text-sm text-gray-600 space-y-1">
      <li>• Cada jogador deve jogar pelo menos 2 cartas por turno</li>
      <li>• Use as pilhas ascendentes (1→100) e descendentes (100→1)</li>
      <li>• Você pode voltar 10 números em qualquer pilha</li>
      <li>• Objetivo: jogar todas as 98 cartas</li>
    </ul>
  </SectionCard>
);

export default HowToPlayCard; 