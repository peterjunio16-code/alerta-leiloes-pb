export type AdminRole = "super_admin" | "editor" | "viewer" | "imoveis_only";

export type AdminUser = {
  id: string;
  nome: string;
  email: string;
  password: string;
  role: AdminRole;
};

export type AdminSession = {
  userId: string;
  nome: string;
  role: AdminRole;
};

// Permissions per role
export const PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin:  ["dashboard", "leads", "imoveis", "assinantes", "aplicacoes", "blog", "usuarios"],
  editor:       ["dashboard", "leads", "imoveis", "aplicacoes", "blog"],
  viewer:       ["dashboard", "leads", "aplicacoes"],
  imoveis_only: ["imoveis"],
};

export function canAccess(role: AdminRole, section: string): boolean {
  return PERMISSIONS[role]?.includes(section) ?? false;
}

// Load users from env (JSON array) + default super_admin
export function getAdminUsers(): AdminUser[] {
  const defaults: AdminUser[] = [
    {
      id: "1",
      nome: "Peter",
      email: process.env.ADMIN_EMAIL ?? "peterjunio16@gmail.com",
      password: process.env.ADMIN_PASSWORD ?? "Admin@2026!",
      role: "super_admin",
    },
    {
      id: "2",
      nome: "Domingos",
      email: "domingos@gmail.com",
      password: "domingos",
      role: "imoveis_only",
    },
  ];

  const extra = process.env.ADMIN_USERS;
  if (!extra) return defaults;

  try {
    const parsed: AdminUser[] = JSON.parse(extra);
    // Avoid duplicate emails
    const existingEmails = new Set(defaults.map((u) => u.email));
    const unique = parsed.filter((u) => !existingEmails.has(u.email));
    return [...defaults, ...unique];
  } catch {
    console.error("[admin] Failed to parse ADMIN_USERS env var");
    return defaults;
  }
}

export function findUser(email: string, password: string): AdminUser | null {
  const users = getAdminUsers();
  return users.find((u) => u.email === email && u.password === password) ?? null;
}

export function encodeSession(user: AdminUser): string {
  const session: AdminSession = { userId: user.id, nome: user.nome, role: user.role };
  return Buffer.from(JSON.stringify(session)).toString("base64");
}

export function decodeSession(token: string): AdminSession | null {
  try {
    const json = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(json) as AdminSession;
  } catch {
    return null;
  }
}
