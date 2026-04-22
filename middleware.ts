import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "alerta_admin_session";

function isValidSession(value: string): boolean {
  // Support both old "authenticated" cookie and new base64 session
  if (value === "authenticated") return true;
  try {
    const json = Buffer.from(value, "base64").toString("utf-8");
    const session = JSON.parse(json);
    return !!session?.userId && !!session?.role;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_COOKIE);
  if (!session || !isValidSession(session.value)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
