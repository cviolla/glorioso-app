# UI-SPEC: Unificação e Otimização Ultra-Dense (Configurações)

## 1. Visão Geral
Unificar os cards de "Status", "Contato" e "Taxas" em um único painel de controle compacto e eficiente, eliminando excesso de padding e espaços em branco.

## 2. Mudanças Estruturais
- **Container Único:** Substituir a grade de cards separados por um único card `bg-white` com divisórias sutis.
- **Cabeçalho de Status:** 
  - Status da loja e botão de toggle em uma única linha horizontal.
  - Reduzir o tamanho da fonte do status (ABERTA/FECHADA) e do botão.
- **Seção de Contato:**
  - WhatsApp movido para o cabeçalho ou logo abaixo do status, em formato de input compacto.
- **Grade de Taxas:**
  - Implementar uma grade 4x4 (ou similar) para desktop e 2x2 para mobile.
  - Remover bordas internas e usar apenas separadores `border-gray-50`.
  - Padding reduzido de `p-8` para `p-4` ou `p-3`.

## 3. Design Tokens (Otimizados)
- **Padding:** `p-4` máximo para seções.
- **Fontes:** Reduzir tamanhos base (`text-sm` -> `text-xs` para labels).
- **Inputs:** Altura fixa menor (`h-9` ou `h-10`).

## 4. Comportamento Responsivo
- Mobile: Empilhamento vertical apenas onde necessário.
- Desktop: Layout multi-coluna denso.

## 5. Verificação
- [ ] Ocupa menos de 60% da altura anterior.
- [ ] Todas as funções permanecem acessíveis sem scroll excessivo.
- [ ] Mantém a estética premium através de tipografia e cores, não de espaço vazio.
