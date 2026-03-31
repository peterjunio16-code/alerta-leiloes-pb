import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import {
  getSequenciaD1,
  getSequenciaD3,
  getSequenciaD7,
  getSequenciaD14,
} from "@/lib/whatsapp/messages";

const SEQUENCIA_MAP: Record<number, (nome: string) => string> = {
  1: getSequenciaD1,
  3: getSequenciaD3,
  7: getSequenciaD7,
  14: getSequenciaD14,
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  let processed = 0;

  for (const dia of [1, 3, 7, 14]) {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - dia);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data: sequences } = await supabase
      .from("sequencias_nutricao")
      .select("*, leads(nome, whatsapp)")
      .eq("dia", dia)
      .eq("enviado", false)
      .lte("created_at", `${cutoffStr}T23:59:59Z`)
      .limit(50);

    if (!sequences?.length) continue;

    for (const seq of sequences) {
      const lead = seq.leads as { nome: string; whatsapp: string } | null;
      if (!lead) continue;

      const messageFn = SEQUENCIA_MAP[dia];
      if (!messageFn) continue;

      try {
        await sendWhatsAppMessage(lead.whatsapp, messageFn(lead.nome));
        await supabase
          .from("sequencias_nutricao")
          .update({ enviado: true, enviado_em: now.toISOString() })
          .eq("id", seq.id);
        processed++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(
          `Failed to send sequence day ${dia} to ${lead.whatsapp}:`,
          err
        );
      }
    }
  }

  return NextResponse.json({ success: true, processed });
}
