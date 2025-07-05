# Documentação do Fluxo do Jogo - The Game

## Visão Geral

Este documento descreve o fluxo completo do jogo "The Game", incluindo estados, transições e lógica de finalização **CORRIGIDA**.

## Diagrama de Estados

O jogo possui os seguintes estados principais:

### 1. **Esperando Jogadores** (`esperando_jogadores`)
- **Condição inicial**: Partida criada
- **Características**:
  - Mínimo 2 jogadores, máximo 6
  - Jogadores podem entrar na partida
  - Ainda não há distribuição de cartas
- **Transição**: Quando ≥2 jogadores entram → **Esperando Nomes**

### 2. **Esperando Nomes** (`esperando_jogadores`)
- **Características**:
  - Pelo menos 2 jogadores na partida
  - Jogadores devem informar seus nomes
  - Sistema aguarda todos os nomes serem preenchidos
- **Transição**: Quando último jogador informa nome → **Em Andamento** (AUTO-START)

### 3. **Em Andamento** (`em_andamento`)
- **Características**:
  - Cartas distribuídas automaticamente (6 por jogador)
  - Flag `autoStarted: true` marcada
  - Turnos rotativos entre jogadores
  - **PASSAGEM AUTOMÁTICA DE TURNO** quando jogador não pode jogar
  - Verificação contínua de fim de jogo
- **Sub-estados**: VezJogador1, VezJogador2, VezJogador3...

### 4. **Estados Finais**
- **Vitória** (`victory`/`vitoria`): Todas as cartas foram jogadas
- **Derrota** (`defeat`/`derrota`): **NENHUM** jogador pode fazer movimentos

## Mecânicas de Turno **CORRIGIDAS**

### Regras por Turno:
1. **Mínimo de cartas**: 2 cartas por turno (1 se baralho vazio)
2. **Reposição**: Comprar cartas até ter 6 (ou até baralho acabar)
3. **Verificação**: Após cada carta, verificar se pode continuar
4. **Passagem**: Turno passa para próximo jogador na ordem
5. **⚠️ NOVA REGRA**: Se jogador atual não pode jogar, **passa automaticamente** para próximo que pode

### Verificação de Movimento Válido:
- **Pilhas Ascendentes (ASC1, ASC2)**: 
  - Carta > topo da pilha OU
  - Carta = topo - 10 (salto para trás)
- **Pilhas Descendentes (DESC1, DESC2)**:
  - Carta < topo da pilha OU  
  - Carta = topo + 10 (salto para trás)

## Lógica de Finalização **CORRIGIDA**

### Verificação Após Cada Carta Jogada:

#### 1. **Verificação de Vitória**
```
SE todos_jogadores.cartas.length == 0 E baralho.length == 0:
    → VITÓRIA
```

#### 2. **Verificação de Derrota** 
```
SE NENHUM jogador pode fazer movimentos válidos:
    → DERROTA
SENÃO:
    → Continuar jogo (com passagem automática de turno se necessário)
```

#### 3. **Algoritmo de Passagem de Turno**
```
PARA cada requisição ao servidor:
    SE jogador_atual NÃO pode jogar:
        próximo_jogador = encontrar_próximo_que_pode_jogar()
        SE próximo_jogador existe:
            jogador_atual = próximo_jogador
            LOG("Turno passado automaticamente")
        SENÃO:
            status = "defeat" (ninguém pode jogar)
```

## Condições de Fim de Jogo **CORRIGIDAS**

### 🏆 **Vitória (Cooperativa)**
- **Condição**: Todas as 98 cartas foram jogadas nas pilhas
- **Verificação**: `baralho.length == 0 && todos_jogadores.cartas.length == 0`
- **Resultado**: Todos os jogadores vencem juntos
- **Interface**: Overlay verde com estatísticas de sucesso

### 💀 **Derrota (Cooperativa)**
- **Condição**: **NENHUM** jogador pode fazer movimentos válidos
- **Verificação**: `!jogadores.some(j => pode_jogar(j))`
- **Resultado**: Todos os jogadores perdem juntos
- **Interface**: Overlay vermelho com estatísticas da tentativa

