"use client";

import { useEffect, useState } from "react";

type TemplateExistente = {
  name: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "PAUSED" | string;
  category: string;
  language: string;
};

type Resultado = { nome: string; status: string; detalhe: unknown };

const STATUS_COR: Record<string, string> = {
  APPROVED: "text-green-400 bg-green-500/10 border-green-500/20",
  PENDING:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
  PAUSED:   "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const TEMPLATES_JORNADA = [
  { name: "boas_vindas_alerta",     descricao: "Enviado ao se cadastrar no grupo", categoria: "UTILITY",   quando: "Cadastro" },
  { name: "alerta_imovel_gratuito", descricao: "Alerta de imóvel para leads free", categoria: "MARKETING", quando: "Publicar imóvel" },
  { name: "alerta_imovel_radar",    descricao: "Alerta premium para assinantes",   categoria: "MARKETING", quando: "Publicar imóvel" },
  { name: "lembrete_leilao_48h",    descricao: "Lembrete 48h antes do leilão",     categoria: "UTILITY",   quando: "48h antes" },
  { name: "nutricao_leiloes_d1",    descricao: "Nutrição — dia 1 após cadastro",   categoria: "MARKETING", quando: "Dia +1" },
  { name: "nutricao_leiloes_d3",    descricao: "Nutrição — dia 3 após cadastro",   categoria: "MARKETING", quando: "Dia +3" },
  { name: "nutricao_leiloes_d7",    descricao: "Nutrição — dia 7 após cadastro",   categoria: "MARKETING", quando: "Dia +7" },
  { name: "nutricao_leiloes_d14",   descricao: "Nutrição — dia 14 após cadastro",  categoria: "MARKETING", quando: "Dia +14" },
  { name: "convite_mentoria_pb",    descricao: "Convite para candidatura mentoria", categoria: "MARKETING", quando: "Manual" },
];

export default function TemplatesPage() {
  const [existentes, setExistentes] = useState<TemplateExistente[]>([]);
  const [wabaId, setWabaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/templates");
    if (res.ok) {
      const data = await res.json();
      setExistentes(data.templates_existentes ?? []);
      setWabaId(data.waba_id ?? null);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const enviarTodos = async () => {
    if (!confirm("Enviar todos os 9 templates para aprovação na Meta? O processo pode levar alguns segundos.")) return;
    setEnviando(true);
    setResultados([]);
    const res = await fetch("/api/admin/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const data = await res.json();
    setResultados(data.resultados ?? []);
    setEnviando(false);
    await carregar();
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
            Jornada completa do cliente — {aprovados}/{TEMPLATES_JORNADA.length} templates aprovados
            {wabaId && <span className="ml-2 text-xs opacity-50">WABA: {wabaId}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregar} disabled={loading} className="text-xs text-[#a0a0a0] hover:text-white px-3 py-1.5 bg-[#0f3460] rounded-lg disabled:opacity-50">
            🔄 Atualizar status
          </button>
          <button
            onClick={enviarTodos}
            disabled={enviando}
            className="text-xs font-semibold px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {enviando ? "Enviando..." : "🚀 Submeter todos à Meta"}
          </button>
        </div>
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
            <div key={r.nome} className="flex items-center gap-3 text-sm">
              <span className="text-[#a0a0a0] font-mono text-xs w-52 flex-shrink-0">{r.nome}</span>
              <span className={r.status.startsWith("✅") ? "text-green-400" : "text-red-400"}>{r.status}</span>
              {(r.detalhe as { error?: { message?: string } })?.error && (
                <span className="text-red-300 text-xs">{(r.detalhe as { error: { message: string } }).error.message}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabela de templates */}
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Template", "Descrição", "Quando dispara", "Categoria", "Status Meta"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {TEMPLATES_JORNADA.map((t) => {
              const atual = statusTemplate(t.name);
              const status = atual?.status ?? "NÃO ENVIADO";
              const corStatus = STATUS_COR[status] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20";
              return (
                <tr key={t.name} className="hover:bg-[#0f3460]/30 transition-colors">
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
