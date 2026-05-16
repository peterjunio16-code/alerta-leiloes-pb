import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

export const maxDuration = 60; // 60s para evitar timeout durante submissão

const API = "https://graph.facebook.com/v20.0";

// Todos os templates da jornada do cliente
const TEMPLATES = [
  // ─────────────────────────────────────────────
  // 1. BOAS-VINDAS (UTILITY) — enviado ao se cadastrar
  // ─────────────────────────────────────────────
  {
    name: "boas_vindas_alerta",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Olá {{1}}! 👋\n\nBem-vindo ao *Alerta Leilões PB*!\n\nVocê agora receberá alertas de imóveis em leilão na Paraíba com score de oportunidade, análise de riscos e link direto para o edital.\n\n📌 Em breve você receberá o primeiro alerta.\n\nQualquer dúvida, é só responder esta mensagem.",
        example: { body_text: [["Peter"]] },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. ALERTA IMÓVEL — GRUPO GRATUITO (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "alerta_imovel_gratuito",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Alerta Leiloes PB",
      },
      {
        type: "BODY",
        text: "Novo imóvel em leilão:\n\n📍 *{{1}}*\n📌 {{2}}\n💰 Lance a partir de *{{3}}*\n📉 Desconto: *{{4}}%* abaixo da avaliação\n📅 Leilão: {{5}}\n\nVeja mais detalhes nos botões abaixo.",
        example: {
          body_text: [[
            "Apto 3 qtos — Miramar",
            "João Pessoa / PB",
            "R$ 122.000",
            "62",
            "15/06/2026",
          ]],
        },
      },
      {
        type: "FOOTER",
        text: "Alerta Leilões PB • Paraíba",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Ver imóvel",
            url: "https://alerta-leiloes-pb.vercel.app/{{1}}",
            example: ["https://alerta-leiloes-pb.vercel.app/imoveis/abc123"],
          },
          {
            type: "URL",
            text: "Análise completa (Radar)",
            url: "https://alerta-leiloes-pb.vercel.app/radar",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. ALERTA IMÓVEL — RADAR PB PREMIUM (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "alerta_imovel_radar",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Radar PB - Oportunidade Analisada",
      },
      {
        type: "BODY",
        text: "Oportunidade analisada pelo Radar:\n\n🏘️ *{{1}}*\n📍 {{2}}\n\n💰 Avaliação: {{3}}\n🏷️ Lance inicial: *{{4}}*\n📉 Desconto: *{{5}}%*\n⭐ Score Radar: *{{6}}/10*\n📅 Data do leilão: {{7}}\n\nClique no botão abaixo para ver o anúncio completo.",
        example: {
          body_text: [[
            "Apto 3 qtos — Miramar",
            "João Pessoa / PB",
            "R$ 320.000",
            "R$ 122.000",
            "62",
            "9.1",
            "15/06/2026",
          ]],
        },
      },
      {
        type: "FOOTER",
        text: "Você recebe isso por ser assinante do Radar PB",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Ver imóvel completo",
            url: "https://alerta-leiloes-pb.vercel.app/{{1}}",
            example: ["https://alerta-leiloes-pb.vercel.app/imoveis/abc123"],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. LEMBRETE 48H ANTES DO LEILÃO (UTILITY)
  // ─────────────────────────────────────────────
  {
    name: "lembrete_leilao_48h",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Leilao em 48 horas",
      },
      {
        type: "BODY",
        text: "Olá! Lembrete do imóvel que você marcou:\n\n🏠 *{{1}}*\n📍 {{2}}\n💰 Lance mínimo: *{{3}}*\n📅 Data: *{{4}}*\n\nNão esqueça de verificar o edital e os documentos antes de participar!",
        example: {
          body_text: [[
            "Apto 3 qtos — Miramar",
            "João Pessoa / PB",
            "R$ 122.000",
            "15/06/2026 às 10h",
          ]],
        },
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Ver edital",
            url: "https://leilaoninja.com.br/{{1}}",
            example: ["https://leilaoninja.com.br/imovel/123"],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. NUTRIÇÃO DIA 1 (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "nutricao_leiloes_d1",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Olá {{1}}! 🏠\n\nVocê sabia que imóveis em leilão na Paraíba chegam a ter descontos de até *60%* do valor de mercado?\n\nO segredo está em saber onde procurar e como analisar *antes* de dar o lance.\n\nNos próximos dias vou te mostrar exatamente como fazemos isso no Alerta Leilões PB. 🎯\n\nFique de olho!",
        example: { body_text: [["Peter"]] },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. NUTRIÇÃO DIA 3 (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "nutricao_leiloes_d3",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Olá {{1}}, como analisamos cada imóvel? 🔍\n\nUsamos 6 critérios objetivos:\n\n✅ Desconto no lance\n✅ Localização e liquidez\n✅ Situação de ocupação\n✅ Ônus e débitos\n✅ Risco jurídico\n✅ Tipo do imóvel\n\nCada critério recebe uma nota. Imóveis com *score acima de 7* são os que priorizamos nos alertas.\n\nQuer receber essas análises completas?",
        example: { body_text: [["Peter"]] },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Conhecer Radar PB", url: "https://alerta-leiloes-pb.vercel.app/radar" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. NUTRIÇÃO DIA 7 (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "nutricao_leiloes_d7",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Oi {{1}}, uma pergunta direta 🤔\n\nVocê já pensou em investir em leilões de imóveis mas sente insegurança de como começar?\n\nEssa é a maior trava que vemos. E é exatamente por isso que criamos o *Radar PB*: para você receber apenas as oportunidades já filtradas, analisadas e pontuadas.\n\nSem precisar vasculhar centenas de editais sozinho.",
        example: { body_text: [["Peter"]] },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Conhecer Radar PB", url: "https://alerta-leiloes-pb.vercel.app/radar" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. NUTRIÇÃO DIA 14 (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "nutricao_leiloes_d14",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Oi {{1}}, já faz 2 semanas! 🏆\n\nDesde que você se cadastrou, monitoramos dezenas de leilões na Paraíba.\n\nAssinantes do *Radar PB* recebem:\n⭐ Score completo de cada imóvel\n⚖️ Análise de riscos jurídicos\n🔔 Alertas 48h antes do leilão\n📊 Estimativa de oportunidade\n\nGaranta sua vaga antes que esgotem.",
        example: { body_text: [["Peter"]] },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Assinar Radar PB", url: "https://alerta-leiloes-pb.vercel.app/radar" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. CONVITE MENTORIA (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "convite_mentoria_pb",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Oi {{1}}, vi que você tem interesse em leilões de imóveis! 🏠\n\nEstamos abrindo vagas para a *Mentoria Leilões PB*, onde você aprende na prática a analisar, avaliar e arrematar imóveis com segurança na Paraíba.\n\nAs vagas são limitadas e priorizamos quem está pronto para agir.",
        example: { body_text: [["Peter"]] },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Candidatar-se", url: "https://alerta-leiloes-pb.vercel.app/mentoria" },
        ],
      },
    ],
  },

  // ═════════════════════════════════════════════
  // FUNIL RADAR PB (assinantes pagos)
  // ═════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // 10. BOAS-VINDAS RADAR PB (UTILITY)
  // ─────────────────────────────────────────────
  {
    name: "boas_vindas_radar",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Bem-vindo ao Radar PB",
      },
      {
        type: "BODY",
        text: "Olá {{1}}! Sua assinatura do Radar PB foi confirmada com sucesso.\n\nA partir de agora você recebe:\n⭐ Imóveis com score completo (0 a 10)\n⚖️ Análise de riscos jurídicos\n🔔 Alertas 48h antes do leilão\n📊 Estimativa de oportunidade vs mercado\n\nSeu próximo alerta chega em até 48h.",
        example: { body_text: [["Peter"]] },
      },
      {
        type: "FOOTER",
        text: "Radar PB - Alerta Leilões",
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Acessar Radar", url: "https://alerta-leiloes-pb.vercel.app/radar" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 11. RESUMO SEMANAL RADAR (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "radar_resumo_semanal",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Resumo da semana - Radar PB",
      },
      {
        type: "BODY",
        text: "Olá {{1}}, aqui está o resumo da semana no Radar PB:\n\n🏠 Imóveis analisados: *{{2}}*\n⭐ Com score acima de 7: *{{3}}*\n📉 Maior desconto: *{{4}}%*\n📅 Próximo leilão monitorado: *{{5}}*\n\nAcesse o painel para ver todos os detalhes.",
        example: {
          body_text: [[
            "Peter",
            "12",
            "4",
            "68",
            "20/06/2026",
          ]],
        },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Ver painel completo", url: "https://alerta-leiloes-pb.vercel.app/radar" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 12. DESTAQUE RADAR (score >9) (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "radar_destaque_score_alto",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Oportunidade rara detectada",
      },
      {
        type: "BODY",
        text: "Olá {{1}}, um imóvel com score muito alto entrou no Radar:\n\n🏘️ *{{2}}*\n📍 {{3}}\n⭐ Score: *{{4}}/10*\n💰 Lance: *{{5}}*\n📅 Leilão: {{6}}\n\nImóveis acima de 9 são raros. Avalie com prioridade.",
        example: {
          body_text: [[
            "Peter",
            "Apto 3 qtos Manaira",
            "Joao Pessoa - PB",
            "9.3",
            "R$ 145.000",
            "22/06/2026",
          ]],
        },
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Ver imóvel completo",
            url: "https://leilaoninja.com.br/{{1}}",
            example: ["https://leilaoninja.com.br/imovel/456"],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 13. RENOVAÇÃO PRÓXIMA (UTILITY)
  // ─────────────────────────────────────────────
  {
    name: "radar_renovacao_7d",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Sua assinatura renova em 7 dias",
      },
      {
        type: "BODY",
        text: "Olá {{1}}, sua assinatura do Radar PB renova automaticamente em {{2}}.\n\nValor da renovação: *{{3}}*\n\nSe quiser fazer qualquer alteração, é só responder esta mensagem ou acessar seu painel.",
        example: {
          body_text: [[
            "Peter",
            "22/06/2026",
            "R$ 47,00",
          ]],
        },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Gerenciar assinatura", url: "https://alerta-leiloes-pb.vercel.app/radar" },
        ],
      },
    ],
  },

  // ═════════════════════════════════════════════
  // FUNIL MENTORIA (candidatos aprovados)
  // ═════════════════════════════════════════════

  // ─────────────────────────────────────────────
  // 14. CANDIDATURA APROVADA (UTILITY)
  // ─────────────────────────────────────────────
  {
    name: "mentoria_aprovada",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Sua candidatura foi aprovada",
      },
      {
        type: "BODY",
        text: "Parabéns {{1}}! Sua candidatura para a Mentoria Leilões PB foi *aprovada*.\n\nO próximo passo é agendarmos sua sessão de boas-vindas onde definimos seu plano personalizado.\n\nClique no botão abaixo para escolher o melhor horário.",
        example: { body_text: [["Peter"]] },
      },
      {
        type: "FOOTER",
        text: "Mentoria Leiloes PB",
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Agendar sessão", url: "https://alerta-leiloes-pb.vercel.app/mentoria" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 15. LEMBRETE AULA 24H (UTILITY)
  // ─────────────────────────────────────────────
  {
    name: "mentoria_aula_amanha",
    category: "UTILITY",
    language: "pt_BR",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Sua aula e amanha",
      },
      {
        type: "BODY",
        text: "Oi {{1}}, lembrando que sua aula da Mentoria é amanhã:\n\n📅 *{{2}}*\n⏰ Horário: *{{3}}*\n📚 Tema: *{{4}}*\n\nPrepare suas dúvidas e tenha caneta e caderno em mãos. Até lá!",
        example: {
          body_text: [[
            "Peter",
            "22/06/2026",
            "19h",
            "Análise jurídica de leilões",
          ]],
        },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Entrar na sala", url: "https://alerta-leiloes-pb.vercel.app/mentoria" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 16. MATERIAL NOVO MENTORIA (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "mentoria_material_novo",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Olá {{1}}, disponibilizamos um novo material exclusivo na área de membros:\n\n📚 *{{2}}*\n📝 {{3}}\n\nO material já está liberado para você consultar quando quiser.",
        example: {
          body_text: [[
            "Peter",
            "Guia completo de imissão na posse",
            "PDF com modelos de petição e jurisprudência atualizada",
          ]],
        },
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Acessar material", url: "https://alerta-leiloes-pb.vercel.app/mentoria" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 17. CHECK-IN SEMANAL MENTORIA (MARKETING)
  // ─────────────────────────────────────────────
  {
    name: "mentoria_checkin_semanal",
    category: "MARKETING",
    language: "pt_BR",
    components: [
      {
        type: "BODY",
        text: "Oi {{1}}, esta semana você fez algum progresso prático na sua jornada de leilões?\n\nMesmo pequenos passos contam:\n✅ Visitou algum imóvel\n✅ Consultou matrícula\n✅ Acompanhou um leilão ao vivo\n✅ Conversou com leiloeiro\n\nMe responda aqui qual foi o seu maior aprendizado da semana.",
        example: { body_text: [["Peter"]] },
      },
    ],
  },
];

/** Resolve WABA ID — tenta manual > env > API */
async function resolveWabaId(
  token: string,
  phoneId: string,
  manual?: string | null
): Promise<{ wabaId: string | null; debug: unknown }> {
  if (manual) return { wabaId: manual, debug: { fonte: "manual" } };
  const env = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (env) return { wabaId: env, debug: { fonte: "env" } };
  try {
    const res = await fetch(`${API}/${phoneId}?fields=whatsapp_business_account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return {
      wabaId: data?.whatsapp_business_account?.id ?? null,
      debug: { fonte: "api", http: res.status, response: data },
    };
  } catch (err) {
    return { wabaId: null, debug: { fonte: "api", erro: String(err) } };
  }
}

// GET — lista templates existentes no WABA
export async function GET(request: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 500 });

  const url = new URL(request.url);
  const wabaIdManual = url.searchParams.get("waba_id");
  const { wabaId, debug: wabaDebug } = await resolveWabaId(token, phoneId, wabaIdManual);

  if (!wabaId) {
    return NextResponse.json({
      erro: "WABA ID não encontrado",
      waba_id: null,
      templates_existentes: [],
      templates_necessarios: TEMPLATES.map((t) => t.name),
      debug: wabaDebug,
    });
  }

  // Lista templates existentes
  const res = await fetch(`${API}/${wabaId}/message_templates?limit=100&fields=name,status,category,language`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  return NextResponse.json({
    waba_id: wabaId,
    templates_existentes: data?.data ?? [],
    templates_necessarios: TEMPLATES.map((t) => t.name),
    debug: { http_status: res.status, raw_response_keys: Object.keys(data ?? {}), error: data?.error ?? null },
  });
}

// POST — envia todos os templates para aprovação na Meta
export async function POST(request: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({ apenas: null, waba_id_manual: null }));
  const apenas = body.apenas ?? null;
  const wabaIdManual = body.waba_id_manual ?? null;

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 500 });

  const { wabaId, debug: wabaDebug } = await resolveWabaId(token, phoneId, wabaIdManual);
  if (!wabaId) {
    return NextResponse.json(
      {
        erro: "WABA ID não encontrado",
        solucao: "Cole o WABA ID no campo acima da tabela e clique submeter novamente. Encontre em business.facebook.com → Configurações da empresa → Contas do WhatsApp.",
        debug: wabaDebug,
      },
      { status: 500 }
    );
  }

  const forcar = body.forcar === true; // força atualização de templates já existentes

  // Busca templates existentes com ID (necessário para update)
  const existentesRes = await fetch(
    `${API}/${wabaId}/message_templates?limit=100&fields=name,status,id`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const existentesData = await existentesRes.json();
  const existentesMap: Map<string, string> = new Map(
    (existentesData?.data ?? []).map((t: { name: string; id: string }) => [t.name, t.id])
  );

  const lista = apenas ? TEMPLATES.filter((t) => t.name === apenas) : TEMPLATES;

  // Submete em paralelo (mais rápido, evita timeout)
  const resultados = await Promise.all(
    lista.map(async (template) => {
      const templateId = existentesMap.get(template.name);

      // Se já existe e não é forçado, pula
      if (templateId && !forcar) {
        return {
          nome: template.name,
          http: 200,
          status: "⏭️ Já existe na Meta",
          erro_meta: null,
          detalhe: { skipped: true },
        };
      }

      try {
        let res: Response;

        if (templateId && forcar) {
          // UPDATE: POST /{template_id} com os novos componentes
          res = await fetch(`${API}/${templateId}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ components: template.components }),
          });
        } else {
          // CREATE: POST /{waba_id}/message_templates
          res = await fetch(`${API}/${wabaId}/message_templates`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(template),
          });
        }

        const data = await res.json();
        const errMeta = data?.error;
        const detailedError = errMeta
          ? [
              errMeta.message,
              errMeta.error_user_title,
              errMeta.error_user_msg,
              errMeta.error_data?.details,
              errMeta.error_subcode ? `subcode ${errMeta.error_subcode}` : null,
            ]
              .filter(Boolean)
              .join(" | ")
          : null;
        return {
          nome: template.name,
          http: res.status,
          status: res.ok
            ? (templateId && forcar ? "🔄 Atualizado" : "✅ Enviado para aprovação")
            : "❌ Erro",
          erro_meta: detailedError,
          detalhe: data,
        };
      } catch (err) {
        return {
          nome: template.name,
          http: 0,
          status: "❌ Erro de conexão",
          erro_meta: err instanceof Error ? err.message : String(err),
          detalhe: null,
        };
      }
    })
  );

  const sucesso = resultados.filter((r) => r.status.startsWith("✅") || r.status.startsWith("🔄")).length;
  const falhas = resultados.filter((r) => r.status.startsWith("❌")).length;

  return NextResponse.json({
    waba_id: wabaId,
    sucesso,
    falhas,
    total: resultados.length,
    resultados,
  });
}
