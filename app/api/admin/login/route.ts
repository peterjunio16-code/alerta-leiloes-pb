import { NextRequest, NextResponse } from "next/server";
import { findUser, encodeSession } from "@/lib/admin/users";

const ADMIN_COOKIE = "alerta_admin_session";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const user = findUser(email, password);

  if (!user) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, role: user.role, nome: user.nome });
  response.cookies.set(ADMIN_COOKIE, encodeSession(user), {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
