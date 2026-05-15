import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";
import type { Database } from "@/lib/supabase/types";
import {
  getSequenciaD1,
  getSequenciaD3,
  getSequenciaD7,
  getSequenciaD14,
} from "@/lib/whatsapp/messages";

type SeqRow = Database["public"]["Tables"]["sequencias_nutricao"]["Row"] & {
  leads: { nome: string; whatsapp: string } | null;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app";

// Nome do template e parâmetros para cada dia
const TEMPLATE_MAP: Record<number, (nome: string) => { name: string; params: string[] }> = {
  1:  (nome) => ({ name: "nutricao_leiloes_d1",  params: [nome] }),
  3:  (nome) => ({ name: "nutricao_leiloes_d3",  params: [nome, `${APP_URL}/radar`] }),
  7:  (nome) => ({ name: "nutricao_leiloes_d7",  params: [nome, `${APP_URL}/radar`] }),
  14: (nome) => ({ name: "nutricao_leiloes_d14", params: [nome, `${APP_URL}/radar`] }),
};

// Fallback em texto livre caso o template ainda não esteja aprovado
const FALLBACK_MAP: Record<number, (nome: string) => string> = {
  1:  getSequenciaD1,
  3:  getSequenciaD3,
  7:  getSequenciaD7,
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
  let errors = 0;

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
      .limit(50) as { data: SeqRow[] | null };

    if (!sequences?.length) continue;

    for (const seq of sequences) {
      const lead = seq.leads;
      if (!lead) continue;

      const templateFn = TEMPLATE_MAP[dia];
      const fallbackFn = FALLBACK_MAP[dia];
      if (!templateFn) continue;

      const { name, params } = templateFn(lead.nome);

      try {
        // Tenta template aprovado primeiro
        try {
          await sendWhatsAppTemplate(lead.whatsapp, name, "pt_BR", params);
        } catch {
          // Fallback: texto livre (só funciona dentro da janela 24h)
          await sendWhatsAppMessage(lead.whatsapp, fallbackFn(lead.nome));
        }

        await supabase
          .from("sequencias_nutricao")
          .update({ enviado: true, enviado_em: now.toISOString() })
          .eq("id", seq.id);
        processed++;
      } catch (err) {
        console.error(`Failed to send sequence day ${dia} to ${lead.whatsapp}:`, err);
        errors++;
      }

      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return NextResponse.json({ success: true, processed, errors });
}
