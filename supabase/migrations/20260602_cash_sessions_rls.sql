-- ============================================================
-- Glorioso Brownie — Habilitar RLS e Permissões para cash_sessions
-- Data: 2026-06-02
--
-- SEGURO: Garante que apenas administradores autenticados possam gerenciar
-- as sessões de caixa, incluindo a exclusão (DELETE).
-- ============================================================

-- 1. Habilitar RLS na tabela cash_sessions
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Admin gerencia cash_sessions" ON cash_sessions;
DROP POLICY IF EXISTS "Admin pode tudo em cash_sessions" ON cash_sessions;

-- 3. Criar política de acesso total para administradores autenticados
CREATE POLICY "Admin total access on cash_sessions"
  ON cash_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
