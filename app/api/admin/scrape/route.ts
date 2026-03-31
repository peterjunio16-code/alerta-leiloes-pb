import { NextResponse } from "next/server";
import { scrapeLeilaoNinja } from "@/lib/scraper/leilao-ninja";

export async function POST() {
  try {
    const result = await scrapeLeilaoNinja();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
