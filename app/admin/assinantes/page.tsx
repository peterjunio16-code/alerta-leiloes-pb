import { createServiceClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import type { Database } from "@/lib/supabase/types";

type Assinante = Database["public"]["Tables"]["assinantes_radar"]["Row"] & {
  leads: { nome: string; whatsapp: string } | null;
};

export const dynamic = "force-dynamic";

export default async function AssinantesPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("assinantes_radar")
    .select("*, leads(nome, whatsapp)")
    .order("created_at", { ascending: false }) as { data: Assinante[] | null };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assinantes Radar ({data?.length ?? 0})</h1>
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Nome", "WhatsApp", "Desde", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {data?.map((s) => (
              <tr key={s.id} className="hover:bg-[#0f3460]/50">
                <td className="px-4 py-3 text-white">{s.leads?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{s.leads?.whatsapp ?? "—"}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{new Date(s.data_inicio).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3"><Badge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && <p className="text-center text-[#a0a0a0] py-12">Nenhum assinante ativo.</p>}
      </div>
    </div>
  );
}
