import { cookies } from "next/headers";

/** Verifica se a requisição vem de um admin logado. Retorna a session ou null. */
export function getAdminSession() {
  const cookie = cookies().get("alerta_admin_session");
  if (!cookie?.value) return null;
  try {
    const json = Buffer.from(cookie.value, "base64").toString("utf-8");
    const session = JSON.parse(json);
    return session?.userId ? session : null;
  } catch {
    return null;
  }
}

export function requireAdmin() {
  const session = getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
