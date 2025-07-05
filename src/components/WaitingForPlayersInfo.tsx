import React from 'react';

const WaitingForPlayersInfo: React.FC = () => (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
    <p className="text-blue-700 font-medium mb-2">
      Aguardando jogadores se conectarem...
    </p>
    <p className="text-blue-600 text-sm">
      Compartilhe os links acima para que os jogadores possam entrar na partida.<br />
      O jogo iniciará automaticamente quando todos fornecerem seus nomes.
    </p>
  </div>
);

export default WaitingForPlayersInfo; 