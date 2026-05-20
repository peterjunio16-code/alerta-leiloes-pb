"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Imovel = Database["public"]["Tables"]["imoveis"]["Row"];
type GrupoDestino = "gratuito" | "radar" | "ambos";

const GRUPO_LABELS: Record<GrupoDestino, string> = {
  gratuito: "📢 Grupo Gratuito",
  radar: "⭐ Radar PB (Pago)",
  ambos: "📢⭐ Ambos os Grupos",
};

type DiagResult = {
  leads: { total: number; ativos: number };
  radar: { assinantes_ativos: number };
  whatsapp: { phone_number_id_configurado: boolean; token_configurado: boolean; token_valido: boolean; detalhe: string };
} | null;

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loadingImoveis, setLoadingImoveis] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishingAll, setPublishingAll] = useState(false);
  const [publishAllResult, setPublishAllResult] = useState<{ msg: string; tipo: "ok" | "warn" | "erro" } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ saved?: number; skipped?: number; errors?: string[]; total_found?: number } | null>(null);
  const [syncingCaixa, setSyncingCaixa] = useState(false);
  const [scoringLote, setScoringLote] = useState(false);
  const [scoreLoteResult, setScoreLoteResult] = useState<string | null>(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Record<string, GrupoDestino>>({});
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [ordenacao, setOrdenacao] = useState<"recentes" | "score">("recentes");
  const [diag, setDiag] = useState<DiagResult>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const carregarDiag = async () => {
    setDiagLoading(true);
    try {
      const res = await fetch("/api/admin/diagnostico");
      if (res.ok) setDiag(await res.json());
    } finally {
      setDiagLoading(false);
    }
  };

  const carregarImoveis = async (statusOverride?: string, ordenacaoOverride?: string) => {
    setLoadingImoveis(true);
    try {
      const s = statusOverride ?? filtroStatus;
      const o = ordenacaoOverride ?? ordenacao;
      const params = new URLSearchParams({ status: s, order: o });
      const res = await fetch(`/api/admin/imoveis?${params}`);
      if (res.ok) {
        const data = await res.json();
        setImoveis(data ?? []);
      }
    } finally {
      setLoadingImoveis(false);
    }
  };

  useEffect(() => {
    carregarImoveis(filtroStatus, ordenacao);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus, ordenacao]);

  useEffect(() => {
    carregarDiag();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGrupo = (id: string): GrupoDestino =>
    grupoSelecionado[id] ?? (imoveis.find((i) => i.id === id)?.grupo_destino as GrupoDestino) ?? "gratuito";

  const handlePublicar = async (id: string) => {
    const grupo = getGrupo(id);
    const labels: Record<GrupoDestino, string> = {
      gratuito: "o Grupo Gratuito",
      radar: "o Radar PB (assinantes pagos)",
      ambos: "AMBOS os grupos",
    };
    if (!confirm(`Publicar este imóvel para ${labels[grupo]}?`)) return;

    setPublishing(id);
    try {
      const res = await fetch("/api/imoveis/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imovelId: id, grupo }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(`❌ Erro ao publicar!\n\n${data.detalhe ?? data.error ?? "Erro desconhecido"}`);
        return;
      }

      setImoveis((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "publicado", grupo_destino: grupo } : i))
      );

      const leadsInfo = data.leads_encontrados !== undefined
        ? `\n📋 Leads na base: ${data.leads_encontrados}`
        : "";

      if (data.leads_encontrados === 0) {
        alert(`⚠️ Imóvel marcado como publicado, mas NENHUM lead foi encontrado na base.\n\nCadastre leads em /admin/leads ou aguarde assinaturas.`);
      } else if (data.erros?.length > 0) {
        alert(`⚠️ Publicado com erros!\n\n✅ ${data.notificados} notificados${leadsInfo}\n❌ ${data.erros.length} falhas:\n${data.erros.slice(0, 3).join("\n")}`);
      } else {
        alert(`✅ Publicado com sucesso!\n\n📨 ${data.notificados} contatos notificados${leadsInfo}`);
      }
    } catch (err) {
      alert(`❌ Erro de conexão: ${err instanceof Error ? err.message : "tente novamente"}`);
    } finally {
      setPublishing(null);
    }
  };

  const handlePublicarMelhores = async (grupo: GrupoDestino, quantidade = 3) => {
    // Busca frescos do banco para garantir pendentes atualizados
    let pendentesDb: Imovel[] = [];
    try {
      const res = await fetch("/api/admin/imoveis?status=pendente&order=score");
      if (res.ok) pendentesDb = (await res.json()) ?? [];
    } catch { /* usa estado local como fallback */ }

    const pendentes = (pendentesDb.length > 0 ? pendentesDb : imoveis.filter((i) => i.status === "pendente"))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, quantidade);

    if (!pendentes.length) {
      alert("⚠️ Nenhum imóvel pendente encontrado.\n\nUse 'Sincronizar' para importar novos leilões.");
      return;
    }

    const label = grupo === "gratuito" ? "Grupo Gratuito" : grupo === "radar" ? "Radar PB" : "Ambos os grupos";
    const nomes = pendentes.map((i) => `• ${i.titulo.slice(0, 50)} (score ${i.score ?? 0}/10)`).join("\n");
    if (!confirm(`Publicar os ${pendentes.length} melhores imóveis para ${label}?\n\n${nomes}\n\nIsso enviará WhatsApp para os contatos cadastrados.`)) return;

    setPublishingAll(true);
    setPublishAllResult(null);
    let ok = 0; let erro = 0;
    let totalNotificados = 0;
    let totalLeads = 0;

    for (const imovel of pendentes) {
      try {
        const res = await fetch("/api/imoveis/publicar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imovelId: imovel.id, grupo }),
        });
        const data = await res.json();
        if (res.ok) {
          ok++;
          totalNotificados += data.notificados ?? 0;
          totalLeads = Math.max(totalLeads, data.leads_encontrados ?? 0);
          setImoveis((prev) => prev.map((i) => i.id === imovel.id ? { ...i, status: "publicado", grupo_destino: grupo } : i));
          await new Promise((r) => setTimeout(r, 1500));
        } else {
          erro++;
          console.error(`Erro ao publicar ${imovel.titulo}:`, data.detalhe ?? data.error);
        }
      } catch (err) {
        erro++;
        console.error("Erro publicar:", err);
      }
    }

    // Recarrega lista para refletir mudanças de status
    await carregarImoveis();
    setPublishingAll(false);

    if (totalLeads === 0) {
      setPublishAllResult({
        msg: `⚠️ ${ok} imóvel(is) marcado(s) como publicado, mas NENHUM contato encontrado na base.\n\nCadastre leads em /admin/leads ou aguarde assinaturas para que o envio funcione.`,
        tipo: "warn",
      });
    } else if (erro > 0 && ok === 0) {
      setPublishAllResult({ msg: `❌ Falha ao publicar — ${erro} erro(s). Verifique os logs.`, tipo: "erro" });
    } else {
      setPublishAllResult({
        msg: `✅ ${ok} imóvel(is) publicado(s) para ${label} · 📨 ${totalNotificados} de ${totalLeads} contatos notificados${erro ? ` · ❌ ${erro} erro(s)` : ""}`,
        tipo: totalNotificados > 0 ? "ok" : "warn",
      });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    // Tenta servidor local primeiro (scraping mais rápido sem timeout de serverless)
    let usedLocal = false;
    try {
      const localRes = await fetch("http://localhost:3100/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPages: 10 }),
        signal: AbortSignal.timeout(10000), // 10s para detectar se local está up
      });
      if (localRes.ok) {
        const data = await localRes.json();
        setSyncResult(data);
        await carregarImoveis();
        usedLocal = true;
      }
    } catch {
      // local offline — usa API da Vercel
    }

    if (!usedLocal) {
      try {
        const res = await fetch("/api/admin/scrape", {
          method: "POST",
          signal: AbortSignal.timeout(300000),
        });
        const data = await res.json();
        setSyncResult(data);
        await carregarImoveis();
      } catch (err) {
        setSyncResult({ errors: ["Erro ao sincronizar: " + (err instanceof Error ? err.message : "tente novamente")] });
      }
    }

    setSyncing(false);
  };

  // (handleSyncCaixa removido — API da Caixa CEF foi descontinuada em 2026.
  //  Domínio venda.caixa.gov.br não resolve mais via DNS. Vai voltar quando
  //  encontrarmos endpoint novo ou integrarmos via leiloeiros parceiros.)

  const handleScoreLote = async () => {
    setScoringLote(true);
    setScoreLoteResult(null);
    try {
      const res = await fetch("/api/admin/imoveis/batch/score", { method: "PUT" });
      const data = await res.json();
      setScoreLoteResult(`🤖 ${data.analisados ?? 0} imóveis analisados pela IA`);
      await carregarImoveis();
    } catch (err) {
      setScoreLoteResult("❌ Erro ao gerar scores: " + (err instanceof Error ? err.message : "tente novamente"));
    }
    setScoringLote(false);
  };

  const handleRodarPipelineRadar = async () => {
    if (!confirm("Rodar pipeline completo agora?\n\n• Scrape Caixa + LeilãoImóvel\n• Score IA nos novos\n• Enviar ao Radar PB\n\nO gratuito recebe 30min depois via cron.")) return;
    setSyncingCaixa(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/cron/pipeline-radar", { method: "POST" });
      const data = await res.json();
      setSyncResult({
        saved: data.enviados ?? 0,
        skipped: 0,
        errors: data.log?.filter((l: string) => l.includes("ERROR")) ?? [],
      });
      await carregarImoveis();
    } catch (err) {
      setSyncResult({ errors: ["Erro pipeline: " + (err instanceof Error ? err.message : "tente novamente")] });
    }
    setSyncingCaixa(false);
  };

  const handleScoreIndividual = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/imoveis/${id}/score`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setImoveis((prev) => prev.map((i) => i.id === id ? { ...i, score: data.score } : i));
        alert(`✅ Score gerado: ${data.score}/10\n\n${data.analise?.slice(0, 300) ?? ""}`);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      alert("❌ Erro: " + (err instanceof Error ? err.message : "tente novamente"));
    }
  };

  const imovelPendentes = imoveis.filter((i) => i.status === "pendente").length;

  return (
    <div className="space-y-6">

      {/* Painel de Diagnóstico WhatsApp */}
      <div className="bg-[#0f1923] border border-[#1e3a5f] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-sm font-semibold">🔍 Diagnóstico do Sistema</h2>
          <div className="flex gap-3">
            <button
              onClick={() => window.open("/api/admin/diagnostico/envio", "_blank")}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline"
            >
              🧪 Testar envio real
            </button>
            <button
              onClick={carregarDiag}
              disabled={diagLoading}
              className="text-xs text-[#a0a0a0] hover:text-white underline disabled:opacity-50"
            >
              {diagLoading ? "Verificando..." : "Atualizar"}
            </button>
          </div>
        </div>
        {diag ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#16213e] rounded-lg p-3">
              <p className="text-[#a0a0a0] mb-1">Leads (gratuito)</p>
              <p className={`font-bold text-lg ${diag.leads.ativos > 0 ? "text-green-400" : "text-yellow-400"}`}>
                {diag.leads.ativos}
              </p>
              <p className="text-[#a0a0a0]">ativos de {diag.leads.total}</p>
            </div>
            <div className="bg-[#16213e] rounded-lg p-3">
              <p className="text-[#a0a0a0] mb-1">Radar PB (pago)</p>
              <p className={`font-bold text-lg ${diag.radar.assinantes_ativos > 0 ? "text-yellow-400" : "text-[#a0a0a0]"}`}>
                {diag.radar.assinantes_ativos}
              </p>
              <p className="text-[#a0a0a0]">assinantes ativos</p>
            </div>
            <div className="bg-[#16213e] rounded-lg p-3 col-span-2">
              <p className="text-[#a0a0a0] mb-1">WhatsApp API</p>
              <p className={`font-bold ${diag.whatsapp.token_valido ? "text-green-400" : "text-red-400"}`}>
                {diag.whatsapp.token_valido ? "✅ Token válido" : "❌ Token inválido ou expirado"}
              </p>
              <p className="text-[#a0a0a0] mt-1 leading-relaxed">{diag.whatsapp.detalhe}</p>
              {!diag.whatsapp.token_configurado && (
                <p className="text-red-400 mt-1">⚠️ WHATSAPP_ACCESS_TOKEN não definido no .env</p>
              )}
              {!diag.whatsapp.phone_number_id_configurado && (
                <p className="text-red-400 mt-1">⚠️ WHATSAPP_PHONE_NUMBER_ID não definido no .env</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[#a0a0a0] text-xs">{diagLoading ? "Carregando diagnóstico..." : "Clique em Atualizar"}</p>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Imóveis</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            {imovelPendentes > 0 && (
              <span className="text-yellow-400 font-medium">{imovelPendentes} pendentes para publicar • </span>
            )}
            {imoveis.length} total
            {loadingImoveis && <span className="ml-2 text-xs text-[#a0a0a0] animate-pulse">Atualizando...</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => carregarImoveis()}
            disabled={loadingImoveis}
            className="text-xs px-3 py-2 bg-[#0f3460] hover:bg-[#1a4a8a] text-[#a0a0a0] hover:text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            title="Recarregar lista de imóveis"
          >
            {loadingImoveis ? "⏳ Atualizando..." : "🔄 Atualizar lista"}
          </button>
          <button
            onClick={handleRodarPipelineRadar}
            disabled={syncingCaixa}
            className="text-xs px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
            title="Scrape + Score IA + Enviar Radar agora (gratuito em 30min)"
          >
            {syncingCaixa ? "Rodando..." : "🚀 Rodar pipeline agora"}
          </button>
          <Button variant="secondary" loading={syncing} onClick={handleSync}>
            🔄 LeilãoNinja
          </Button>
          <button
            onClick={handleScoreLote}
            disabled={scoringLote}
            className="text-xs px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {scoringLote ? "Analisando..." : "🤖 Score IA"}
          </button>
        </div>
      </div>

      {/* Publicar em massa */}
      {imovelPendentes > 0 && (
        <div className="bg-[#16213e] border border-yellow-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-yellow-400 font-semibold text-sm">
              🏠 {imovelPendentes} imóveis pendentes para publicar
            </p>
            <p className="text-[#a0a0a0] text-xs mt-0.5">Publique todos de uma vez ou escolha individualmente abaixo</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handlePublicarMelhores("gratuito", 3)}
              disabled={publishingAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {publishingAll ? "Publicando..." : "📢 3 melhores → Gratuito"}
            </button>
            <button
              onClick={() => handlePublicarMelhores("radar", 3)}
              disabled={publishingAll}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {publishingAll ? "..." : "⭐ 3 melhores → Radar PB"}
            </button>
            <button
              onClick={() => handlePublicarMelhores("ambos", 3)}
              disabled={publishingAll}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {publishingAll ? "..." : "📢⭐ 3 melhores → Ambos"}
            </button>
          </div>
        </div>
      )}

      {publishAllResult && (
        <div className={`rounded-xl p-3 text-sm border whitespace-pre-line ${
          publishAllResult.tipo === "ok"
            ? "bg-green-500/10 border-green-500/30 text-green-300"
            : publishAllResult.tipo === "warn"
            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {publishAllResult.msg}
        </div>
      )}

      {scoreLoteResult && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-purple-300 text-sm">
          {scoreLoteResult}
        </div>
      )}

      {/* Resultado do sync */}
      {syncResult && (
        <div
          className={`rounded-xl p-4 text-sm border ${
            syncResult.errors?.length
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-green-500/10 border-green-500/30 text-green-300"
          }`}
        >
          {syncResult.saved !== undefined && (
            <p>
              ✅ {syncResult.saved} imóveis novos salvos •{" "}
              {syncResult.skipped} duplicados ignorados
              {syncResult.total_found !== undefined && ` • ${syncResult.total_found} encontrados na fonte`}
            </p>
          )}
          {syncResult.errors?.map((e, i) => (
            <p key={i}>⚠️ {e}</p>
          ))}
        </div>
      )}

      {/* Filtros de status + ordenação */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["todos", "pendente", "publicado", "encerrado"].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtroStatus === s
                  ? "bg-[#e63946] text-white"
                  : "bg-[#0f3460] text-[#a0a0a0] hover:text-white"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["recentes", "score"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrdenacao(o)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                ordenacao === o
                  ? "bg-yellow-500 text-black"
                  : "bg-[#0f3460] text-[#a0a0a0] hover:text-white"
              }`}
            >
              {o === "recentes" ? "🕐 Mais recentes" : "⭐ Maior score"}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda dos grupos */}
      <div className="flex gap-4 text-xs text-[#a0a0a0] flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Grupo Gratuito — todos os leads
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          Radar PB — apenas assinantes pagos
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          Ambos os grupos
        </span>
      </div>

      {/* Cards de imóveis */}
      {loadingImoveis && imoveis.length === 0 ? (
        <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-12 text-center text-[#a0a0a0]">
          ⏳ Carregando imóveis...
        </div>
      ) : imoveis.length === 0 ? (
        <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-12 text-center text-[#a0a0a0]">
          Nenhum imóvel encontrado. Use &quot;Sincronizar LeilãoNinja&quot; para importar leilões da Paraíba.
        </div>
      ) : (
        <div className={`grid gap-4 transition-opacity duration-200 ${loadingImoveis ? "opacity-50 pointer-events-none" : ""}`}>
          {imoveis.map((imovel) => (
            <div
              key={imovel.id}
              className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden flex flex-col sm:flex-row"
            >
              {/* Imagem */}
              <div className="sm:w-48 sm:flex-shrink-0 h-40 sm:h-auto bg-[#0f3460] relative">
                {imovel.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imovel.imagem_url}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-[#a0a0a0]">
                    🏠
                  </div>
                )}
                {imovel.desconto && (
                  <div className="absolute top-2 left-2 bg-[#e63946] text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{imovel.desconto}%
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                      {imovel.titulo}
                    </h3>
                    <Badge status={imovel.status} />
                  </div>
                  <p className="text-[#a0a0a0] text-xs mt-1">
                    📍 {imovel.cidade}
                    {imovel.bairro ? ` — ${imovel.bairro}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-[#a0a0a0] text-xs">Lance mínimo</p>
                    <p className="text-white font-bold">{formatCurrency(imovel.lance_inicial)}</p>
                  </div>
                  {imovel.valor_avaliacao && (
                    <div>
                      <p className="text-[#a0a0a0] text-xs">Avaliação</p>
                      <p className="text-[#a0a0a0]">{formatCurrency(imovel.valor_avaliacao)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[#a0a0a0] text-xs">Score</p>
                    <p className="text-white font-medium">{imovel.score ?? 0}/10</p>
                  </div>
                  {imovel.data_leilao && (
                    <div>
                      <p className="text-[#a0a0a0] text-xs">Data</p>
                      <p className="text-white text-xs">
                        {new Date(imovel.data_leilao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                {imovel.status === "pendente" && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#0f3460]">
                    {/* Seletor de grupo */}
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-xs text-[#a0a0a0] block mb-1">Publicar para:</label>
                      <select
                        value={getGrupo(imovel.id)}
                        onChange={(e) =>
                          setGrupoSelecionado((prev) => ({
                            ...prev,
                            [imovel.id]: e.target.value as GrupoDestino,
                          }))
                        }
                        className="w-full bg-[#0f3460] border border-[#16213e] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#e63946]"
                      >
                        <option value="gratuito">📢 Grupo Gratuito</option>
                        <option value="radar">⭐ Radar PB (Pago)</option>
                        <option value="ambos">📢⭐ Ambos os Grupos</option>
                      </select>
                    </div>

                    <div className="flex gap-2 items-end pb-0.5 flex-wrap">
                      {imovel.link && (
                        <a
                          href={imovel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#a0a0a0] hover:text-white underline"
                        >
                          Ver fonte
                        </a>
                      )}
                      <button
                        onClick={() => handleScoreIndividual(imovel.id)}
                        className="text-xs px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg transition-colors"
                        title="Gerar score com IA"
                      >
                        🤖 Score IA
                      </button>
                      <a
                        href={`/imoveis/${imovel.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1.5 bg-[#0f3460] hover:bg-[#1a4a8a] text-[#a0a0a0] hover:text-white rounded-lg transition-colors"
                        title="Ver página pública"
                      >
                        🔗 Pré-visualizar
                      </a>
                      <Button
                        size="sm"
                        loading={publishing === imovel.id}
                        onClick={() => handlePublicar(imovel.id)}
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                )}

                {imovel.status === "publicado" && (
                  <div className="pt-2 border-t border-[#0f3460] flex items-center gap-2">
                    <span className="text-green-400 text-xs">
                      ✅ Publicado para: {GRUPO_LABELS[imovel.grupo_destino as GrupoDestino] ?? imovel.grupo_destino}
                    </span>
                    {imovel.link && (
                      <a
                        href={imovel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#a0a0a0] hover:text-white underline ml-auto"
                      >
                        Ver leilão
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
