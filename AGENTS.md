<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Glorioso Brownie - Project Intel

## 🚀 Tecnologia Utilizada
- **Core**: Next.js 16 (App Router), React 19, TypeScript.
- **UI**: Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend**: Supabase (Auth, DB, Storage).
- **State**: Zustand + Zod.

## 🗺️ Mapa de Páginas
- **Público**: `/` (Home), `/menu` (Cardápio), `/cart` (Checkout), `/orders` (Acompanhamento).
- **Admin**: `/admin` (Dashboard), `/admin/orders` (Gestão), `/admin/history` (Histórico), `/admin/cash-report` (Financeiro), `/admin/settings` (Loja).

## 🛠️ Recursos & Regras de Negócio
- **Impressão Térmica**: Recibos centralizados em 56mm para bobinas de 58mm.
- **Gestão Ultra-Densa**: Admin otimizado para mobile com máxima densidade de informação.
- **Estoque em Tempo Real**: Ativação imediata de produtos via campo `is_active`.
- **Status de Pedido**: Fluxo `pending` → `preparing` → `completed`/`cancelled`.

## 🎨 Design System
- **Cores**: Brand Primary (#532120), Accent (#ff914a), Background (#f8ece3).
- **Componentes**: `rounded-2xl` para cards premium, animações suaves com `framer-motion`.
