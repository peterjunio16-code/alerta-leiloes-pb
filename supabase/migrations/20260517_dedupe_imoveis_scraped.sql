-- Remove imóveis duplicados scrapeados (LeilãoNinja às vezes salva o mesmo
-- imóvel várias vezes com slugs diferentes como -2, -3, -5).
-- Mantém o MAIS ANTIGO (created_at) de cada grupo (titulo + cidade + lance_inicial)
-- e remove os demais que estão em status='pendente' (não enviados ainda).

WITH duplicados AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY titulo, cidade, lance_inicial
      ORDER BY created_at ASC
    ) AS rn
  FROM imoveis
  WHERE status = 'pendente'
)
DELETE FROM imoveis
WHERE id IN (
  SELECT id FROM duplicados WHERE rn > 1
);

-- Cria índice para acelerar futuras deduplicações
CREATE INDEX IF NOT EXISTS imoveis_dedupe_idx
  ON imoveis (titulo, cidade, lance_inicial);
