import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { slug: string } }) {
  const supabase = createServiceClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("publicado", true)
    .single();

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#1a1a2e] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/blog" className="text-[#a0a0a0] hover:text-white text-sm mb-8 inline-block">
          ← Voltar ao blog
        </Link>

        {post.imagem_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imagem_url} alt={post.titulo} className="w-full h-64 object-cover rounded-2xl mb-8" />
        )}

        <p className="text-[#a0a0a0] text-sm mb-3">
          {new Date(post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
        <h1 className="text-3xl font-black text-white mb-4 leading-tight">{post.titulo}</h1>
        {post.resumo && <p className="text-[#e63946] font-medium mb-8 text-lg">{post.resumo}</p>}

        <div className="prose prose-invert max-w-none text-[#c0c0d0] leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: post.conteudo.replace(/\n/g, "<br/>") }}
        />

        <div className="mt-12 pt-8 border-t border-[#0f3460]">
          <p className="text-[#a0a0a0] text-sm mb-4">Quer receber alertas de leilões em PB direto no WhatsApp?</p>
          <Link href="/grupo"
            className="inline-block bg-[#e63946] text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors">
            Entrar no Grupo Gratuito →
          </Link>
        </div>
      </div>
    </main>
  );
}
