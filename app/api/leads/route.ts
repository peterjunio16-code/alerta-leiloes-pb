import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { getBoasVindas } from "@/lib/whatsapp/messages";
import { GRUPO_LINK } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, whatsapp, origem = "grupo" } = body;

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios" },
        { status: 400 }
      );
    }

    const phone = formatPhone(whatsapp);
    const supabase = createServiceClient();

    // Check if lead already exists
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("whatsapp", phone)
      .single();

    const isNew = !existing;

    // Upsert lead (avoid duplicates by phone)
    const { data: lead, error } = await supabase
      .from("leads")
      .upsert(
        { nome, whatsapp: phone, origem },
        { onConflict: "whatsapp", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    // Mark welcome as sent immediately so the webhook never sends a duplicate
    await supabase.from("leads").update({ boas_vindas_enviado: true }).eq("id", lead.id);

    // Schedule nurture sequence ONLY for new leads (not re-registrations)
    if (isNew) {
      const diasSequencia = [1, 3, 7, 14];
      // Delete any pending duplicates first to avoid sending multiple times
      await supabase
        .from("sequencias_nutricao")
        .delete()
        .eq("lead_id", lead.id)
        .eq("enviado", false);
      supabase.from("sequencias_nutricao").insert(
        diasSequencia.map((dia) => ({ lead_id: lead.id, dia }))
      ).then(({ error: seqErr }) => {
        if (seqErr) console.error("Sequencia insert error:", seqErr);
      });
    }

    // Send welcome — await so it completes before the function terminates
    console.log("[leads] sending welcome to:", phone, "nome:", nome);
    try {
      await sendWhatsAppTemplate(phone, "boas_vindas_alerta", "pt_BR", [nome]);
      console.log("[leads] template sent OK to:", phone);
    } catch (templateErr) {
      console.error("[leads] template failed:", templateErr);
      // Fallback to free-form (requires 24h window)
      try {
        await sendWhatsAppMessage(phone, getBoasVindas(nome, GRUPO_LINK));
        console.log("[leads] free-form fallback sent to:", phone);
      } catch (freeformErr) {
        console.error("[leads] free-form also failed:", freeformErr);
      }
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("POST /api/leads:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
