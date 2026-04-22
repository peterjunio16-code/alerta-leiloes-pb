"use client";

import { useEffect, useState } from "react";

type Post = { id: string; titulo: string; slug: string; publicado: boolean; created_at: string };

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const togglePublicado = async (post: Post) => {
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, publicado: !post.publicado }),
    });
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, publicado: !p.publicado } : p));
  };

  const deletar = async (post: Post) => {
    if (!confirm(`Excluir artigo "${post.titulo}"?`)) return;
    await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blog ({posts.length} artigos)</h1>
        <a href="/blog" target="_blank" className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg">
          🌐 Ver blog público
        </a>
      </div>

      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 text-sm text-[#a0a0a0]">
        💡 Os artigos são gerados automaticamente pelo script <code className="text-white">blog-semanal.js</code>.
        Use este painel para publicar, despublicar ou excluir artigos.
      </div>

      {loading ? (
        <p className="text-[#a0a0a0] text-center py-12">Carregando...</p>
      ) : !posts.length ? (
        <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-12 text-center text-[#a0a0a0]">
          Nenhum artigo ainda. Execute <code className="text-white">node blog-semanal.js</code> para gerar o primeiro.
        </div>
      ) : (
        <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0f3460]">
              <tr>
                {["Título", "Status", "Data", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f3460]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#0f3460]/50 transition-colors">
                  <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{post.titulo}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublicado(post)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        post.publicado ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-[#0f3460] text-[#a0a0a0] hover:text-white"
                      }`}>
                      {post.publicado ? "✅ Publicado" : "⏸ Rascunho"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{new Date(post.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <a href={`/blog/${post.slug}`} target="_blank" className="text-xs text-[#a0a0a0] hover:text-white underline">Ver</a>
                    <button onClick={() => deletar(post)} className="text-[#e63946] hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
                      🗑 Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
