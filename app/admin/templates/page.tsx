"use client";

import { useEffect, useState } from "react";

type TemplateExistente = {
  name: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "PAUSED" | string;
  category: string;
  language: string;
};

type Resultado = { nome: string; status: string; http?: number; erro_meta?: string | null; detalhe: unknown };

const STATUS_COR: Record<string, string> = {
  APPROVED: "text-green-400 bg-green-500/10 border-green-500/20",
  PENDING:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
  PAUSED:   "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const TEMPLATES_JORNADA = [
  // Funil Lead Gratuito
  { name: "boas_vindas_alerta",       descricao: "Enviado ao se cadastrar no grupo",  categoria: "UTILITY",   quando: "Cadastro",       funil: "Gratuito" },
  { name: "alerta_imovel_gratuito",   descricao: "Alerta de imóvel para leads free",   categoria: "MARKETING", quando: "Publicar imóvel", funil: "Gratuito" },
  { name: "lembrete_leilao_48h",      descricao: "Lembrete 48h antes do leilão",       categoria: "UTILITY",   quando: "48h antes",       funil: "Gratuito" },
  { name: "nutricao_leiloes_d1",      descricao: "Nutrição — dia 1 após cadastro",     categoria: "MARKETING", quando: "Dia +1",          funil: "Gratuito" },
  { name: "nutricao_leiloes_d3",      descricao: "Nutrição — dia 3 após cadastro",     categoria: "MARKETING", quando: "Dia +3",          funil: "Gratuito" },
  { name: "nutricao_leiloes_d7",      descricao: "Nutrição — dia 7 após cadastro",     categoria: "MARKETING", quando: "Dia +7",          funil: "Gratuito" },
  { name: "nutricao_leiloes_d14",     descricao: "Nutrição — dia 14 após cadastro",    categoria: "MARKETING", quando: "Dia +14",         funil: "Gratuito" },
  // Funil Radar PB (pagos)
  { name: "boas_vindas_radar",        descricao: "Confirmação de assinatura Radar",    categoria: "UTILITY",   quando: "Pós-pagamento",   funil: "Radar" },
  { name: "alerta_imovel_radar",      descricao: "Alerta premium para assinantes",     categoria: "MARKETING", quando: "Publicar imóvel", funil: "Radar" },
  { name: "radar_resumo_semanal",     descricao: "Resumo semanal de oportunidades",    categoria: "MARKETING", quando: "Semanal",         funil: "Radar" },
  { name: "radar_destaque_score_alto",descricao: "Imóvel com score acima de 9",        categoria: "MARKETING", quando: "Score >9",        funil: "Radar" },
  { name: "radar_renovacao_7d",       descricao: "Lembrete renovação 7 dias antes",    categoria: "UTILITY",   quando: "7d antes",        funil: "Radar" },
  // Funil Mentoria
  { name: "convite_mentoria_pb",      descricao: "Convite para candidatura mentoria",  categoria: "MARKETING", quando: "Manual",          funil: "Mentoria" },
  { name: "mentoria_aprovada",        descricao: "Candidatura aprovada",                categoria: "UTILITY",   quando: "Aprovação",       funil: "Mentoria" },
  { name: "mentoria_reuniao_amanha",  descricao: "Lembrete reunião 1:1 24h antes",     categoria: "UTILITY",   quando: "24h antes",       funil: "Mentoria" },
  { name: "mentoria_pos_reuniao",     descricao: "Resumo e próximos passos pós-reunião", categoria: "UTILITY",   quando: "Após reunião",    funil: "Mentoria" },
  { name: "mentoria_checkin_semanal", descricao: "Check-in de progresso semanal",      categoria: "MARKETING", quando: "Semanal",         funil: "Mentoria" },
];

const FUNIL_COR: Record<string, string> = {
  Gratuito:  "text-blue-400 bg-blue-500/10",
  Radar:     "text-yellow-400 bg-yellow-500/10",
  Mentoria:  "text-purple-400 bg-purple-500/10",
};

