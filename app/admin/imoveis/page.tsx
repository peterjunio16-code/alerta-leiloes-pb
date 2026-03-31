"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Imovel = Database["public"]["Tables"]["imoveis"]["Row"];

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ saved?: number; skipped?: number; errors?: string[] } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("imoveis")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setImoveis(data ?? []));
  }, [supabase]);

  const handlePublicar = async (id: string) => {
    if (!confirm("Publicar este imóvel e notificar os leads?")) return;
    setPublishing(id);
    try {
      await fetch("/api/imoveis/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imovelId: id }),
      });
      setImoveis((prev) => prev.map((i) => (i.id === id ? { ...i, status: "publicado" } : i)));
    } finally {
      setPublishing(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/scrape", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);
      const { data: fresh } = await supabase
        .from("imoveis")
        .select("*")
        .order("created_at", { ascending: false });
      setImoveis(fresh ?? []);
    } catch {
      setSyncResult({ errors: ["Falha na conexão com o scraper"] });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imóveis ({imoveis.length})</h1>
        <Button variant="secondary" loading={syncing} onClick={handleSync}>
          🔄 Sincronizar LeilãoNinja
        </Button>
      </div>

      {syncResult && (
        <div className={`rounded-xl p-4 text-sm border ${syncResult.errors?.length ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}>
          {syncResult.saved !== undefined && (
            <p>✅ {syncResult.saved} imóveis salvos • {syncResult.skipped} ignorados (duplicados)</p>
          )}
          {syncResult.errors?.map((e, i) => <p key={i}>⚠️ {e}</p>)}
        </div>
      )}

      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Título", "Cidade", "Lance Mínimo", "Desconto", "Score", "Status", "Ação"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {imoveis.map((imovel) => (
              <tr key={imovel.id} className="hover:bg-[#0f3460]/50">
                <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{imovel.titulo}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{imovel.cidade}</td>
                <td className="px-4 py-3 text-white">{formatCurrency(imovel.lance_inicial)}</td>
                <td className="px-4 py-3 text-[#e63946] font-bold">{imovel.desconto ? `${imovel.desconto}%` : "—"}</td>
                <td className="px-4 py-3 text-white">{imovel.score ?? "—"}/10</td>
                <td className="px-4 py-3"><Badge status={imovel.status} /></td>
                <td className="px-4 py-3">
                  {imovel.status === "pendente" && (
                    <Button size="sm" loading={publishing === imovel.id} onClick={() => handlePublicar(imovel.id)}>
                      Publicar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!imoveis.length && <p className="text-center text-[#a0a0a0] py-12">Nenhum imóvel cadastrado.</p>}
      </div>
    </div>
  );
}
