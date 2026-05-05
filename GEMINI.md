---
trigger: always_on
---

# GEMINI.md - Antigravity Kit (Glorioso Brownie)

> Este arquivo define o comportamento da IA neste workspace e consolida o conhecimento central do projeto Glorioso Brownie.

---

## 📥 RESUMO DO PROJETO (MAPA DE CONHECIMENTO)

### 🚀 Tecnologia Utilizada
- **Core**: Next.js 16 (App Router), React 19, TypeScript.
- **Estilização**: Tailwind CSS v4, Framer Motion (Animações Premium).
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage).
- **Estado**: Zustand (Gerenciamento de estado leve).
- **Validação**: Zod (Esquemas de dados).
- **Interface**: Lucide React (Ícones).

### 🗺️ Mapa de Páginas (Estrutura de Rotas)
- **Público**:
  - `/`: Home (Landing page com identidade visual forte).
  - `/menu`: Catálogo interativo de produtos.
  - `/cart`: Checkout e finalização de pedidos.
  - `/orders`: Acompanhamento de pedidos em tempo real.
- **Administrativo (`/admin`)**:
  - `/admin`: Dashboard com resumo de vendas e status da loja.
  - `/admin/orders`: Gestão ativa de pedidos (Aceitar, Finalizar, Cancelar).
  - `/admin/history`: Histórico completo e arquivamento de pedidos.
  - `/admin/cash-report`: Relatórios financeiros e fechamento de caixa.
  - `/admin/settings`: Controle de estoque, taxas de entrega e horários.

### 🛠️ Principais Recursos
- **Cardápio Digital**: Interface otimizada para mobile com categorias e fotos.
- **Gestão de Pedidos**: Fluxo em tempo real para a cozinha/balcão.
- **Impressão Térmica**: Geração de recibos otimizados para 58mm (foco em centralização e negrito).
- **Controle de Estoque**: Ativação/Desativação rápida de produtos (is_active).
- **Dashboard Financeiro**: Cálculo automático de totais, taxas e métodos de pagamento.

### ⚖️ Regras de Negócio
- **Fluxo de Pedido**: O pedido inicia como `pending`, passa por `preparing` (opcional) e finaliza como `completed` ou `cancelled`.
- **Visibilidade**: Produtos com `is_active: false` não aparecem no menu público, mas são editáveis no admin.
- **Impressão**: O recibo térmico deve ter largura útil de 56mm, fonte mínima de 13.5px e ser rigorosamente centralizado.
- **Segurança**: Acesso administrativo protegido por Supabase Auth; políticas de RLS garantem que usuários comuns não acessem dados sensíveis.

### 🎨 Design System (Ultra-Dense Admin)
- **Cores Oficiais**:
  - `Primary`: `#532120` (Marrom Glorioso)
  - `Accent`: `#ff914a` (Laranja Energético)
  - `Background`: `#f8ece3` (Creme Premium)
- **Densidade**: O Admin utiliza uma escala ultra-densa (Mobile-First) para maximizar informação sem scroll excessivo.
- **Estética**: "Modern, Premium & Alive" com cantos arredondados (`rounded-2xl`) e micro-animações.

---

## 🤖 COMPORTAMENTO DA IA (ANTIGRAVITY PROTOCOL)

### 1. Protocolo de Linguagem
- **Obrigatório**: Respostas sempre em **Português do Brasil**.
- **Código**: Variáveis e comentários em Inglês.

### 2. Regras de Clean Code
- **Conciso**: Direto ao ponto, sem over-engineering.
- **Padrão AAA**: Para testes (Arrange, Act, Assert).
- **Performance**: Prioridade em Core Web Vitals e eliminação de waterfalls no Next.js.

### 3. Socratic Gate (Tomada de Decisão)
Antes de implementações complexas, a IA deve questionar:
1. Qual o impacto na experiência mobile?
2. Como isso afeta o Design System ultra-denso?
3. Existem casos de borda no fluxo de pedidos?

---

## 🏁 CHECKLIST FINAL (MANDATÓRIO)
Antes de cada entrega, verifique:
- [ ] O código passou no Lint (`npm run lint`)?
- [ ] A interface mobile está responsiva e densa?
- [ ] As cores seguem o `globals.css`?
- [ ] A impressão térmica foi considerada (se aplicável)?
