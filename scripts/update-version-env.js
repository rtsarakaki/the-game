import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const envPath = path.resolve(process.cwd(), '.env.local');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  // Remove linha antiga da versão
  envContent = envContent.replace(/^NEXT_PUBLIC_APP_VERSION=.*$/m, '');
}
// Adiciona a linha da versão no final
envContent = envContent.trim() + `\nNEXT_PUBLIC_APP_VERSION=${version}\n`;
fs.writeFileSync(envPath, envContent);

console.log(`NEXT_PUBLIC_APP_VERSION set to ${version} in .env.local`); 