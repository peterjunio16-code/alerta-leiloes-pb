"use client";

export default function SistemaPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manual do Sistema</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Documentação completa — papéis, pipeline e métricas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const iframe = document.getElementById("sistema-iframe") as HTMLIFrameElement;
              iframe?.contentWindow?.print();
            }}
            className="text-xs px-4 py-2 bg-[#0f3460] hover:bg-[#1a4a8a] text-[#a0a0a0] hover:text-white rounded-lg transition-colors"
          >
            🖨️ Imprimir
          </button>
          <a
            href="/sistema.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-4 py-2 bg-[#e63946] hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
          >
            ↗ Abrir em nova aba
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div className="rounded-xl overflow-hidden border border-[#0f3460] shadow-2xl bg-white">
        <iframe
          id="sistema-iframe"
          src="/sistema.html"
          className="w-full"
          style={{ height: "calc(100vh - 160px)", minHeight: "600px", border: "none" }}
          title="Manual do Sistema — Alerta Leilões PB"
        />
      </div>
    </div>
  );
}
