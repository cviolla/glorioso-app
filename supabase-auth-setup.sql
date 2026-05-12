-- ATENÇÃO: Execute este script no painel SQL do Supabase (SQL Editor)

-- 1. Adicionar colunas necessárias na tabela de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Adicionar coluna na tabela de pedidos para vincular ao cliente logado
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. (Opcional, mas recomendado) Configurar RLS (Row Level Security) básico para orders
-- Isso garante que um usuário logado só veja seus próprios pedidos
-- Descomente as linhas abaixo se quiser aplicar a segurança máxima
/*
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios pedidos" 
ON orders FOR SELECT 
USING (
  auth.uid() = user_id OR 
  -- Mantemos a leitura livre para os pedidos anônimos (por ID do localStorage) 
  -- se você não tiver habilitado restrição total.
  user_id IS NULL
);
*/
