import { NextRequest, NextResponse } from "next/server";
import { scrapeLeilaoNinja } from "@/lib/scraper/leilao-ninja";
import { getAdminSession } from "@/lib/admin/auth";

// Aumenta o timeout para Vercel (scraping de muitas páginas)
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const maxPages = typeof body.maxPages === "number" ? body.maxPages : 50;

    const result = await scrapeLeilaoNinja(maxPages);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
