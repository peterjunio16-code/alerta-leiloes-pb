import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";

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

    // Upsert lead (avoid duplicates by phone)
    const { data: lead, error } = await supabase
      .from("leads")
      .upsert(
        { nome, whatsapp: phone, origem },
        { onConflict: "whatsapp", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;

    // Schedule nurture sequence (days 1, 3, 7, 14)
    const diasSequencia = [1, 3, 7, 14];
    await supabase.from("sequencias_nutricao").insert(
      diasSequencia.map((dia) => ({ lead_id: lead.id, dia }))
    );

    // Fire-and-forget: send welcome WhatsApp (will be implemented in Task 10)
    // sendWhatsAppMessage(phone, getBoasVindas(nome)).catch(console.error);

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("POST /api/leads:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
