import { createServiceClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [leads, assinantes, aplicacoes, imoveis] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("assinantes_radar").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("aplicacoes_mentoria").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("imoveis").select("id", { count: "exact", head: true }).eq("status", "publicado"),
  ]);

  const stats = [
    { label: "Total de Leads", value: leads.count ?? 0, icon: "👥" },
    { label: "Assinantes Radar", value: assinantes.count ?? 0, icon: "🎯" },
    { label: "Candidaturas Pendentes", value: aplicacoes.count ?? 0, icon: "⏳" },
    { label: "Imóveis Publicados", value: imoveis.count ?? 0, icon: "🏠" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="text-sm text-[#a0a0a0] mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
