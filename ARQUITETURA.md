# Arquitetura da Solução — The Game Online

## Visão Geral

A aplicação é uma versão digital do jogo de tabuleiro "The Game", construída com **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, **TDD**, e arquitetura limpa. O sistema suporta múltiplos jogadores, administração de partidas, lógica de jogo no frontend/backend, persistência em arquivo JSON e atualização em tempo real via WebSocket.

---

## 1. Stack e Tecnologias
- **Next.js 15+**: Framework React para SSR/SSG, App Router, API Routes.
- **TypeScript**: Tipagem forte em todo o projeto.
- **Tailwind CSS**: Estilização utilitária e responsiva.
- **Jest + React Testing Library**: Testes unitários e de componentes (TDD).
- **socket.io**: WebSocket para atualização em tempo real.
- **Arquitetura Limpa**: Separação de domínio, infraestrutura, apresentação e dados.

---

## 2. Estrutura de Pastas
```
the-game/
  src/
    app/           # Páginas e rotas Next.js (App Router)
      api/         # API REST para manipulação da partida
      partida/     # Páginas dinâmicas de cada partida
    components/    # Componentes funcionais e reutilizáveis
    data/          # Persistência (partida.json)
    domain/        # Lógica de negócio (funções puras, testes)
```

---

## 3. Fluxo de Dados

### a) Criação de Partida
- Usuário clica em "Criar partida" na home.
- Frontend gera UUID, inicializa estado e faz POST na API (`/api/partida`).
- Link da sala é exibido para compartilhar.

### b) Entrada de Jogadores
- Jogadores acessam o link da sala.
- Nome/apelido é enviado via PUT para a API, que atualiza o arquivo JSON.
- Todos os clientes conectados recebem atualização via WebSocket.

### c) Início do Jogo
- Admin vê lista de jogadores e botão "Iniciar partida" (habilitado com 2+ jogadores).
- Ao iniciar, baralho é embaralhado, cartas distribuídas, ordem definida e status atualizado.
- Estado é persistido e broadcast via WebSocket.

### d) Progresso do Jogo
- Cada jogador faz jogadas na sua vez, validando regras de "The Game" (funções puras em `domain/`).
- Após o turno, cartas são compradas e o próximo jogador é definido.
- Fim de jogo (vitória/derrota) é detectado automaticamente.

### e) Atualização em Tempo Real
- Todas as telas conectam-se ao WebSocket (`/api/socket`).
- Qualquer alteração relevante (entrada, início, jogada) emite evento `partida:update`.
- Todos os navegadores recebem e atualizam o estado instantaneamente.

---

## 4. Domínio e Lógica de Negócio
- Funções puras para embaralhar, distribuir, validar jogadas, checar fim de jogo, etc.
- Testes unitários garantem cobertura e TDD.
- Tipos e interfaces modelam o domínio (ex: `IPlayer`, `Piles`).

---

## 5. API REST
- **GET** `/api/partida`: Retorna o estado atual da partida.
- **POST** `/api/partida`: Cria nova partida (sobrescreve JSON).
- **PUT** `/api/partida`: Atualiza estado da partida (ex: novo jogador, jogada, início).
- Persistência simples em arquivo `src/data/partida.json` (mock de backend).

## 5.1 Persistência Temporária em Serverless (Vercel)

Em ambientes serverless como a Vercel, não é possível gravar arquivos na estrutura do projeto. Por isso, a API detecta se está rodando na Vercel (`process.env.VERCEL`) e, nesse caso, utiliza o diretório temporário `/tmp` para persistir o arquivo de partida:

```ts
const isVercel = !!process.env.VERCEL;
const PARTIDA_PATH = isVercel
  ? '/tmp/partida.json'
  : path.resolve(process.cwd(), 'src/data/partida.json');
```

- **Leitura:** Ao receber um GET, a API tenta ler `/tmp/partida.json`. Se não existir, inicializa vazio.
- **Escrita:** POST/PUT sobrescrevem o arquivo em `/tmp/partida.json` com o novo estado.
- **Importante:** O conteúdo de `/tmp` é volátil e só existe enquanto a instância está ativa. Ao reiniciar (timeout/deploy), o arquivo é perdido.
- **Local:** Fora da Vercel, a persistência continua em `src/data/partida.json` normalmente.

---

## 6. WebSocket (socket.io)
- Servidor WebSocket em `/pages/api/socket.ts`.
- Clientes conectam-se via `socket.io-client`.
- Eventos `partida:update` são emitidos sempre que o estado muda.
- Todos os navegadores recebem atualizações em tempo real.

---

## 7. Componentização e UI
- Componentes pequenos, reutilizáveis e com responsabilidade única (SRP).
- Props tipadas, estilização com Tailwind, animações com Framer Motion.
- Telas principais: Home (criação), Sala (entrada/lista), Jogo (tabuleiro), Status (fim).

---

## 8. Testes e Qualidade
- TDD: testes escritos antes da implementação.
- Cobertura alta (>80%) em lógica de domínio e componentes principais.
- Testes de comportamento, não de implementação.

---

## 9. Boas Práticas
- SOLID, funções puras, early return, tipagem forte, sem duplicação.
- Código limpo, legível e fácil de manter.
- Separação clara entre domínio, infraestrutura e apresentação.

---

## 10. Extensões Futuras
- Suporte a múltiplas partidas simultâneas.
- Autenticação e ranking.
- Deploy serverless (Vercel, etc).
- Persistência real (banco de dados).
- WebSocket global para múltiplas salas.

---

**Dúvidas ou sugestões? Fale com o desenvolvedor!** 