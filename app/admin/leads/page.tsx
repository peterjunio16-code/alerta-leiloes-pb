"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  origem: string;
  status: string;
  created_at: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Leads ({leads.length})</h1>
        <button onClick={carregar} className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg">
          🔄 Atualizar
        </button>
      </div>

      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-x-auto">
        {loading ? (
          <p className="text-center text-[#a0a0a0] py-12">Carregando...</p>
        ) : !leads.length ? (
          <p className="text-center text-[#a0a0a0] py-12">Nenhum lead cadastrado ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0f3460]">
              <tr>
                {["Nome", "WhatsApp", "Origem", "Status", "Data", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f3460]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#0f3460]/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{lead.nome}</td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{lead.whatsapp}</td>
                  <td className="px-4 py-3 text-[#a0a0a0] capitalize">{lead.origem}</td>
                  <td className="px-4 py-3"><Badge status={lead.status} /></td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(lead)}
                      disabled={deleting === lead.id}
                      className="text-[#e63946] hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === lead.id ? "..." : "🗑 Excluir"}
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
