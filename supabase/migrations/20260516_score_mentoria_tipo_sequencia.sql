-- Migration: score_mentoria em leads + tipo em sequencias_nutricao
-- Executar no Supabase SQL Editor

-- 1. Adiciona tipo à tabela de sequências (gratuito vs radar)
ALTER TABLE sequencias_nutricao
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'gratuito';

-- 2. Adiciona score de engajamento para mentoria em leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS score_mentoria INT NOT NULL DEFAULT 0;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS score_mentoria_em TIMESTAMPTZ;

-- 3. Índice para buscar sequências por tipo e dia
CREATE INDEX IF NOT EXISTS idx_seq_nutricao_tipo_dia
  ON sequencias_nutricao (tipo, dia, enviado);

-- 4. Índice para leads com maior score (painel de candidatos à mentoria)
CREATE INDEX IF NOT EXISTS idx_leads_score_mentoria
  ON leads (score_mentoria DESC)
  WHERE status != 'inativo';
