import { cookies } from "next/headers";
import { decodeSession, getAdminUsers, PERMISSIONS, type AdminRole } from "@/lib/admin/users";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<AdminRole, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "text-gold bg-gold/10 border-gold/20" },
  editor:      { label: "Editor", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  viewer:      { label: "Visualizador", color: "text-slate-300 bg-slate-300/10 border-slate-300/20" },
};

export default function UsuariosPage() {
  const sessionCookie = cookies().get("alerta_admin_session");
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  if (!session || session.role !== "super_admin") {
    redirect("/admin");
  }

  const users = getAdminUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Usuários do Painel</h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie quem tem acesso ao painel administrativo e suas permissões.
        </p>
      </div>

      {/* How to add users */}
      <div className="bg-night-800/60 border border-gold/20 rounded-xl p-5 space-y-3">
        <p className="text-gold-light font-semibold text-sm">ℹ️ Como adicionar usuários</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          Adicione a variável <code className="text-white bg-night-950 px-2 py-0.5 rounded">ADMIN_USERS</code> no Vercel com um array JSON. Exemplo:
        </p>
        <pre className="bg-night-950 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto leading-relaxed">{`[
  {
    "id": "2",
    "nome": "Sócio",
    "email": "socio@email.com",
    "password": "SenhaForte@2026",
    "role": "editor"
  },
  {
    "id": "3",
    "nome": "Analista",
    "email": "analista@email.com",
    "password": "Analista@2026",
    "role": "viewer"
  }
]`}</pre>
        <p className="text-slate-500 text-xs">Após salvar no Vercel, faça um novo deploy para aplicar.</p>
      </div>

      {/* Users table */}
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Nome", "E-mail", "Perfil", "Permissões"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {users.map((user) => {
              const roleInfo = ROLE_LABELS[user.role];
              const perms = PERMISSIONS[user.role];
              return (
                <tr key={user.id} className="hover:bg-[#0f3460]/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-sm font-bold text-gold">
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {perms.map((p) => (
                        <span key={p} className="text-xs bg-night-800 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                          {p.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role descriptions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(Object.entries(ROLE_LABELS) as [AdminRole, typeof ROLE_LABELS[AdminRole]][]).map(([role, info]) => (
          <div key={role} className="bg-night-800/40 border border-white/[0.07] rounded-xl p-5 space-y-3">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${info.color}`}>
              {info.label}
            </span>
            <ul className="space-y-1">
              {PERMISSIONS[role].map((p) => (
                <li key={p} className="text-slate-400 text-xs flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="capitalize">{p.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
