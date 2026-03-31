import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

export async function POST(request: NextRequest) {
  try {
    const { imovelId } = await request.json();
    const supabase = createServiceClient();

    const { data: imovel, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", imovelId)
      .single();

    if (error || !imovel) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    await supabase.from("imoveis").update({ status: "publicado" }).eq("id", imovelId);

    const { data: leads } = await supabase
      .from("leads")
      .select("whatsapp, nome")
      .eq("status", "ativo")
      .limit(50);

    const desconto = imovel.desconto ? `${imovel.desconto}%` : "significativo";
    const dataLeilao = imovel.data_leilao
      ? new Date(imovel.data_leilao).toLocaleDateString("pt-BR")
      : "Em breve";

    const msg = `🏠 *Novo Alerta — Alerta Leilões PB*

📍 *${imovel.titulo}*
📌 ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}
💰 Lance mínimo: R$ ${imovel.lance_inicial.toLocaleString("pt-BR")}
📉 Desconto: ${desconto} abaixo da avaliação
⭐ Score: ${imovel.score ?? "—"}/10
📅 Data do leilão: ${dataLeilao}
${imovel.link ? `\n🔗 Mais detalhes: ${imovel.link}` : ""}

Quer análise completa? Assine o *Radar PB*:
👉 ${process.env.NEXT_PUBLIC_APP_URL}/radar`;

    if (leads?.length) {
      for (const lead of leads) {
        await sendWhatsAppMessage(lead.whatsapp, msg);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return NextResponse.json({ success: true, notified: leads?.length ?? 0 });
  } catch (err) {
    console.error("Error publishing imóvel:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
