import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin/auth";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,titulo,slug,publicado,created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { titulo, conteudo, resumo, tags, imagem_url, publicado = false } = body;

  if (!titulo || !conteudo) {
    return NextResponse.json({ error: "titulo e conteudo são obrigatórios" }, { status: 400 });
  }

  const slug = slugify(titulo) + "-" + Date.now().toString(36);
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      titulo,
      slug,
      conteudo,
      resumo: resumo ?? conteudo.slice(0, 200),
      tags: tags ?? [],
      imagem_url: imagem_url ?? null,
      publicado,
    })
    .select("id,slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, id: data.id, slug: data.slug });
}

export async function PATCH(request: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, publicado, titulo, conteudo, resumo } = await request.json();
  const supabase = createServiceClient();
  const update: Record<string, unknown> = {};
  if (publicado !== undefined) update.publicado = publicado;
  if (titulo !== undefined) update.titulo = titulo;
  if (conteudo !== undefined) update.conteudo = conteudo;
  if (resumo !== undefined) update.resumo = resumo;
  const { error } = await supabase.from("blog_posts").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  const supabase = createServiceClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
