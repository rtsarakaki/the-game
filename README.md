# The Game Online

Uma versão digital cooperativa do jogo de cartas "The Game", desenvolvida com Next.js 15+, TypeScript e arquitetura limpa.

## 🎯 Sobre o Jogo

"The Game" é um jogo cooperativo onde todos os jogadores trabalham juntos para jogar todas as 98 cartas (numeradas de 2 a 99) em quatro pilhas centrais. O objetivo é vencer ou perder como equipe!

### Regras Básicas:
- **2 pilhas ascendentes**: Começam em 1, crescem até 99
- **2 pilhas descendentes**: Começam em 100, decrescem até 2
- **Salto especial**: Pode jogar carta com diferença exata de 10 para trás
- **Turnos**: Mínimo 2 cartas por turno (1 se baralho vazio)
- **Vitória**: Todas as cartas jogadas
- **Derrota**: Nenhum jogador consegue fazer movimentos

## 🚀 Funcionalidades

- ✅ **Auto-start**: Jogo inicia automaticamente quando todos informam nomes
- ✅ **Passagem automática de turno**: Sistema detecta quando jogador não pode jogar
- ✅ **Multiplayer**: 2-6 jogadores simultâneos
- ✅ **Tempo real**: Atualizações via polling (preparado para WebSocket)
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Drag & Drop**: Interface intuitiva para jogar cartas
- ✅ **Touch support**: Suporte completo para dispositivos móveis
- ✅ **Áudio**: Efeitos sonoros para vitória/derrota
- ✅ **Estatísticas**: Acompanhamento de progresso em tempo real

## 🛠️ Tecnologias

- **Next.js 15+** (App Router)
- **TypeScript** (tipagem forte)
- **Tailwind CSS** (estilização)
- **Jest + React Testing Library** (TDD)
- **Framer Motion** (animações)
- **Socket.io** (preparado para WebSocket)

## 📁 Estrutura do Projeto

```
the-game/
├── docs/                    # 📚 Documentação completa
│   ├── ARQUITETURA.md      # Arquitetura e diagramas
│   └── GAME_FLOW_DOCUMENTATION.md # Fluxo detalhado do jogo
├── src/
│   ├── app/                # Páginas Next.js (App Router)
│   ├── components/         # Componentes React
│   ├── domain/            # Lógica de negócio (TDD)
│   └── data/              # Persistência JSON
└── public/                # Assets estáticos
```

## 🎮 Como Jogar

1. **Acesse**: http://localhost:3000
2. **Crie uma partida**: Clique em "Criar Nova Partida"
3. **Compartilhe o link**: Envie para outros jogadores (2-6 pessoas)
4. **Informe nomes**: Todos devem digitar seus nomes
5. **Jogo inicia**: Automaticamente quando último jogador informa nome
6. **Jogue cooperativamente**: Trabalhem juntos para vencer!

## 🚀 Instalação e Execução

```bash
# Clone o repositório
git clone <repository-url>
cd the-game

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Execute os testes
npm test

# Build para produção
npm run build
```

## 🧪 Testes

O projeto segue **TDD (Test-Driven Development)** com cobertura completa:

```bash
# Executar todos os testes
npm test

# Testes específicos do domínio
npx jest src/domain/

# Testes de componentes
npx jest src/components/
```

**Cobertura atual**: 34 testes passando, 6 suítes de teste

## 📖 Documentação

### 📋 Documentação Principal
- **[Arquitetura](docs/ARQUITETURA.md)**: Visão completa da arquitetura, tecnologias, diagramas e funcionalidades
- **[Fluxo do Jogo](docs/GAME_FLOW_DOCUMENTATION.md)**: Documentação detalhada do fluxo, estados e lógica corrigida

### 🔧 Funcionalidades Avançadas
- **Passagem automática de turno**: Sistema inteligente que detecta quando jogador não pode jogar
- **Auto-start**: Jogo inicia automaticamente quando todos os jogadores estão prontos
- **Verificação corrigida de fim de jogo**: Jogo só termina quando realmente nenhum jogador pode continuar
- **API com detecção automática**: Backend verifica e corrige situações bloqueadas

### 📊 Diagramas
A documentação inclui diagramas Mermaid detalhados:
- **Estados do jogo**: Fluxo completo desde criação até fim
- **Lógica de finalização**: Algoritmo corrigido de detecção de fim
- **Cálculo de rodadas**: Como são calculadas as estatísticas

## 🎯 Arquitetura

### Princípios Seguidos:
- **Clean Architecture**: Separação clara de responsabilidades
- **SOLID**: Princípios de design orientado a objetos
- **TDD**: Desenvolvimento orientado por testes
- **Functional Programming**: Funções puras e imutabilidade
- **TypeScript First**: Tipagem forte em todo o projeto

### Padrões de Código:
- **Inglês**: Código, variáveis e comentários
- **Português**: Apenas interface do usuário
- **Clean Code**: Funções pequenas, nomes descritivos
- **Early Return**: Evita else e aninhamento excessivo

## 🌟 Destaques Técnicos

### Correções Implementadas:
1. **Lógica de fim de jogo corrigida**: Agora verifica se TODOS os jogadores podem jogar
2. **Passagem automática de turno**: Sistema detecta e passa turno quando necessário
3. **Auto-start inteligente**: Jogo inicia automaticamente no servidor
4. **API robusta**: Verificações automáticas a cada requisição

### Qualidade de Código:
- **100% TypeScript**: Tipagem forte em todo o projeto
- **TDD**: Testes escritos antes da implementação
- **Cobertura alta**: >80% de cobertura de testes
- **Linting rigoroso**: ESLint + regras customizadas

## 🚀 Deploy

### Desenvolvimento:
```bash
npm run dev
# Acesse: http://localhost:3000
```

### Produção (Vercel):
- Suporte nativo para Vercel
- Persistência em `/tmp` (temporária)
- Variáveis de ambiente automáticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Escreva testes primeiro (TDD)
4. Implemente a funcionalidade
5. Execute os testes
6. Faça commit das mudanças
7. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ seguindo as melhores práticas de desenvolvimento**
