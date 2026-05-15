import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

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
        text: "🏠 Alerta Leilões PB",
      },
      {
        type: "BODY",
        text: "📍 *{{1}}*\n📌 {{2}}\n💰 Lance a partir de *{{3}}*\n📉 Desconto: *{{4}}%* abaixo da avaliação\n📅 Leilão: {{5}}\n\n🔗 Ver imóvel: {{6}}\n\n━━━━━━━━━━━\nQuer análise completa com score, riscos e estratégia de lance?\n👉 Assine o Radar PB: {{7}}",
        example: {
          body_text: [[
            "Apto 3 qtos — Miramar",
            "João Pessoa / PB",
            "R$ 122.000",
            "62",
            "15/06/2026",
            "https://leilaoninja.com.br/imovel/123",
            "https://alerta-leiloes-pb.vercel.app/radar",
          ]],
        },
      },
      {
        type: "FOOTER",
        text: "Alerta Leilões PB • Paraíba",
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
        text: "🎯 RADAR PB — Oportunidade Analisada",
      },
      {
        type: "BODY",
        text: "🏘️ *{{1}}*\n📍 {{2}}\n\n💰 Avaliação: {{3}}\n🏷️ Lance inicial: *{{4}}*\n📉 Desconto: *{{5}}%*\n⭐ Score Radar: *{{6}}/10*\n📅 Data do leilão: {{7}}\n\n🔗 Ver imóvel completo: {{8}}",
        example: {
          body_text: [[
            "Apto 3 qtos — Miramar",
            "João Pessoa / PB",
            "R$ 320.000",
            "R$ 122.000",
            "62",
            "9.1",
            "15/06/2026",
            "https://leilaoninja.com.br/imovel/123",
          ]],
        },
      },
      {
        type: "FOOTER",
        text: "Você recebe isso por ser assinante do Radar PB",
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
        text: "⏰ Leilão em 48 horas!",
      },
      {
        type: "BODY",
        text: "Olá! Lembrete do imóvel que você marcou:\n\n🏠 *{{1}}*\n📍 {{2}}\n💰 Lance mínimo: *{{3}}*\n📅 Data: *{{4}}*\n\n🔗 Edital: {{5}}\n\nNão esqueça de verificar o edital e os documentos antes de participar!",
        example: {
          body_text: [[
            "Apto 3 qtos — Miramar",
            "João Pessoa / PB",
            "R$ 122.000",
            "15/06/2026 às 10h",
            "https://leilaoninja.com.br/imovel/123",
          ]],
        },
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
        text: "{{1}}, como analisamos cada imóvel? 🔍\n\nUsamos 6 critérios objetivos:\n\n✅ Desconto no lance\n✅ Localização e liquidez\n✅ Situação de ocupação\n✅ Ônus e débitos\n✅ Risco jurídico\n✅ Tipo do imóvel\n\nCada critério recebe uma nota. Imóveis com *score acima de 7* são os que priorizamos nos alertas.\n\nQuer receber essas análises completas? Acesse: {{2}}",
        example: { body_text: [["Peter", "https://alerta-leiloes-pb.vercel.app/radar"]] },
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
        text: "{{1}}, uma pergunta direta 🤔\n\nVocê já pensou em investir em leilões de imóveis mas sente insegurança de como começar?\n\nEssa é a maior trava que vemos. E é exatamente por isso que criamos o *Radar PB*: para você receber apenas as oportunidades já filtradas, analisadas e pontuadas.\n\nSem precisar vasculhar centenas de editais sozinho.\n\nConheça o Radar PB: {{2}}",
        example: { body_text: [["Peter", "https://alerta-leiloes-pb.vercel.app/radar"]] },
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
        text: "{{1}}, já faz 2 semanas! 🏆\n\nDesde que você se cadastrou, monitoramos dezenas de leilões na Paraíba.\n\nAssinantes do *Radar PB* recebem:\n⭐ Score completo de cada imóvel\n⚖️ Análise de riscos jurídicos\n🔔 Alertas 48h antes do leilão\n📊 Estimativa de oportunidade\n\nGaranta sua vaga antes que as vagas esgotem: {{2}}",
        example: { body_text: [["Peter", "https://alerta-leiloes-pb.vercel.app/radar"]] },
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
        text: "{{1}}, vi que você tem interesse em leilões de imóveis! 🏠\n\nEstamos abrindo vagas para a *Mentoria Leilões PB*, onde você aprende na prática a analisar, avaliar e arrematar imóveis com segurança na Paraíba.\n\nAs vagas são limitadas e priorizamos quem está pronto para agir.\n\n👉 Candidate-se agora: {{2}}",
        example: { body_text: [["Peter", "https://alerta-leiloes-pb.vercel.app/mentoria"]] },
      },
    ],
  },
];

// GET — lista templates existentes no WABA
export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 500 });

  // Busca o WABA ID a partir do phone number ID
  const wabaRes = await fetch(`${API}/${phoneId}?fields=whatsapp_business_account`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wabaData = await wabaRes.json();
  const wabaId = wabaData?.whatsapp_business_account?.id;
  if (!wabaId) return NextResponse.json({ erro: "WABA ID não encontrado", detalhe: wabaData }, { status: 500 });

  // Lista templates existentes
  const res = await fetch(`${API}/${wabaId}/message_templates?limit=100&fields=name,status,category,language`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  return NextResponse.json({
    waba_id: wabaId,
    templates_existentes: data?.data ?? [],
    templates_necessarios: TEMPLATES.map((t) => t.name),
  });
}

// POST — envia todos os templates para aprovação na Meta
export async function POST(request: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { apenas } = await request.json().catch(() => ({ apenas: null }));

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 500 });

  // Busca o WABA ID
  const wabaRes = await fetch(`${API}/${phoneId}?fields=whatsapp_business_account`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wabaData = await wabaRes.json();
  const wabaId = wabaData?.whatsapp_business_account?.id;
  if (!wabaId) return NextResponse.json({ erro: "WABA ID não encontrado", detalhe: wabaData }, { status: 500 });

  const lista = apenas ? TEMPLATES.filter((t) => t.name === apenas) : TEMPLATES;
  const resultados: Array<{ nome: string; status: string; detalhe: unknown }> = [];

  for (const template of lista) {
    const res = await fetch(`${API}/${wabaId}/message_templates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });
    const data = await res.json();
    resultados.push({
      nome: template.name,
      status: res.ok ? "✅ Enviado para aprovação" : "❌ Erro",
      detalhe: data,
    });
    // Pequena pausa para não sobrecarregar a API
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({ waba_id: wabaId, resultados });
}
