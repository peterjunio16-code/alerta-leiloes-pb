import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = createServiceClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, titulo, slug, resumo, imagem_url, created_at")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen bg-[#1a1a2e] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-[#e63946] text-sm font-semibold uppercase tracking-widest mb-2">Blog</p>
          <h1 className="text-4xl font-black text-white mb-3">Inteligência em Leilões</h1>
          <p className="text-[#a0a0a0] text-lg">Conteúdo educativo sobre leilões imobiliários na Paraíba.</p>
        </div>

        {!posts?.length ? (
          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-12 text-center">
            <p className="text-[#a0a0a0]">Nenhum artigo publicado ainda. Em breve!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group bg-[#16213e] border border-[#0f3460] rounded-2xl overflow-hidden hover:border-[#e63946]/50 transition-all duration-300">
                {post.imagem_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imagem_url} alt={post.titulo} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />
                )}
                <div className="p-6">
                  <p className="text-[#a0a0a0] text-xs mb-2">
                    {new Date(post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <h2 className="text-white font-bold text-lg mb-2 group-hover:text-[#e63946] transition-colors leading-snug">
                    {post.titulo}
                  </h2>
                  {post.resumo && <p className="text-[#a0a0a0] text-sm line-clamp-3">{post.resumo}</p>}
                  <p className="text-[#e63946] text-sm font-medium mt-4">Ler artigo →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