export default function TemplatesPage() {
  const [existentes, setExistentes] = useState<TemplateExistente[]>([]);
  const [wabaId, setWabaId] = useState<string | null>(null);
  const [wabaIdManual, setWabaIdManual] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [forcando, setForcando] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  // Recupera WABA ID salvo no localStorage ao montar
  useEffect(() => {
    const salvo = typeof window !== "undefined" ? localStorage.getItem("waba_id") : null;
    if (salvo) setWabaIdManual(salvo);
  }, []);

  const carregar = async () => {
    setLoading(true);
    const qs = wabaIdManual ? `?waba_id=${encodeURIComponent(wabaIdManual)}` : "";
    const res = await fetch(`/api/admin/templates${qs}`);
    if (res.ok) {
      const data = await res.json();
      setExistentes(data.templates_existentes ?? []);
      setWabaId(data.waba_id ?? null);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [wabaIdManual]);

  const forcarAtualizacao = async () => {
    if (!confirm(`Forçar atualização de todos os ${TEMPLATES_JORNADA.length} templates na Meta?\n\nTemplates aprovados voltarão para PENDING (revisão 24-72h). Use só quando mudar URLs ou conteúdo dos botões.`)) return;
    setForcando(true);
    setResultados([]);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waba_id_manual: wabaIdManual || null, forcar: true }),
      });
      const data = await res.json();
      setResultados(data.resultados ?? []);
      const sucesso = data.sucesso ?? 0;
      const falhas = data.falhas ?? 0;
      if (falhas === 0) {
        alert(`✅ ${sucesso} templates atualizados!\n\nVoltarão para PENDING e serão re-aprovados em 24-72h.`);
      } else {
        alert(`⚠️ ${sucesso} atualizados, ${falhas} com erro.`);
      }
    } catch (err) {
      alert(`❌ Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setForcando(false);
      await carregar();
    }
  };

  const enviarTodos = async () => {
    if (!confirm(`Enviar todos os ${TEMPLATES_JORNADA.length} templates para aprovação na Meta? O processo pode levar alguns segundos.`)) return;
    setEnviando(true);
    setResultados([]);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waba_id_manual: wabaIdManual || null }),
      });
      const data = await res.json();

      if (!res.ok && !data.resultados) {
        alert(`❌ Falha na requisição (HTTP ${res.status})\n\n${data.error ?? data.erro ?? JSON.stringify(data).slice(0, 300)}`);
        setEnviando(false);
        return;
      }

      setResultados(data.resultados ?? []);

      const sucesso = data.sucesso ?? 0;
      const falhas = data.falhas ?? 0;
      const primeiroErro = data.resultados?.find((r: Resultado) => r.erro_meta)?.erro_meta;

      if (falhas === 0) {
        alert(`✅ ${sucesso} templates enviados com sucesso!\n\nAguarde aprovação da Meta (24-72h).`);
      } else {
        alert(`⚠️ Resultado: ${sucesso} sucesso, ${falhas} falhas.\n\nPrimeiro erro Meta:\n${primeiroErro ?? "ver tabela abaixo"}`);
      }
    } catch (err) {
      alert(`❌ Erro de conexão: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setEnviando(false);
      await carregar();
    }
  };

  const statusTemplate = (name: string): TemplateExistente | undefined =>
    existentes.find((e) => e.name === name);

  const aprovados = TEMPLATES_JORNADA.filter((t) => statusTemplate(t.name)?.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates WhatsApp</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">
            Jornada completa (Gratuito + Radar + Mentoria) — {aprovados}/{TEMPLATES_JORNADA.length} templates aprovados
            {wabaId && <span className="ml-2 text-xs opacity-50">WABA: {wabaId}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} disabled={loading} className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg disabled:opacity-50">
            🔄 Atualizar status
          </button>
          <button
            onClick={forcarAtualizacao}
            disabled={forcando || enviando}
            className="text-xs font-semibold px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            title="Atualiza templates já existentes com novo conteúdo (URL, botões)"
          >
            {forcando ? "Atualizando..." : "🔁 Forçar atualização"}
          </button>
          <button
            onClick={enviarTodos}
            disabled={enviando || forcando}
            className="text-xs font-semibold px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {enviando ? "Enviando..." : "🚀 Submeter todos à Meta"}
          </button>
        </div>
      </div>

      {/* WABA ID input */}
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <label className="text-white font-semibold text-sm">🆔 WABA ID (WhatsApp Business Account ID)</label>
          {wabaId && <span className="text-green-400 text-xs">✅ Carregado</span>}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Cole aqui o ID (ex: 123456789012345)"
            value={wabaIdManual}
            onChange={(e) => setWabaIdManual(e.target.value.trim())}
            className="flex-1 bg-[#0f1923] border border-[#0f3460] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#e63946] font-mono"
          />
          <button
            onClick={() => {
              localStorage.setItem("waba_id", wabaIdManual);
              alert("✅ WABA ID salvo localmente");
              carregar();
            }}
            disabled={!wabaIdManual}
            className="px-4 py-2 bg-[#0f3460] hover:bg-[#1a4a8a] text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
        <p className="text-[#a0a0a0] text-xs mt-2">
          Encontre em <span className="font-mono">business.facebook.com</span> → Configurações da empresa → Contas do WhatsApp → clique em <strong>alertaleiloes</strong> → o ID aparece na URL ou nos detalhes.
        </p>
      </div>

      {/* Aviso importante */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200/80">
        <p className="font-semibold mb-1">ℹ️ Como funciona a aprovação</p>
        <p>Após clicar em <strong>"Submeter todos à Meta"</strong>, cada template entra em análise. Geralmente aprovado em <strong>24 a 72 horas</strong>. Você pode verificar o status clicando em "Atualizar status".</p>
        <p className="mt-1">Templates com status <span className="text-green-400 font-semibold">APPROVED</span> já podem ser usados nos envios automáticos.</p>
      </div>

      {/* Resultado do envio */}
      {resultados.length > 0 && (
        <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-5 space-y-2">
          <p className="text-white font-semibold text-sm mb-3">Resultado do envio:</p>
          {resultados.map((r) => (
            <div key={r.nome} className="flex items-start gap-3 text-sm py-1.5 border-b border-[#0f3460]/30 last:border-0">
              <span className="text-[#a0a0a0] font-mono text-xs w-52 flex-shrink-0">{r.nome}</span>
              <div className="flex-1">
                <span className={r.status.startsWith("✅") || r.status.startsWith("🔄") ? "text-green-400" : r.status.startsWith("⏭️") ? "text-[#a0a0a0]" : "text-red-400"}>{r.status}</span>
                {r.http !== undefined && r.http > 0 && (
                  <span className="text-[#a0a0a0] text-xs ml-2">HTTP {r.http}</span>
                )}
                {r.erro_meta && (
                  <p className="text-red-300 text-xs mt-1 font-mono">{r.erro_meta}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de templates */}
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Funil", "Template", "Descrição", "Quando", "Categoria", "Status Meta"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {TEMPLATES_JORNADA.map((t) => {
              const atual = statusTemplate(t.name);
              const status = atual?.status ?? "NÃO ENVIADO";
              const corStatus = STATUS_COR[status] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20";
              const corFunil = FUNIL_COR[t.funil] ?? "text-slate-400 bg-slate-500/10";
              return (
                <tr key={t.name} className="hover:bg-[#0f3460]/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${corFunil}`}>{t.funil}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white">{t.name}</td>
                  <td className="px-4 py-3 text-[#a0a0a0] text-xs">{t.descricao}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#0f3460] text-[#a0a0a0] px-2 py-0.5 rounded-full">{t.quando}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.categoria === "UTILITY" ? "text-blue-400 bg-blue-500/10" : "text-purple-400 bg-purple-500/10"}`}>
                      {t.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${corStatus}`}>
                      {loading ? "..." : status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
