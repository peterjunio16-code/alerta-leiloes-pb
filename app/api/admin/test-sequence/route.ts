/**
 * POST /api/admin/test-sequence
 *
 * Dispara manualmente uma mensagem de régua para qualquer número.
 * Útil para testar conteúdo antes de ativar o cron.
 *
 * Body: { whatsapp: "5583981995301", tipo: "gratuito" | "radar", dia: 1 | 3 | 7 | 14 | 30, nome?: "Peter" }
 * Header: x-admin-secret: <ADMIN_SECRET>
 */
import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import {
  getSequenciaD1,
  getSequenciaD3,
  getSequenciaD7,
  getSequenciaD14,
  getRadarOnboardingD1,
  getRadarOnboardingD3,
  getRadarOnboardingD7,
  getRadarOnboardingD30,
} from "@/lib/whatsapp/messages";

const MENSAGENS: Record<string, Record<number, (nome: string) => string>> = {
  gratuito: {
    1:  getSequenciaD1,
    3:  getSequenciaD3,
    7:  getSequenciaD7,
    14: getSequenciaD14,
  },
  radar: {
    1:  getRadarOnboardingD1,
    3:  getRadarOnboardingD3,
    7:  getRadarOnboardingD7,
    30: getRadarOnboardingD30,
  },
};

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (secret && request.headers.get("x-admin-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { whatsapp?: string; tipo?: string; dia?: number; nome?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { whatsapp, tipo = "gratuito", dia, nome = "Investidor" } = body;

  if (!whatsapp) {
    return NextResponse.json({ error: "whatsapp is required" }, { status: 400 });
  }
  if (!dia) {
    return NextResponse.json({ error: "dia is required (1, 3, 7, 14 or 30)" }, { status: 400 });
  }

  const tipoMap = MENSAGENS[tipo];
  if (!tipoMap) {
    return NextResponse.json({ error: `tipo inválido: ${tipo}. Use 'gratuito' ou 'radar'` }, { status: 400 });
  }

  const msgFn = tipoMap[dia];
  if (!msgFn) {
    const diasDisponiveis = Object.keys(tipoMap).join(", ");
    return NextResponse.json({ error: `dia inválido para tipo '${tipo}'. Dias disponíveis: ${diasDisponiveis}` }, { status: 400 });
  }

  const mensagem = msgFn(nome);

  try {
    await sendWhatsAppMessage(whatsapp, mensagem);
    return NextResponse.json({
      success: true,
      enviado_para: whatsapp,
      tipo,
      dia,
      nome,
      preview: mensagem.slice(0, 120) + (mensagem.length > 120 ? "…" : ""),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Falha ao enviar WhatsApp", detail: msg }, { status: 502 });
  }
}
