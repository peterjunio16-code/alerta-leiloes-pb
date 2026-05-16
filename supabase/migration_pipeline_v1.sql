-- Migração: tracking de envios automáticos no pipeline
-- Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/auhuwxhbmoapokndsdmk/sql

ALTER TABLE imoveis
  ADD COLUMN IF NOT EXISTS enviado_radar_em      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enviado_gratuito_em   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS score_minimo_atingido BOOLEAN GENERATED ALWAYS AS (score >= 5) STORED;

-- Índices para o pipeline (busca rápida por estado de envio)
CREATE INDEX IF NOT EXISTS imoveis_pipeline_radar_idx
  ON imoveis(enviado_radar_em)
  WHERE status = 'pendente';

CREATE INDEX IF NOT EXISTS imoveis_pipeline_gratuito_idx
  ON imoveis(enviado_gratuito_em)
  WHERE enviado_radar_em IS NOT NULL;
