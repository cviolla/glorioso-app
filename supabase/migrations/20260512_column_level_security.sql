-- ============================================================
-- Glorioso Brownie — Proteção de Dados Sensíveis (CLS + RLS)
-- Data: 2026-05-12
-- ============================================================

-- 1. Habilitar RLS (garantir que está ativo)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Publico le pedidos" ON orders;
DROP POLICY IF EXISTS "Publico cria pedidos" ON orders;
DROP POLICY IF EXISTS "Admin gerencia pedidos" ON orders;

-- 3. POLÍTICAS DE ACESSO (Row Level Security)

-- Admin pode tudo (CRUD completo em todas as colunas)
CREATE POLICY "Admin total access"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Público pode CRIAR pedidos (INSERT)
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Público pode LER pedidos (SELECT)
-- Nota: Usamos Column Level Security abaixo para esconder dados sensíveis
CREATE POLICY "Public can read orders"
  ON orders FOR SELECT
  TO anon
  USING (true);


-- 4. SEGURANÇA DE COLUNA (Column Level Security)
-- Isso impede que o papel 'anon' (público) veja dados sensíveis, mesmo que tenha acesso à linha.

-- Primeiro, garantimos que o admin (authenticated) tenha acesso a tudo
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;

-- Para o público (anon), permitimos apenas colunas não sensíveis
REVOKE SELECT ON orders FROM anon; -- Remove tudo primeiro
GRANT SELECT (
  id, 
  created_at, 
  status, 
  total_price, 
  delivery_type, 
  items, 
  order_time,
  user_id
) ON orders TO anon;

-- Note que as colunas abaixo NÃO foram concedidas ao 'anon':
-- customer_name, customer_phone, address_street, address_number, 
-- address_neighborhood, address_complement, address_reference, 
-- payment_method, observation

-- Isso garante que se um cliente ou hacker tentar 'SELECT *' ou pedir o telefone,
-- o Supabase retornará erro ou omitirá os campos, protegendo a privacidade.
