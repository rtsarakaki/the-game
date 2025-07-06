// Script para atualizar a versão exibida no AppFooter.tsx com a versão do package.json
 
const fs = require('fs');
 
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const footerPath = path.resolve(__dirname, '../src/components/AppFooter.tsx');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

let footerContent = fs.readFileSync(footerPath, 'utf8');

const versionRegex = /const version = '[^']*'; \/\/ Atualize este valor manualmente conforme a versão do package\.json/;
const newVersionLine = `const version = '${version}'; // Atualize este valor manualmente conforme a versão do package.json`;

if (versionRegex.test(footerContent)) {
  footerContent = footerContent.replace(versionRegex, newVersionLine);
  fs.writeFileSync(footerPath, footerContent);
  console.log(`AppFooter.tsx atualizado para versão ${version}`);
} else {
  console.error('Linha de versão não encontrada em AppFooter.tsx.');
  process.exit(1);
} 