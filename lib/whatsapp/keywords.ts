type KeywordResponse = {
  match: boolean;
  message: string;
};

const KEYWORD_MAP: Record<string, string> = {
  RADAR: `🎯 *Radar PB — Inteligência de Leilões*

Alertas filtrados com 48h de antecedência, score de oportunidade (0–10), análise jurídica e estimativa de lucro.

*R$197/mês* • Cancele quando quiser • Garantia de 7 dias

👉 Saiba mais e assine agora:
${process.env.NEXT_PUBLIC_APP_URL}/radar`,

  MENTORIA: `🏆 *Mentoria Lance Certo*

Acompanhamento individual para arrematar com segurança, estratégia e máximo retorno.

Vagas limitadas. Candidate-se agora:
👉 ${process.env.NEXT_PUBLIC_APP_URL}/mentoria`,

  "COMO FUNCIONA": `📚 *Como funciona o Alerta Leilões PB:*

🆓 *Nível 1 — Grupo Gratuito*
Alertas semanais e conteúdo educativo. Para quem está aprendendo.

🎯 *Nível 2 — Radar PB (R$197/mês)*
Alertas antecipados, score, análise jurídica. Para quem quer agir.

🏆 *Nível 3 — Mentoria Lance Certo*
1:1 para arrematar com total segurança. Vagas limitadas.

Qual nível faz mais sentido pra você hoje?`,

  PRECO: `💰 *Tabela de planos:*

🆓 *Grupo Gratuito* — R$ 0
→ Alertas semanais + conteúdo educativo
→ ${process.env.NEXT_PUBLIC_APP_URL}/grupo

🎯 *Radar PB* — R$197/mês
→ Alertas 48h antes + score + análise jurídica + estimativa de lucro
→ ${process.env.NEXT_PUBLIC_APP_URL}/radar

🏆 *Lance Certo (Mentoria)* — Sob consulta
→ Acompanhamento 1:1 completo
→ ${process.env.NEXT_PUBLIC_APP_URL}/mentoria`,
};

export function getKeywordResponse(message: string): KeywordResponse {
  const normalized = message.trim().toUpperCase();
  const matched = Object.keys(KEYWORD_MAP).find((k) => normalized.includes(k));

  if (matched) {
    return { match: true, message: KEYWORD_MAP[matched] };
  }

  return { match: false, message: "" };
}
