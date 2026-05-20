import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "alerta_admin_session";

type Role = "super_admin" | "editor" | "viewer" | "imoveis_only";

function decodeSession(value: string): { role: Role } | null {
  if (value === "authenticated") return { role: "super_admin" };
  try {
    const json = Buffer.from(value, "base64").toString("utf-8");
    const session = JSON.parse(json);
    if (!session?.userId || !session?.role) return null;
    return session;
  } catch {
    return null;
  }
}

// Caminhos permitidos por role — imoveis_only só vê /admin/imoveis
const ALLOWED_PATHS: Record<Role, RegExp[]> = {
  super_admin:  [/^\/admin(\/.*)?$/],
  editor:       [/^\/admin$/, /^\/admin\/(leads|imoveis|aplicacoes|blog|sistema)(\/.*)?$/],
  viewer:       [/^\/admin$/, /^\/admin\/(leads|aplicacoes|sistema)(\/.*)?$/],
  imoveis_only: [/^\/admin\/imoveis(\/.*)?$/],
};

function canAccessPath(role: Role, pathname: string): boolean {
  return (ALLOWED_PATHS[role] ?? []).some((re) => re.test(pathname));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // API routes têm sua própria validação (não bloqueia aqui pra evitar quebrar
  // chamadas server-side internas)
  if (pathname.startsWith("/admin/api")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_COOKIE);
  if (!cookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const session = decodeSession(cookie.value);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Bloqueia acesso a rotas não permitidas pelo role do usuário
  if (!canAccessPath(session.role, pathname)) {
    // Redireciona para a página inicial permitida do role
    const fallback = session.role === "imoveis_only" ? "/admin/imoveis" : "/admin";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
