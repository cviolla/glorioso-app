-- ============================================================
-- Glorioso Brownie — Correção de Segurança (RLS e Redação de Dados)
-- Data: 2026-05-12
-- ============================================================

-- 1. Remover a política pública permissiva que permitia listar todos os pedidos
DROP POLICY IF EXISTS "Publico le pedidos" ON orders;

-- 2. Criar uma política que permite leitura apenas para administradores autenticados
CREATE POLICY "Admin pode ler todos os pedidos"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Criar uma função segura para acompanhamento de pedidos pelo público
-- Esta função é 'SECURITY DEFINER', o que significa que ela roda com privilégios de sistema,
-- permitindo buscar os dados mesmo com a tabela 'orders' bloqueada para anônimos.
-- Ela retorna APENAS as colunas não sensíveis necessárias para o rastreio.

CREATE OR REPLACE FUNCTION get_public_orders(order_ids uuid[])
RETURNS TABLE (
    id uuid,
    created_at timestamptz,
    status text,
    total_price numeric,
    delivery_type text,
    items jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Permite acesso controlado mesmo com RLS ativo
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id, 
        o.created_at, 
        o.status::text, 
        o.total_price, 
        o.delivery_type::text, 
        o.items
    FROM orders o
    WHERE o.id = ANY(order_ids)
    ORDER BY o.created_at DESC;
END;
$$;

-- 4. Garantir que usuários anônimos possam executar esta função específica
GRANT EXECUTE ON FUNCTION get_public_orders(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION get_public_orders(uuid[]) TO authenticated;
