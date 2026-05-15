import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** Normaliza número para formato E.164 sem o +: 5583999999999 */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) return digits;
  if (digits.length === 12 && digits.startsWith("55")) return digits;
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 10) return `55${digits}`;
  return digits;
}

async function sendRaw(phoneNumberId: string, token: string, to: string, payload: object) {
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  return { status: res.status, body: await res.json() };
}

export async function GET() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    return NextResponse.json({ erro: "Credenciais não configuradas" }, { status: 500 });
  }

  const supabase = createServiceClient();

  // Busca primeiros 5 leads para ver formato dos números
  const { data: leads } = await supabase
    .from("leads")
    .select("id, nome, whatsapp, status")
    .neq("status", "inativo")
    .limit(5);

  const numeros = (leads ?? []).map((l) => ({
    nome: l.nome,
    whatsapp_original: l.whatsapp,
    whatsapp_normalizado: normalizePhone(l.whatsapp ?? ""),
    status: l.status,
  }));

  // Pega o primeiro número para teste
  const primeiroLead = leads?.[0];
  if (!primeiroLead) {
    return NextResponse.json({ erro: "Nenhum lead ativo na base", numeros });
  }

  const toNorm = normalizePhone(primeiroLead.whatsapp ?? "");
  const toOriginal = primeiroLead.whatsapp;

  // Teste 1: template hello_world (sempre aprovado pela Meta)
  const testeHelloWorld = await sendRaw(phoneNumberId, token, toNorm, {
    to: toNorm,
    type: "template",
    template: {
      name: "hello_world",
      language: { code: "en_US" },
    },
  });

  // Teste 2: template alerta_imovel_gratuito (nosso template customizado)
  const testeTemplateCustom = await sendRaw(phoneNumberId, token, toNorm, {
    to: toNorm,
    type: "template",
    template: {
      name: "alerta_imovel_gratuito",
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: "Apartamento Teste" },
            { type: "text", text: "João Pessoa — Manaíra" },
            { type: "text", text: "R$ 150.000" },
            { type: "text", text: "42" },
            { type: "text", text: "20/06/2025" },
            { type: "text", text: "https://wa.me/5583981995301" },
            { type: "text", text: "https://alerta-leiloes-pb.vercel.app/radar" },
          ],
        },
      ],
    },
  });

  // Teste 3: texto livre (funciona apenas dentro da janela 24h)
  const testeTextoLivre = await sendRaw(phoneNumberId, token, toNorm, {
    to: toNorm,
    type: "text",
    text: { body: "🔔 Teste diagnóstico - sistema Alerta Leilões PB" },
  });

  return NextResponse.json({
    numero_testado: {
      original: toOriginal,
      normalizado: toNorm,
      lead: primeiroLead.nome,
    },
    numeros_na_base: numeros,
    testes: {
      hello_world: {
        descricao: "Template hello_world (sempre aprovado pela Meta)",
        sucesso: testeHelloWorld.status === 200 && !testeHelloWorld.body.error,
        http: testeHelloWorld.status,
        resposta: testeHelloWorld.body,
      },
      template_gratuito: {
        descricao: "Template alerta_imovel_gratuito (nosso template customizado)",
        sucesso: testeTemplateCustom.status === 200 && !testeTemplateCustom.body.error,
        http: testeTemplateCustom.status,
        resposta: testeTemplateCustom.body,
      },
      texto_livre: {
        descricao: "Mensagem de texto livre (só funciona se lead enviou msg. nas últimas 24h)",
        sucesso: testeTextoLivre.status === 200 && !testeTextoLivre.body.error,
        http: testeTextoLivre.status,
        resposta: testeTextoLivre.body,
      },
    },
    instrucoes: {
      se_hello_world_falhou: "Seu token está inválido ou o número não tem permissão de envio. Verifique WHATSAPP_ACCESS_TOKEN.",
      se_hello_world_ok_mas_gratuito_falhou: "O template alerta_imovel_gratuito não está aprovado na Meta. Vá em /admin/templates e clique em Submeter.",
      se_numero_diferente: "Se whatsapp_original != whatsapp_normalizado, o formato estava errado e estava causando as falhas.",
    },
  });
}
