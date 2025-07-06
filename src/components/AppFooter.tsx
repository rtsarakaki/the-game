import React from 'react';
// @ts-expect-error: Importing package.json for version display in Next.js/TypeScript
import pkg from '../../package.json';
const version = pkg.version;

const AppFooter: React.FC = () => (
  <footer className="mt-8 text-xs text-gray-400 text-center w-full" aria-label="Rodapé">
    Desenvolvido com Next.js, TypeScript e Tailwind CSS<br />
    <span className="text-gray-500">Versão: {version}</span>
  </footer>
);

export default AppFooter; 