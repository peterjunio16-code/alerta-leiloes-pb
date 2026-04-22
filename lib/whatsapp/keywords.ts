import { RADAR_CHECKOUT_URL, GRUPO_LINK } from "@/lib/constants";

type KeywordResponse = {
  match: boolean;
  message: string;
};

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app";

const KEYWORD_MAP: Record<string, string> = {
  RADAR: `🎯 *Radar PB — Inteligência de Leilões*

Alertas filtrados com 48h de antecedência, score de oportunidade (0–10), análise jurídica e estimativa de lucro.

*R$37,90/mês* • Cancele quando quiser • Garantia de 7 dias

👉 Assine agora:
${RADAR_CHECKOUT_URL}`,

  MENTORIA: `🏆 *Mentoria Lance Certo*

Acompanhamento individual para arrematar com segurança, estratégia e máximo retorno.

Vagas limitadas. Candidate-se agora:
👉 ${APP}/mentoria`,

  "COMO FUNCIONA": `📚 *Como funciona o Alerta Leilões PB:*

🆓 *Nível 1 — Grupo Gratuito*
Alertas semanais e conteúdo educativo. Para quem está aprendendo.

🎯 *Nível 2 — Radar PB (R$37,90/mês)*
Alertas antecipados, score, análise jurídica. Para quem quer agir.

🏆 *Nível 3 — Mentoria Lance Certo*
1:1 para arrematar com total segurança. Vagas limitadas.

Qual nível faz mais sentido pra você hoje?`,

  "NIVEL 1": `🆓 *Grupo Gratuito — Nível 1*

Você já está aqui! Toda semana você recebe:
→ Alertas de imóveis em leilão na Paraíba
→ Conteúdo educativo sobre o processo
→ Cases reais de arrematações

Quer dar o próximo passo? Digite *RADAR* para conhecer o Nível 2.`,

  "NIVEL 2": `🎯 *Radar PB — Nível 2*

Para quem quer *agir com inteligência*:

✅ Alertas 48h antes dos leilões
✅ Score de oportunidade (0–10) por imóvel
✅ Análise jurídica resumida
✅ Estimativa de lucro

*R$37,90/mês* • Cancele quando quiser

👉 Assine agora:
${RADAR_CHECKOUT_URL}`,

  "NIVEL 3": `🏆 *Mentoria Lance Certo — Nível 3*

Para quem quer arrematar com *total segurança*:

✅ Sessões 1:1 com análise do seu perfil
✅ Estratégia personalizada de lance
✅ Due diligence completa do imóvel
✅ Suporte no dia do leilão
✅ Pós-arrematação: imissão de posse

Vagas limitadas. Candidate-se:
👉 ${APP}/mentoria`,

  PRECO: `💰 *Tabela de planos:*

🆓 *Grupo Gratuito* — R$ 0
→ Alertas semanais + conteúdo educativo

🎯 *Radar PB* — R$37,90/mês
→ Alertas 48h antes + score + análise jurídica + estimativa de lucro
→ ${RADAR_CHECKOUT_URL}

🏆 *Lance Certo (Mentoria)* — Sob consulta
→ Acompanhamento 1:1 completo
→ ${APP}/mentoria`,

  GRUPO: `👥 *Grupo Gratuito do Alerta Leilões PB*

Entre agora e receba alertas semanais de imóveis em leilão na Paraíba:

👉 ${GRUPO_LINK}`,
};

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getKeywordResponse(message: string): KeywordResponse {
  const normalized = removeAccents(message.trim().toUpperCase());

  const matched = Object.keys(KEYWORD_MAP).find((k) =>
    normalized.includes(removeAccents(k))
  );

  if (matched) {
    return { match: true, message: KEYWORD_MAP[matched] };
  }

  return { match: false, message: "" };
}
