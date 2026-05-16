"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

type Lead = {
  id: string;
  nome: string | null;
  whatsapp: string;
  origem: string;
  status: string;
  score_mentoria: number;
  created_at: string;
};

type Filtro = "todos" | "quentes" | "radar" | "gratuito";

function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      🔥 {score}
    </span>
  );
  if (score >= 45) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
      ⭐ {score}
    </span>
  );
  if (score >= 20) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
      📈 {score}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[#a0a0a0]">
      {score}
    </span>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [ordenar, setOrdenar] = useState<"score" | "data">("score");

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Excluir lead "${lead.nome}" (${lead.whatsapp})?\n\nEssa ação não pode ser desfeita.`)) return;
    setDeleting(lead.id);
    await fetch("/api/admin/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id }),
    });
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setDeleting(null);
  };

  const leadsFiltrados = leads
    .filter((l) => {
      if (filtro === "quentes") return l.score_mentoria >= 45;
      if (filtro === "radar") return l.origem === "radar";
      if (filtro === "gratuito") return l.origem !== "radar";
      return true;
    })
    .sort((a, b) =>
      ordenar === "score"
        ? b.score_mentoria - a.score_mentoria
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const quentes = leads.filter((l) => l.score_mentoria >= 45).length;
  const radar = leads.filter((l) => l.origem === "radar").length;

  const FILTROS: { key: Filtro; label: string; count: number }[] = [
    { key: "todos",    label: "Todos",            count: leads.length },
    { key: "quentes",  label: "🔥 Candidatos Mentoria", count: quentes },
    { key: "radar",    label: "🎯 Radar PB",       count: radar },
    { key: "gratuito", label: "👥 Gratuito",       count: leads.length - radar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-xs text-[#a0a0a0] mt-0.5">
            {quentes > 0 && (
              <span className="text-emerald-400 font-semibold">{quentes} candidato{quentes > 1 ? "s" : ""} quente{quentes > 1 ? "s" : ""} para Mentoria · </span>
            )}
            {leads.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value as "score" | "data")}
            className="text-xs bg-[#0f3460] text-[#a0a0a0] border border-[#0f3460] rounded-lg px-3 py-1.5"
          >
            <option value="score">Ordenar: Score</option>
            <option value="data">Ordenar: Data</option>
          </select>
          <button onClick={carregar} className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg">
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Score legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[#a0a0a0]">
        <span className="flex items-center gap-1.5"><ScoreBadge score={75} /> Score 70+ — muito quente para Mentoria</span>
        <span className="flex items-center gap-1.5"><ScoreBadge score={50} /> Score 45–69 — quente</span>
        <span className="flex items-center gap-1.5"><ScoreBadge score={25} /> Score 20–44 — morno</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtro === f.key
                ? "bg-[#e63946] text-white"
                : "bg-[#0f3460] text-[#a0a0a0] hover:text-white"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-x-auto">
        {loading ? (
          <p className="text-center text-[#a0a0a0] py-12">Carregando...</p>
        ) : !leadsFiltrados.length ? (
          <p className="text-center text-[#a0a0a0] py-12">Nenhum lead encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0f3460]">
              <tr>
                {["Score", "Nome", "WhatsApp", "Origem", "Status", "Data", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f3460]">
              {leadsFiltrados.map((lead) => (
                <tr
                  key={lead.id}
                  className={`hover:bg-[#0f3460]/50 transition-colors ${
                    lead.score_mentoria >= 70 ? "bg-emerald-500/[0.03]" :
                    lead.score_mentoria >= 45 ? "bg-yellow-500/[0.03]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <ScoreBadge score={lead.score_mentoria ?? 0} />
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{lead.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-[#a0a0a0]">
                    <a
                      href={`https://wa.me/${lead.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {lead.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#a0a0a0] capitalize">{lead.origem}</td>
                  <td className="px-4 py-3"><Badge status={lead.status} /></td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(lead)}
                      disabled={deleting === lead.id}
                      className="text-[#e63946] hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === lead.id ? "..." : "🗑"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
