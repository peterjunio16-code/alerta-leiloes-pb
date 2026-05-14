"use client";

import { useEffect, useState } from "react";

type Candidatura = {
  id: string;
  nome: string;
  whatsapp: string;
  participou_leilao: boolean;
  orcamento: string | null;
  trava: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente:   { label: "Pendente",   color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  contatado:  { label: "Contatado",  color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  aprovado:   { label: "Aprovado",   color: "bg-green-500/20 text-green-300 border-green-500/30" },
  rejeitado:  { label: "Rejeitado",  color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const ORCAMENTO_LABELS: Record<string, string> = {
  "ate-50k":    "Até R$50k",
  "50k-100k":   "R$50k–100k",
  "100k-200k":  "R$100k–200k",
  "acima-200k": "+R$200k",
};

export default function CandidaturasPage() {
  const [lista, setLista] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/candidaturas");
    if (res.ok) {
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const atualizarStatus = async (id: string, status: string) => {
    setAtualizando(id);
    await fetch("/api/admin/candidaturas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLista((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    setAtualizando(null);
  };

  const filtradas = filtro === "todos" ? lista : lista.filter((c) => c.status === filtro);
  const contadores = {
    todos: lista.length,
    pendente: lista.filter((c) => c.status === "pendente").length,
    contatado: lista.filter((c) => c.status === "contatado").length,
    aprovado: lista.filter((c) => c.status === "aprovado").length,
    rejeitado: lista.filter((c) => c.status === "rejeitado").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Candidaturas Mentoria</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">{lista.length} candidaturas no total</p>
        </div>
        <button onClick={carregar} className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg">
          🔄 Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["todos", "pendente", "contatado", "aprovado", "rejeitado"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === s ? "bg-[#e63946] text-white" : "bg-[#0f3460] text-[#a0a0a0] hover:text-white"
            }`}
          >
            {s === "todos" ? "Todos" : STATUS_LABELS[s]?.label}
            {" "}
            <span className="opacity-70">({contadores[s]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-[#a0a0a0] py-12">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <p className="text-center text-[#a0a0a0] py-12">Nenhuma candidatura encontrada.</p>
      ) : (
        <div className="space-y-4">
          {filtradas.map((c) => {
            const statusInfo = STATUS_LABELS[c.status] ?? STATUS_LABELS.pendente;
            const isLoading = atualizando === c.id;
            return (
              <div key={c.id} className="bg-[#16213e] border border-[#0f3460] rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{c.nome}</h3>
                    <a
                      href={`https://wa.me/${c.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 text-sm hover:underline"
                    >
                      📱 {c.whatsapp}
                    </a>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-[#a0a0a0] text-xs mb-1">Já fez leilão?</p>
                    <p className="text-white">{c.participou_leilao ? "✅ Sim" : "❌ Não"}</p>
                  </div>
                  <div>
                    <p className="text-[#a0a0a0] text-xs mb-1">Orçamento</p>
                    <p className="text-white">{ORCAMENTO_LABELS[c.orcamento ?? ""] ?? c.orcamento ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[#a0a0a0] text-xs mb-1">Data</p>
                    <p className="text-white">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                {c.trava && (
                  <div className="mb-4">
                    <p className="text-[#a0a0a0] text-xs mb-1">Principal trava</p>
                    <p className="text-[#e0e0e0] text-sm bg-[#0f3460] rounded-lg p-3">{c.trava}</p>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#0f3460]">
                  <p className="text-xs text-[#a0a0a0] w-full mb-1">Mover para:</p>
                  {["contatado", "aprovado", "rejeitado", "pendente"].map((s) => (
                    <button
                      key={s}
                      disabled={isLoading || c.status === s}
                      onClick={() => atualizarStatus(c.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed border ${
                        c.status === s
                          ? `${STATUS_LABELS[s]?.color} cursor-default`
                          : "bg-transparent border-[#0f3460] text-[#a0a0a0] hover:text-white hover:border-white/30"
                      }`}
                    >
                      {isLoading ? "..." : STATUS_LABELS[s]?.label}
                    </button>
                  ))}

                  <a
                    href={`https://wa.me/${c.whatsapp}?text=Ol%C3%A1%20${encodeURIComponent(c.nome)}%2C%20vi%20sua%20candidatura%20para%20a%20mentoria%20Radar%20PB%20e%20quero%20conversar%20com%20voc%C3%AA!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    💬 Abrir WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
