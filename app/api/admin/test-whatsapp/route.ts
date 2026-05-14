import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const numero = searchParams.get("numero"); // Ex: ?numero=5583999999999

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    return NextResponse.json({ erro: "Credenciais não configuradas" }, { status: 500 });
  }

  // Se não passou número, busca o primeiro lead da base
  let to = numero;
  if (!to) {
    const supabase = createServiceClient();
    const { data: lead } = await supabase
      .from("leads")
      .select("whatsapp, nome")
      .neq("status", "inativo")
      .limit(1)
      .single();
    if (!lead) {
      return NextResponse.json({ erro: "Nenhum lead encontrado na base" });
    }
    to = lead.whatsapp;
  }

  // Tenta enviar mensagem de texto simples
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: "🔔 Teste do sistema Alerta Leilões PB - pode ignorar." },
  };

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const rawResponse = await res.json();

  return NextResponse.json({
    numero_testado: to,
    http_status: res.status,
    api_ok: res.ok,
    resposta_meta: rawResponse,
    // Se der erro, o campo error.message explica o motivo
  });
}
