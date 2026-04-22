import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { getMentoriaAdminAlert } from "@/lib/whatsapp/messages";
import { sendEmail } from "@/lib/email/send";

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

    const alertText = getMentoriaAdminAlert(respostas);

    // Notify all admin WhatsApp numbers (non-blocking)
    const adminNumbers: string[] = [];

    // Primary admin number from env
    if (process.env.WHATSAPP_ADMIN_NUMBER) {
      adminNumbers.push(process.env.WHATSAPP_ADMIN_NUMBER);
    }

    // Additional numbers configured for mentoria alerts
    const extraNumbers = process.env.MENTORIA_NOTIFY_NUMBERS;
    if (extraNumbers) {
      extraNumbers.split(",").map((n) => n.trim()).filter(Boolean).forEach((n) => {
        if (!adminNumbers.includes(n)) adminNumbers.push(n);
      });
    }

    for (const num of adminNumbers) {
      sendWhatsAppMessage(num, alertText).catch((err) =>
        console.error(`[mentoria] WhatsApp to ${num} failed:`, err)
      );
    }

    // Email notification (non-blocking)
    const notifyEmail = process.env.MENTORIA_NOTIFY_EMAIL;
    if (notifyEmail) {
      const emailSubject = `Nova candidatura — Mentoria Lance Certo: ${nome}`;
      const emailText = `
Nova candidatura recebida para a Mentoria Lance Certo.

Nome: ${nome}
WhatsApp: ${phone}
Já participou de leilão: ${participou_leilao === "sim" ? "Sim" : "Não"}
Orçamento: ${orcamento}
Principal trava: ${trava}

Ver no painel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/aplicacoes
      `.trim();

      sendEmail({ to: notifyEmail, subject: emailSubject, text: emailText }).catch((err) =>
        console.error("[mentoria] Email notification failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving mentoria application:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
