import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { decodeSession } from "@/lib/admin/users";
import { cookies } from "next/headers";

function getSession() {
  const cookie = cookies().get("alerta_admin_session");
  if (!cookie?.value) return null;
  return decodeSession(cookie.value);
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "todos";
  const order = searchParams.get("order") ?? "recentes";

  const supabase = createServiceClient();
  let query = supabase.from("imoveis").select("*");

  if (status !== "todos") query = query.eq("status", status);
  if (order === "score") {
    query = query.order("score", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase.from("imoveis").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
