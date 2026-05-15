"use client";

import { useEffect, useState } from "react";

type Post = { id: string; titulo: string; slug: string; publicado: boolean; created_at: string };

const ARTIGOS_SUGERIDOS = [
  {
    titulo: "Como Funciona um Leilão de Imóveis na Paraíba: Guia Completo",
    resumo: "Entenda o passo a passo para participar de leilões de imóveis em João Pessoa e na Paraíba.",
    tags: ["leilão", "paraíba", "guia", "iniciante"],
  },
  {
    titulo: "Leilão Judicial vs Extrajudicial: Qual a Diferença?",
    resumo: "Descubra as diferenças entre leilões judiciais e extrajudiciais e como cada um afeta sua estratégia de compra.",
    tags: ["leilão judicial", "leilão extrajudicial", "educação"],
  },
  {
    titulo: "Os 5 Erros Mais Comuns em Leilões de Imóveis (e Como Evitar)",
    resumo: "Aprenda com os erros mais comuns cometidos por iniciantes em leilões imobiliários na Paraíba.",
    tags: ["erros", "dicas", "iniciante", "leilão"],
  },
  {
    titulo: "Imóvel Ocupado no Leilão: O Que Fazer?",
    resumo: "Saiba como lidar com imóveis ocupados arrematados em leilão e quais são os seus direitos.",
    tags: ["imóvel ocupado", "arremate", "jurídico"],
  },
  {
    titulo: "Score de Oportunidade: Como Avaliamos Cada Imóvel no Radar PB",
    resumo: "Conheça os 6 critérios que usamos para calcular o score de cada leilão monitorado pelo Radar PB.",
    tags: ["score", "análise", "radar pb", "metodologia"],
  },
];

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", conteudo: "", resumo: "" });

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

  const criarArtigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.conteudo) return alert("Título e conteúdo são obrigatórios");
    setCriando(true);
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: form.titulo,
        conteudo: form.conteudo,
        resumo: form.resumo,
        publicado: true,
      }),
    });
    const data = await res.json();
    setCriando(false);
    if (res.ok) {
      setForm({ titulo: "", conteudo: "", resumo: "" });
      setShowForm(false);
      await carregar();
      alert("✅ Artigo criado e publicado!");
    } else {
      alert(`❌ Erro: ${data.error}`);
    }
  };

  const gerarArtigo = async () => {
    if (!confirm("Gerar e publicar um novo artigo da biblioteca semanal?")) return;
    setGerando(true);
    const res = await fetch("/api/admin/blog/gerar", { method: "POST" });
    const data = await res.json();
    setGerando(false);
    if (res.ok) {
      await carregar();
      alert(`✅ Artigo gerado: "${data.titulo}"`);
    } else {
      alert(`❌ Erro: ${data.error}`);
    }
  };

  const usarSugestao = (s: typeof ARTIGOS_SUGERIDOS[0]) => {
    setForm({
      titulo: s.titulo,
      resumo: s.resumo,
      conteudo: `# ${s.titulo}\n\n${s.resumo}\n\n## Introdução\n\nEscreva o conteúdo completo do artigo aqui...\n\n## Conclusão\n\nConclua o artigo com um resumo e chamada para ação.`,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog ({posts.length} artigos)</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Crie e gerencie artigos sobre leilões na Paraíba</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <a href="/blog" target="_blank" className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg">
            🌐 Ver blog público
          </a>
          <button
            onClick={gerarArtigo}
            disabled={gerando}
            className="text-xs font-semibold px-4 py-1.5 bg-[#0f3460] hover:bg-[#1a4a8a] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {gerando ? "Gerando..." : "🔄 Gerar artigo semanal"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-semibold px-4 py-1.5 bg-[#e63946] hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            {showForm ? "✕ Cancelar" : "✏️ Novo artigo"}
          </button>
        </div>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <form onSubmit={criarArtigo} className="bg-[#16213e] border border-[#0f3460] rounded-xl p-6 space-y-4">
          <h2 className="text-white font-bold text-lg">Novo Artigo</h2>

          <div className="space-y-1.5">
            <label className="text-xs text-[#a0a0a0] font-medium">Título *</label>
            <input
              type="text"
              className="w-full bg-[#0f1923] border border-[#0f3460] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e63946]"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Como participar de leilões de imóveis em João Pessoa"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#a0a0a0] font-medium">Resumo (aparece na listagem)</label>
            <input
              type="text"
              className="w-full bg-[#0f1923] border border-[#0f3460] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e63946]"
              value={form.resumo}
              onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
              placeholder="Descrição curta do artigo..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#a0a0a0] font-medium">Conteúdo * (suporta Markdown)</label>
            <textarea
              className="w-full bg-[#0f1923] border border-[#0f3460] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e63946] font-mono resize-y"
              rows={16}
              value={form.conteudo}
              onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
              placeholder="# Título do artigo&#10;&#10;Escreva o conteúdo aqui em Markdown..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white rounded-lg">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={criando}
              className="px-6 py-2 bg-[#e63946] hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {criando ? "Publicando..." : "✅ Publicar artigo"}
            </button>
          </div>
        </form>
      )}

      {/* Artigos existentes */}
      {loading ? (
        <p className="text-[#a0a0a0] text-center py-12">Carregando...</p>
      ) : posts.length > 0 ? (
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
                    <button
                      onClick={() => togglePublicado(post)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        post.publicado ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-[#0f3460] text-[#a0a0a0] hover:text-white"
                      }`}
                    >
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
      ) : (
        /* Sugestões de artigos */
        <div className="space-y-4">
          <p className="text-[#a0a0a0] text-sm">Nenhum artigo ainda. Comece com uma sugestão abaixo:</p>
          <div className="grid gap-3">
            {ARTIGOS_SUGERIDOS.map((s) => (
              <div key={s.titulo} className="bg-[#16213e] border border-[#0f3460] hover:border-[#e63946]/40 rounded-xl p-4 flex items-start justify-between gap-4 transition-colors">
                <div>
                  <p className="text-white font-medium text-sm">{s.titulo}</p>
                  <p className="text-[#a0a0a0] text-xs mt-1">{s.resumo}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {s.tags.map((t) => (
                      <span key={t} className="text-[10px] text-[#a0a0a0] bg-[#0f3460] px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => usarSugestao(s)}
                  className="flex-shrink-0 px-3 py-1.5 bg-[#e63946]/20 hover:bg-[#e63946] text-[#e63946] hover:text-white text-xs font-semibold rounded-lg border border-[#e63946]/30 transition-all"
                >
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
