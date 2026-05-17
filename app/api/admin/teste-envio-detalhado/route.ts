import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) return digits;
  if (digits.length === 12 && digits.startsWith("55")) return digits;
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 10) return `55${digits}`;
  return digits;
}

async function sendText(phoneNumberId: string, token: string, to: string, body: string) {
  const t0 = Date.now();
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  return {
    status: res.status,
    duration_ms: Date.now() - t0,
    body: await res.json(),
  };
}

export async function GET() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    return NextResponse.json({ erro: "Credenciais não configuradas" }, { status: 500 });
  }

  const supabase = createServiceClient();

  // Lista todos os leads
  const { data: leads } = await supabase
    .from("leads")
    .select("id, nome, whatsapp, status, created_at")
    .order("created_at", { ascending: true });

  const resultados = [];

  for (const lead of leads ?? []) {
    const original = lead.whatsapp;
    const normalizado = normalizePhone(lead.whatsapp ?? "");

    // 3 testes para cada lead
    const teste_curto = await sendText(phoneNumberId, token, normalizado,
      "Teste 1 curto"
    );

    await new Promise((r) => setTimeout(r, 500));

    const teste_emoji = await sendText(phoneNumberId, token, normalizado,
      "🏠 Teste 2 com emoji"
    );

    await new Promise((r) => setTimeout(r, 500));

    const teste_longo = await sendText(phoneNumberId, token, normalizado,
      `🏠 *Teste 3 LONGO*\n\nApartamento em *João Pessoa — Manaíra*\n📉 Desconto: *acima de 40%*\n💰 Lance: *R$ 180.000*\n📅 Leilão: 05/06/2026\n\n⭐ Quer mais? https://alerta-leiloes-pb.vercel.app/radar\n\n_Análise informativa._`
    );

    resultados.push({
      lead: {
        nome: lead.nome,
        original,
        normalizado,
        status: lead.status,
        created_at: lead.created_at,
      },
      teste_1_curto: {
        body: "Teste 1 curto",
        http: teste_curto.status,
        duration_ms: teste_curto.duration_ms,
        meta_response: teste_curto.body,
      },
      teste_2_emoji: {
        body: "🏠 Teste 2 com emoji",
        http: teste_emoji.status,
        duration_ms: teste_emoji.duration_ms,
        meta_response: teste_emoji.body,
      },
      teste_3_longo: {
        body: "(formato igual ao gratuito)",
        http: teste_longo.status,
        duration_ms: teste_longo.duration_ms,
        meta_response: teste_longo.body,
      },
    });

    await new Promise((r) => setTimeout(r, 800));
  }

  return NextResponse.json({
    total_leads: leads?.length ?? 0,
    instrucoes: "Aguarde 30 segundos depois desta requisição e cheque o WhatsApp. Cada lead deveria receber 3 mensagens (curta, emoji, longa). Compare com os resultados abaixo.",
    resultados,
  });
}
