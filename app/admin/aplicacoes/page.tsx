import { createServiceClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import type { Database } from "@/lib/supabase/types";

type Aplicacao = Database["public"]["Tables"]["aplicacoes_mentoria"]["Row"];

export const dynamic = "force-dynamic";

export default async function AplicacoesPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("aplicacoes_mentoria")
    .select("*")
    .order("created_at", { ascending: false }) as { data: Aplicacao[] | null };

  const orcamentoLabel: Record<string, string> = {
    "ate-50k": "Até R$50k",
    "50k-100k": "R$50k–100k",
    "100k-200k": "R$100k–200k",
    "acima-200k": "+R$200k",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Candidaturas Mentoria ({data?.length ?? 0})</h1>
      <div className="space-y-4">
        {data?.map((a) => (
          <div key={a.id} className="bg-[#16213e] border border-[#0f3460] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{a.nome}</h3>
                <p className="text-[#a0a0a0] text-sm">{a.whatsapp}</p>
              </div>
              <Badge status={a.status} />
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#a0a0a0] text-xs mb-1">Já fez leilão?</p>
                <p className="text-white">{a.participou_leilao ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-xs mb-1">Orçamento</p>
                <p className="text-white">{orcamentoLabel[a.orcamento ?? ""] ?? a.orcamento ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-xs mb-1">Data</p>
                <p className="text-white">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[#a0a0a0] text-xs mb-1">Principal trava</p>
              <p className="text-[#e0e0e0] text-sm bg-[#0f3460] rounded-lg p-3">{a.trava}</p>
            </div>
          </div>
        ))}
        {!data?.length && <p className="text-center text-[#a0a0a0] py-12">Nenhuma candidatura ainda.</p>}
      </div>
    </div>
  );
}
