import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { getMentoriaAdminAlert } from "@/lib/whatsapp/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, whatsapp, participou_leilao, orcamento, trava } = body;

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const phone = formatPhone(whatsapp);
    const supabase = createServiceClient();

    // Upsert lead
    const { data: lead } = await supabase
      .from("leads")
      .upsert({ nome, whatsapp: phone, origem: "mentoria" }, { onConflict: "whatsapp" })
      .select()
      .single();

    // Save application
    const respostas = { nome, whatsapp: phone, participou_leilao, orcamento, trava };
    await supabase.from("aplicacoes_mentoria").insert({
      lead_id: lead?.id,
      nome,
      whatsapp: phone,
      participou_leilao: participou_leilao === "sim",
      orcamento,
      trava,
      respostas,
    });

    // Notify admin via WhatsApp (non-blocking)
    const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
    if (adminNumber) {
      sendWhatsAppMessage(adminNumber, getMentoriaAdminAlert(respostas)).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving mentoria application:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
