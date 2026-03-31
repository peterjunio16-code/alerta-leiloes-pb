import { createServiceClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = createServiceClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leads ({leads?.length ?? 0})</h1>
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Nome", "WhatsApp", "Origem", "Status", "Data"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {leads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#0f3460]/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{lead.nome}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{lead.whatsapp}</td>
                <td className="px-4 py-3 text-[#a0a0a0] capitalize">{lead.origem}</td>
                <td className="px-4 py-3"><Badge status={lead.status} /></td>
                <td className="px-4 py-3 text-[#a0a0a0]">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads?.length && (
          <p className="text-center text-[#a0a0a0] py-12">Nenhum lead cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
