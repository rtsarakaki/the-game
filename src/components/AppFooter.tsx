import React from 'react';
// ATENÇÃO: Sempre que mudar a versão no package.json, atualize o valor abaixo manualmente!
const version = '0.1.5'; // Atualize este valor manualmente conforme a versão do package.json

const AppFooter: React.FC = () => (
  <footer className="mt-8 text-xs text-gray-400 text-center w-full" aria-label="Rodapé">
    Desenvolvido com Next.js, TypeScript e Tailwind CSS<br />
    <span className="text-gray-500">Versão: {version}</span>
  </footer>
);

export default AppFooter; 