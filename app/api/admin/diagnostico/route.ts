import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createServiceClient();

  // 1. Conta leads
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const { count: leadsAtivos } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .neq("status", "inativo");

  // 2. Conta assinantes radar
  const { count: assinantesAtivos } = await supabase
    .from("assinantes_radar")
    .select("*", { count: "exact", head: true })
    .eq("status", "ativo");

  // 3. Verifica credenciais WhatsApp
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const hasPhoneId = !!phoneNumberId;
  const hasToken = !!token;
  const tokenPreview = token ? `...${token.slice(-8)}` : "NÃO CONFIGURADO";

  // 4. Testa token na API Meta (sem enviar mensagem)
  let tokenValido = false;
  let tokenErro = "";
  if (phoneNumberId && token) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}?fields=display_phone_number,verified_name`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        tokenValido = true;
        tokenErro = `Número: ${data.display_phone_number ?? "?"} | Nome: ${data.verified_name ?? "?"}`;
      } else {
        tokenErro = data?.error?.message ?? JSON.stringify(data);
      }
    } catch (err) {
      tokenErro = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    leads: {
      total: totalLeads ?? 0,
      ativos: leadsAtivos ?? 0,
      inativos: (totalLeads ?? 0) - (leadsAtivos ?? 0),
    },
    radar: {
      assinantes_ativos: assinantesAtivos ?? 0,
    },
    whatsapp: {
      phone_number_id_configurado: hasPhoneId,
      token_configurado: hasToken,
      token_preview: tokenPreview,
      token_valido: tokenValido,
      detalhe: tokenErro || (hasToken ? "Token presente mas não testado" : "Token ausente"),
    },
  });
}
