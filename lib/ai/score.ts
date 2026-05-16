/**
 * Score inteligente de imóveis em leilão via Claude API.
 *
 * Configura: ANTHROPIC_API_KEY no .env.local
 * Modelo: claude-haiku-3-5 (rápido, barato — ideal para scoring em massa)
 */

export type ImovelParaScore = {
  id: string;
  titulo: string;
  cidade: string;
  bairro?: string | null;
  lance_inicial: number;
  valor_avaliacao?: number | null;
  desconto?: number | null;
  tipo_imovel?: string | null;
  modalidade?: string | null;
  ocupado?: boolean | null;
  data_leilao?: string | null;
  processo_numero?: string | null;
};

export type ScoreResult = {
  score: number;         // 0–10 com uma casa decimal
  analise: string;       // texto formatado para exibição
  resumo_whatsapp: string; // versão curta para o alerta WA
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function buildPrompt(imovel: ImovelParaScore): string {
  const avaliacao = imovel.valor_avaliacao ? fmt(imovel.valor_avaliacao) : "não informada";
  const lance = fmt(imovel.lance_inicial);
  const desconto = imovel.desconto != null ? `${imovel.desconto}%` : (
    imovel.valor_avaliacao
      ? `${Math.round((1 - imovel.lance_inicial / imovel.valor_avaliacao) * 100)}%`
      : "não calculado"
  );
  const ocupado = imovel.ocupado == null ? "não informado" : imovel.ocupado ? "SIM (ocupado)" : "NÃO (desocupado)";
  const data = imovel.data_leilao ? new Date(imovel.data_leilao).toLocaleDateString("pt-BR") : "não informada";
  const modalidade = imovel.modalidade ?? "não informada";
  const tipo = imovel.tipo_imovel ?? "não informado";

  return `Você é um especialista em leilões imobiliários no Brasil, com foco em Paraíba.

Analise este imóvel em leilão e gere um score de oportunidade de 0 a 10 (use uma casa decimal).

DADOS DO IMÓVEL:
- Tipo: ${tipo}
- Localização: ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}
- Avaliação oficial: ${avaliacao}
- Lance inicial: ${lance}
- Desconto: ${desconto}
- Modalidade: ${modalidade}
- Imóvel ocupado: ${ocupado}
- Data do leilão: ${data}

CRITÉRIOS DE AVALIAÇÃO:
- Desconto >50%: grande vantagem (adiciona até +3 pontos)
- Imóvel desocupado: sem custo de imissão na posse (+1 ponto)
- Modalidade 2ª praça ou menor preço: mais acessível (+0.5)
- Cidades grandes na PB (João Pessoa, Campina Grande): maior liquidez (+0.5)
- Apartamento/Casa residencial: maior liquidez (+0.5)
- Data próxima: urgência, menos tempo para due diligence (-0.5)
- Imóvel ocupado: custo e risco de imissão (-1 a -2)
- Desconto <20%: pouca vantagem

RETORNE EXATAMENTE neste formato JSON (sem markdown, sem explicações fora do JSON):
{
  "score": 7.5,
  "pontos_positivos": [
    "Desconto de 62% abaixo da avaliação",
    "Imóvel desocupado — sem custo de imissão",
    "Localização valorizada em João Pessoa"
  ],
  "pontos_atencao": [
    "Verifique dívidas de IPTU e condomínio no edital",
    "Confirme metragem e estado de conservação"
  ],
  "resumo": "Apartamento com desconto expressivo e sem ocupantes. Boa liquidez na capital. Verifique débitos no edital."
}`;
}

export async function gerarScoreIA(imovel: ImovelParaScore): Promise<ScoreResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada no .env.local");

  const prompt = buildPrompt(imovel);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data?.content?.[0]?.text ?? "";

  // Parse JSON da resposta
  let parsed: {
    score: number;
    pontos_positivos?: string[];
    pontos_atencao?: string[];
    resumo?: string;
  };

  try {
    // Extrai o JSON mesmo se vier com texto ao redor
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON não encontrado na resposta");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Resposta da IA inválida: ${raw.slice(0, 300)}`);
  }

  const score = Math.min(10, Math.max(0, Number(parsed.score) || 5));

  // Formata análise completa para exibição na página
  const linhas: string[] = [];
  if (parsed.pontos_positivos?.length) {
    linhas.push("✅ Pontos positivos:");
    parsed.pontos_positivos.forEach((p) => linhas.push(`• ${p}`));
  }
  if (parsed.pontos_atencao?.length) {
    linhas.push("");
    linhas.push("⚠️ Pontos de atenção:");
    parsed.pontos_atencao.forEach((p) => linhas.push(`• ${p}`));
  }
  if (parsed.resumo) {
    linhas.push("");
    linhas.push(parsed.resumo);
  }

  // Resumo curto para WhatsApp (máx 200 chars)
  const resumoWA = (parsed.resumo ?? "").slice(0, 200);

  return {
    score,
    analise: linhas.join("\n"),
    resumo_whatsapp: resumoWA,
  };
}
