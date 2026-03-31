-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- LEADS
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'grupo', -- 'grupo' | 'radar' | 'mentoria'
  status TEXT NOT NULL DEFAULT 'novo', -- 'novo' | 'nutrição' | 'cliente' | 'inativo'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMÓVEIS
CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT,
  valor_avaliacao NUMERIC(12,2),
  lance_inicial NUMERIC(12,2) NOT NULL,
  desconto NUMERIC(5,2),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 10),
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'publicado' | 'encerrado'
  link TEXT,
  data_leilao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSINANTES RADAR
CREATE TABLE assinantes_radar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ativo', -- 'ativo' | 'cancelado' | 'inadimplente'
  hotmart_subscriber_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APLICAÇÕES MENTORIA
CREATE TABLE aplicacoes_mentoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  participou_leilao BOOLEAN DEFAULT FALSE,
  orcamento TEXT,
  trava TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'contatado' | 'aprovado' | 'rejeitado'
  respostas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEQUÊNCIAS DE NUTRIÇÃO
CREATE TABLE sequencias_nutricao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  dia INTEGER NOT NULL, -- 1, 3, 7, 14
  enviado BOOLEAN DEFAULT FALSE,
  enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_whatsapp ON leads(whatsapp);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_imoveis_status ON imoveis(status);
CREATE INDEX idx_sequencias_lead ON sequencias_nutricao(lead_id);
CREATE INDEX idx_sequencias_enviado ON sequencias_nutricao(enviado);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER imoveis_updated_at BEFORE UPDATE ON imoveis FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER assinantes_updated_at BEFORE UPDATE ON assinantes_radar FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER aplicacoes_updated_at BEFORE UPDATE ON aplicacoes_mentoria FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinantes_radar ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacoes_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequencias_nutricao ENABLE ROW LEVEL SECURITY;

-- Public insert (anon key from browser)
CREATE POLICY "leads_insert" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "aplicacoes_insert" ON aplicacoes_mentoria FOR INSERT TO anon WITH CHECK (true);

-- Service role full access (API routes)
CREATE POLICY "leads_all_service" ON leads FOR ALL TO service_role USING (true);
CREATE POLICY "imoveis_all_service" ON imoveis FOR ALL TO service_role USING (true);
CREATE POLICY "assinantes_all_service" ON assinantes_radar FOR ALL TO service_role USING (true);
CREATE POLICY "aplicacoes_all_service" ON aplicacoes_mentoria FOR ALL TO service_role USING (true);
CREATE POLICY "sequencias_all_service" ON sequencias_nutricao FOR ALL TO service_role USING (true);
