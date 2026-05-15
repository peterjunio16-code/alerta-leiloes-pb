import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

type Post = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  created_at: string;
};

async function getLatestPosts(): Promise<Post[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id,titulo,slug,resumo,created_at")
      .eq("publicado", true)
      .order("created_at", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function BlogPreview() {
  const posts = await getLatestPosts();
  if (posts.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-night-950 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(230,57,70,0.04),transparent_60%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#e63946]/70 px-4 py-1.5 border border-[#e63946]/20 rounded-full">
              Blog & Educação
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Aprenda antes de{" "}
              <span className="text-[#e63946]">arrematar</span>
            </h2>
            <p className="text-slate-400 max-w-md">
              Guias práticos sobre leilões de imóveis na Paraíba — sem enrolação.
            </p>
          </div>
          <Link
            href="/blog"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-[#e63946]/40 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Ver todos os artigos
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-night-800/60 border border-white/[0.07] hover:border-[#e63946]/30 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:shadow-lg hover:shadow-[#e63946]/5"
            >
              {/* Number badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e63946]/60 bg-[#e63946]/10 border border-[#e63946]/20 px-2.5 py-1 rounded-full">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-slate-500">{formatDate(post.created_at)}</span>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-base leading-snug group-hover:text-[#e63946] transition-colors line-clamp-2">
                {post.titulo}
              </h3>

              {/* Resumo */}
              {post.resumo && (
                <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-3">
                  {post.resumo}
                </p>
              )}

              {/* CTA */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#e63946] group-hover:gap-3 transition-all mt-auto pt-3 border-t border-white/[0.06]">
                Ler artigo completo
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
