-- ============================================================
-- Glorioso Brownie — Habilitar RLS em todas as tabelas
-- Data: 2026-05-08
-- 
-- SEGURO: Não afeta nenhuma funcionalidade existente.
-- - Público: continua lendo cardápio, criando pedidos, vendo config
-- - Admin: continua gerenciando tudo (logado via Supabase Auth)
--
-- IDEMPOTENTE: Pode rodar múltiplas vezes sem erro.
-- ============================================================

-- =====================
-- 1. CATEGORIES
-- =====================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de categorias" ON categories;
CREATE POLICY "Leitura publica de categorias"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia categorias" ON categories;
CREATE POLICY "Admin gerencia categorias"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 2. SUBCATEGORIES
-- =====================
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de subcategorias" ON subcategories;
CREATE POLICY "Leitura publica de subcategorias"
  ON subcategories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia subcategorias" ON subcategories;
CREATE POLICY "Admin gerencia subcategorias"
  ON subcategories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 3. PRODUCTS
-- =====================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de produtos" ON products;
CREATE POLICY "Leitura publica de produtos"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia produtos" ON products;
CREATE POLICY "Admin gerencia produtos"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 4. PRODUCT_VARIANTS
-- =====================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de variantes" ON product_variants;
CREATE POLICY "Leitura publica de variantes"
  ON product_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia variantes" ON product_variants;
CREATE POLICY "Admin gerencia variantes"
  ON product_variants FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 5. CUSTOMERS
-- =====================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin gerencia clientes" ON customers;
CREATE POLICY "Admin gerencia clientes"
  ON customers FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 6. STORE_CONFIG
-- =====================
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de config da loja" ON store_config;
CREATE POLICY "Leitura publica de config da loja"
  ON store_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia config da loja" ON store_config;
CREATE POLICY "Admin gerencia config da loja"
  ON store_config FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 7. STORE_SETTINGS
-- =====================
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de configuracoes" ON store_settings;
CREATE POLICY "Leitura publica de configuracoes"
  ON store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia configuracoes" ON store_settings;
CREATE POLICY "Admin gerencia configuracoes"
  ON store_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 8. DELIVERY_FEES (já tem RLS — apenas garante policies)
-- =====================
-- RLS já está habilitado, apenas reforça as policies
DROP POLICY IF EXISTS "Leitura publica de taxas" ON delivery_fees;
CREATE POLICY "Leitura publica de taxas"
  ON delivery_fees FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia taxas" ON delivery_fees;
CREATE POLICY "Admin gerencia taxas"
  ON delivery_fees FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- 9. ORDERS (já tem RLS — apenas garante policies)
-- =====================
-- RLS já está habilitado, apenas reforça as policies

-- Público pode CRIAR pedidos (checkout)
DROP POLICY IF EXISTS "Publico cria pedidos" ON orders;
CREATE POLICY "Publico cria pedidos"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Público pode LER seus pedidos (página de acompanhamento)
DROP POLICY IF EXISTS "Publico le pedidos" ON orders;
CREATE POLICY "Publico le pedidos"
  ON orders FOR SELECT
  USING (true);

-- Admin pode TUDO (atualizar status, deletar, etc)
DROP POLICY IF EXISTS "Admin gerencia pedidos" ON orders;
CREATE POLICY "Admin gerencia pedidos"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
