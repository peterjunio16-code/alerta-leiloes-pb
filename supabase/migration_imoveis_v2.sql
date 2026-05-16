-- Migração: adicionar colunas de IA e scraping à tabela imoveis
-- Execute no Supabase SQL Editor em: https://supabase.com/dashboard/project/auhuwxhbmoapokndsdmk/sql

ALTER TABLE imoveis
  ADD COLUMN IF NOT EXISTS analise_ia       TEXT,
  ADD COLUMN IF NOT EXISTS edital_url       TEXT,
  ADD COLUMN IF NOT EXISTS tipo_imovel      TEXT,
  ADD COLUMN IF NOT EXISTS modalidade       TEXT,
  ADD COLUMN IF NOT EXISTS ocupado          BOOLEAN,
  ADD COLUMN IF NOT EXISTS fonte            TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS endereco         TEXT,
  ADD COLUMN IF NOT EXISTS processo_numero  TEXT;

-- Índice para busca por fonte
CREATE INDEX IF NOT EXISTS imoveis_fonte_idx ON imoveis(fonte);
CREATE INDEX IF NOT EXISTS imoveis_status_idx ON imoveis(status);