### ⚠️ **Cenário Corrigido**
- **Problema anterior**: Jogo terminava em derrota se jogador atual não podia jogar
- **Correção**: Jogo só termina se **NENHUM** jogador pode jogar
- **Implementação**: Passagem automática de turno no servidor

## Implementação Técnica **ATUALIZADA**

### Arquivos Principais:
- **`checkGameEnd.ts`**: Lógica CORRIGIDA de verificação de fim de jogo
- **`nextPlayer.ts`**: Nova função `nextPlayerWhoCanPlay()`
- **`isValidMove.ts`**: Validação de movimentos individuais
- **`isMovePossible.ts`**: Verificação se jogador pode continuar
- **`GameEndOverlay.tsx`**: Interface de fim de jogo
- **`/api/partida/route.ts`**: Auto-start + passagem automática de turno

### Fluxo de Dados **CORRIGIDO**:
1. **Cliente** → Consulta estado → **API**
2. **API** → Verifica se jogador atual pode jogar
3. **API** → Se não pode, passa turno automaticamente
4. **API** → Retorna estado atualizado → **Cliente**
5. **Cliente** → Atualiza interface → Mostra resultado

### Passagem Automática de Turno:
- **Trigger**: Jogador atual não pode fazer movimentos
- **Verificação**: Outros jogadores ainda podem jogar
- **Ação**: Passa turno automaticamente para próximo jogador válido
- **Log**: Registra passagem automática no console
- **Notificação**: WebSocket `partida:turn_passed`

## Características Especiais **ATUALIZADAS**

### Auto-Start:
- **Trigger**: Último jogador informa nome
- **Ação**: Distribuição automática de cartas
- **Notificação**: Visual para todos os jogadores
- **Flag**: `autoStarted: true` no estado da partida

### Passagem Automática de Turno:
- **Trigger**: Jogador atual não pode jogar
- **Verificação**: A cada GET/PUT na API
- **Ação**: Busca próximo jogador que pode jogar
- **Resultado**: Atualiza `jogadorAtual` automaticamente
- **Prevenção**: Evita loops infinitos com `maxIterations`

### Polling vs WebSocket:
- **Atual**: Polling a cada 2 segundos
- **Preparado**: Para WebSocket real-time
- **Eventos**: `game:started`, `partida:updated`, `partida:turn_passed`

### Estatísticas:
- **Cartas jogadas**: Total de cartas nas pilhas
- **Cartas restantes**: No baralho
- **Rodadas completas**: Ciclos completos de todos os jogadores
- **Jogadores ativos**: Com cartas na mão

## Regras do Jogo

### Objetivo:
Jogar cooperativamente para colocar todas as 98 cartas (2-99) nas 4 pilhas centrais.

### Pilhas:
- **2 Ascendentes**: Começam em 1, crescem até 99
- **2 Descendentes**: Começam em 100, decrescem até 2

### Saltos Especiais:
- **Salto para trás**: Diferença exata de 10
- **Exemplo ASC**: Se topo é 50, pode jogar 40
- **Exemplo DESC**: Se topo é 30, pode jogar 40

### Turnos:
- **Mínimo**: 2 cartas por turno (1 se baralho vazio)
- **Reposição**: Até 6 cartas na mão
- **Ordem**: Fixa, rotativa entre jogadores
- **⚠️ NOVO**: Passagem automática se jogador não pode jogar

## Correções Implementadas

### 1. **Lógica de Fim de Jogo**
- **Antes**: Terminava se jogador atual não podia jogar
- **Depois**: Só termina se NENHUM jogador pode jogar

### 2. **Passagem de Turno**
- **Antes**: Manual, jogador ficava "preso"
- **Depois**: Automática quando jogador não pode jogar

### 3. **Verificação de Estado**
- **Antes**: Apenas no frontend
- **Depois**: Também no backend (API)

### 4. **Cenário Real Corrigido**
- **Estado**: Leonardo (jogador atual) não pode jogar carta 58
- **Ricardo**: Pode jogar cartas 25 e 7 na pilha DESC2
- **Resultado**: Turno passa automaticamente para Ricardo
- **Status**: `em_andamento` (não `defeat`)

Esta documentação reflete a implementação corrigida que resolve o problema identificado no cenário real do jogo. 