import React from 'react';

// A versão será injetada em tempo de build pelo process.env ou import do package.json
const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

const AppFooter: React.FC = () => (
  <footer className="mt-8 text-xs text-gray-400 text-center w-full" aria-label="Rodapé">
    Desenvolvido com Next.js, TypeScript e Tailwind CSS<br />
    <span className="text-gray-500">Versão: {version}</span>
  </footer>
);

export default AppFooter; 