/**
 * Webhook WhatsApp — resposta automática a qualquer mensagem recebida
 *
 * GET  → verificação do webhook pela Meta
 * POST → processa mensagens e envia boas-vindas automáticas
 *
 * Configurar em: Meta → WhatsApp → Configuração → URL do webhook
 * URL: https://alerta-leiloes-pb.vercel.app/api/whatsapp/webhook
 * Token: valor de WHATSAPP_VERIFY_TOKEN no Vercel env
 */
import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { createServiceClient } from "@/lib/supabase/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "alerta-leiloes-webhook-2026";

const MENSAGEM_BOAS_VINDAS = `👋 Olá! Bem-vindo ao *Alerta Leilões PB* 🏠

Para receber os alertas certinhos, salve este número na sua agenda como:

📲 *Alerta Leilões PB*

Você receberá alertas de imóveis em leilão em João Pessoa e região com:
✅ Score de oportunidade (IA)
✅ Lance mínimo e desconto
✅ Link direto para o imóvel

_Para parar de receber, responda SAIR._`;

const MENSAGEM_SAIDA = `✅ Você foi removido da lista de alertas do *Alerta Leilões PB*.

Se quiser voltar, acesse nosso site e cadastre-se novamente 👍`;

// ── GET: verificação do webhook pela Meta ─────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ── POST: processa mensagens recebidas ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    // Ignora eventos sem mensagem (delivery receipts, status updates, etc)
    if (!messages?.length) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createServiceClient();

    for (const msg of messages) {
      const from = msg.from as string;
      if (msg.type !== "text") continue;

      const texto = (msg.text?.body as string ?? "").trim().toUpperCase();

      // ── Opt-out ──────────────────────────────────────────────────────────
      if (["SAIR", "PARAR", "STOP", "CANCELAR"].includes(texto)) {
        await supabase
          .from("leads")
          .update({ status: "inativo" })
          .eq("whatsapp", from);
        await sendWhatsAppMessage(from, MENSAGEM_SAIDA);
        continue;
      }

      // ── Verifica se já existe na base ────────────────────────────────────
      const { data: lead } = await supabase
        .from("leads")
        .select("id, boas_vindas_enviado")
        .eq("whatsapp", from)
        .maybeSingle();

      if (!lead) {
        // Novo contato — cadastra e envia boas-vindas
        const nomeContato = (value?.contacts?.[0]?.profile?.name as string | null) ?? null;
        await supabase.from("leads").insert({
          whatsapp: from,
          nome: nomeContato,
          status: "ativo",
          boas_vindas_enviado: true,
        });
        await sendWhatsAppMessage(from, MENSAGEM_BOAS_VINDAS);
      } else if (!lead.boas_vindas_enviado) {
        // Lead existente que ainda não recebeu boas-vindas
        await supabase
          .from("leads")
          .update({ boas_vindas_enviado: true })
          .eq("id", lead.id);
        await sendWhatsAppMessage(from, MENSAGEM_BOAS_VINDAS);
      }
      // Demais mensagens: silêncio (não cria loop)
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true }); // sempre 200 — Meta desativa webhook se receber erro
  }
}
