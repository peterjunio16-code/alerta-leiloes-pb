import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { getBoasVindasRadar } from "@/lib/whatsapp/messages";

const RADAR_GROUP_LINK = process.env.WHATSAPP_RADAR_GROUP_LINK ?? "";
const KIWIFY_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN ?? "";

export async function POST(request: NextRequest) {
  try {
    // Verify Kiwify signature token
    const token = request.nextUrl.searchParams.get("token");
    if (KIWIFY_TOKEN && token !== KIWIFY_TOKEN) {
      console.warn("[kiwify] Invalid token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[kiwify] webhook received:", JSON.stringify(body).slice(0, 300));

    // Kiwify event types: order_approved, order_refunded, subscription_cancelled
    const event = body?.type ?? body?.event ?? body?.order_status;
    const approved = ["order_approved", "approved", "payment_approved"].includes(event);

    if (!approved) {
      console.log("[kiwify] ignored event:", event);
      return NextResponse.json({ status: "ignored", event });
    }

    // Extract customer info
    const customer = body?.Customer ?? body?.customer ?? {};
    const name = customer?.full_name ?? customer?.name ?? "Assinante";
    const email = customer?.email ?? "";
    const rawPhone = customer?.mobile ?? customer?.phone ?? "";
    const phone = rawPhone ? formatPhone(rawPhone) : null;

    console.log("[kiwify] new subscriber:", { name, email, phone });

    const supabase = createServiceClient();

    // Find or create lead by phone or email
    let leadId: string | null = null;

    if (phone) {
      const { data: byPhone } = await supabase
        .from("leads")
        .select("id")
        .eq("whatsapp", phone)
        .single();
      if (byPhone) leadId = byPhone.id;
    }

    if (!leadId && email) {
      const { data: byEmail } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email)
        .single();
      if (byEmail) leadId = byEmail.id;
    }

    // Create lead if not found
    if (!leadId && phone) {
      const { data: newLead } = await supabase
        .from("leads")
        .insert({ nome: name, whatsapp: phone, origem: "radar" })
        .select("id")
        .single();
      leadId = newLead?.id ?? null;
    }

    if (!leadId) {
      console.error("[kiwify] Could not find or create lead for", { name, email, phone });
      return NextResponse.json({ error: "Lead not found" }, { status: 422 });
    }

    // Create or update radar subscriber record
    const orderId = body?.id ?? body?.order_id ?? null;
    await supabase.from("assinantes_radar").upsert(
      {
        lead_id: leadId,
        status: "ativo",
        plano: "radar",
        data_inicio: new Date().toISOString().split("T")[0],
        kiwify_order_id: orderId,
      },
      { onConflict: "lead_id" }
    );

    // Remove gratuito nurture sequences that haven't been sent yet
    await supabase
      .from("sequencias_nutricao")
      .delete()
      .eq("lead_id", leadId)
      .eq("tipo", "gratuito")
      .eq("enviado", false);

    // Create Radar onboarding sequence (D+1, D+3, D+7, D+30)
    // Only create days that don't already exist for this lead
    const { data: existingRadarSeqs } = await supabase
      .from("sequencias_nutricao")
      .select("dia")
      .eq("lead_id", leadId)
      .eq("tipo", "radar");

    const existingDays = new Set((existingRadarSeqs ?? []).map((s) => s.dia));
    const radarDays = [1, 3, 7, 30].filter((d) => !existingDays.has(d));

    if (radarDays.length > 0) {
      await supabase.from("sequencias_nutricao").insert(
        radarDays.map((dia) => ({ lead_id: leadId, dia, tipo: "radar" }))
      );
    }

    // Mark as radar subscriber in leads table
    await supabase
      .from("leads")
      .update({ origem: "radar", boas_vindas_enviado: true })
      .eq("id", leadId);

    // Send Radar welcome message
    if (phone && RADAR_GROUP_LINK) {
      await sendWhatsAppMessage(phone, getBoasVindasRadar(name, RADAR_GROUP_LINK))
        .catch((err) => console.error("[kiwify] WA welcome failed:", err));
    } else if (phone) {
      await sendWhatsAppMessage(
        phone,
        `🎯 *Parabéns, ${name}!*\n\nSeu acesso ao *Radar PB* foi confirmado!\n\nEm breve você receberá o link do grupo exclusivo de assinantes.\n\nBem-vindo ao clube dos investidores que arrematam com inteligência! 🏆`
      ).catch((err) => console.error("[kiwify] WA welcome failed:", err));
    }

    console.log("[kiwify] subscriber activated:", { name, phone, leadId });
    return NextResponse.json({ success: true, leadId });

  } catch (err) {
    console.error("[kiwify] webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
