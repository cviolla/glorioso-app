# Glorioso App - Guia de Desenvolvimento

## 🌍 Global
- Sempre responder em Português do Brasil.
- Não fazer push ou deploy para o GitHub/Vercel sem permissão explícita do usuário.
- Ao finalizar tarefas complexas, ofereça-se para realizar o commit e push.

## 🎨 Design System & UI
- Estilo: Premium, moderno e alive.
- Arredondamento: Priorize `rounded-2xl` ou `rounded-3xl` para botões e cards.
- Animações: Use `framer-motion` para transições suaves, efeitos de hover (`scale-105`) e micro-interações.
- Cores: Use as variáveis CSS definidas em `globals.css` (ex: `var(--color-brand-accent)` para o laranja oficial).
- Feedback: Sempre forneça feedback visual (loaders, skeletons, toasts) para ações do usuário.

## 🖨️ Impressão Térmica (58mm)
- Largura: Otimizado para bobinas de 58mm (largura útil aproximada de 56mm).
- Alinhamento: Tudo deve ser rigorosamente centralizado (`text-align: center`).
- Legibilidade: Use fontes de no mínimo 13.5px para o corpo e 16px+ para títulos.
- Contraste: Use negrito extra (`font-black`) em informações críticas como valores totais e nomes de produtos.

## 💻 Desenvolvimento & Qualidade
- Framework: Next.js 14+ (App Router).
- Linting: Rodar `npx eslint .` antes de sugerir qualquer deploy e corrigir erros fatais.
- Banco de Dados (Supabase):
  - Ao adicionar colunas, atualize a interface `MenuItem` em `src/data/menu.ts`.
  - Garanta que o mapeamento no `fetchMenu` (admin e público) contemple os novos campos.
  - Verifique políticas de RLS para novas tabelas ou funcionalidades sensíveis.
- Tipagem: Evite o uso de `any`. Defina interfaces claras para novos dados.

## 📦 Comandos Úteis
- Iniciar Dev: `npm run dev`
- Build: `npm run build`
- Corrigir Lint: `npx eslint . --fix`
