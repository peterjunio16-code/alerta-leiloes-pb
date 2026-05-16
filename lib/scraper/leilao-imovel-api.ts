/**
 * Scraper LeilãoImóvel — API pública filtrada por estado PB
 * Fonte: https://www.leilaoimovel.com.br
 *
 * Usa fetch puro (sem Playwright) — serverless-friendly.
 */

import { createServiceClient } from "@/lib/supabase/server";

export interface LeilaoImovelItem {
  titulo: string;
  cidade: string;
  bairro?: string;
  valor_avaliacao?: number;
  lance_inicial: number;
  desconto?: number;
  link?: string;
  imagem_url?: string;
  data_leilao?: string;
  tipo_imovel?: string;
  modalidade?: string;
  ocupado?: boolean;
  edital_url?: string;
  fonte: "leilao-imovel";
}

export interface LeilaoImovelResult {
  saved: number;
  skipped: number;
  errors: string[];
  total_found: number;
}

const BASE = "https://www.leilaoimovel.com.br";
const HEADERS = {
  "Accept": "application/json, text/html",
  "User-Agent": "Mozilla/5.0 (compatible; AlertaLeiloesPB/2.0)",
  "Referer": BASE,
};

async function fetchPagina(page: number): Promise<LeilaoImovelItem[]> {
  // Tenta API JSON primeiro
  const apiUrl = `${BASE}/api/v1/properties?state=PB&order_by=discount&order=desc&per_page=50&page=${page}`;
  const altUrl  = `${BASE}/imoveis?estado=PB&ordenar=desconto&pagina=${page}`;

  const endpoints = [apiUrl, altUrl];
  const items: LeilaoImovelItem[] = [];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
      if (!res.ok) continue;

      const ct = res.headers.get("content-type") ?? "";

      if (ct.includes("json")) {
        const data = await res.json();
        const list = data?.data ?? data?.imoveis ?? data?.properties ?? (Array.isArray(data) ? data : []);
        for (const item of list) {
          const parsed = parseJsonItem(item);
          if (parsed) items.push(parsed);
        }
        if (items.length > 0) break;
      }
      // HTML scraping deixamos para próxima iteração se necessário
    } catch {
      // tenta próximo endpoint
    }
  }

  return items;
}

function parseJsonItem(item: Record<string, unknown>): LeilaoImovelItem | null {
  const lance = Number(item.valor_lance ?? item.lance ?? item.price ?? item.valor ?? 0);
  const avaliacao = Number(item.valor_avaliacao ?? item.avaliacao ?? item.appraisal ?? 0);
  if (!lance || lance <= 0) return null;

  const cidade = String(item.cidade ?? item.city ?? item.municipio ?? "").trim();
  if (!cidade) return null;

  const desconto = avaliacao > 0
    ? Math.round((1 - lance / avaliacao) * 100)
    : Number(item.desconto ?? item.discount ?? 0);

  const id = String(item.id ?? item.codigo ?? "");
  const link = item.url
    ? String(item.url)
    : id ? `${BASE}/imovel/${id}` : undefined;

  return {
    titulo: buildTitulo(
      String(item.tipo ?? item.type ?? item.tipo_imovel ?? "Imóvel"),
      cidade,
      String(item.bairro ?? item.neighborhood ?? "")
    ),
    cidade: capitalize(cidade),
    bairro: String(item.bairro ?? item.neighborhood ?? "").trim() || undefined,
    valor_avaliacao: avaliacao > 0 ? avaliacao : undefined,
    lance_inicial: lance,
    desconto: desconto > 0 ? desconto : undefined,
    link,
    imagem_url: String(item.foto ?? item.image ?? item.imagem ?? "").trim() || undefined,
    data_leilao: parseDate(item.data_leilao ?? item.auction_date ?? item.data),
    tipo_imovel: normalizeTipo(String(item.tipo ?? item.type ?? item.tipo_imovel ?? "")),
    modalidade: String(item.modalidade ?? item.type_auction ?? "").trim() || undefined,
    ocupado: parseOcupado(item.ocupado ?? item.situation ?? item.situacao),
    edital_url: String(item.edital ?? item.edital_url ?? "").trim() || undefined,
    fonte: "leilao-imovel",
  };
}

function capitalize(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTitulo(tipo: string, cidade: string, bairro: string): string {
  const loc = bairro ? `${bairro} — ${cidade}` : cidade;
  return `${normalizeTipo(tipo)} em ${loc}`;
}

function normalizeTipo(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("apart") || r.includes("apto")) return "Apartamento";
  if (r.includes("casa")) return "Casa";
  if (r.includes("terreno") || r.includes("lote")) return "Terreno";
  if (r.includes("comercial") || r.includes("sala")) return "Comercial";
  if (r.includes("rural") || r.includes("sítio")) return "Rural";
  return raw || "Imóvel";
}

function parseDate(raw: unknown): string | undefined {
  if (!raw) return undefined;
  try {
    const d = new Date(String(raw));
    return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
  } catch { return undefined; }
}

function parseOcupado(raw: unknown): boolean | undefined {
  if (raw == null) return undefined;
  const s = String(raw).toLowerCase();
  if (s.includes("desocup") || s === "false" || s === "0" || s === "n") return false;
  if (s.includes("ocup") || s === "true" || s === "1" || s === "s") return true;
  return undefined;
}

/**
 * Scrape completo: busca todas as páginas de PB e salva no Supabase.
 */
export async function scrapeLeilaoImovelPB(maxPages = 5): Promise<LeilaoImovelResult> {
  const supabase = createServiceClient();
  let saved = 0;
  let skipped = 0;
  const errors: string[] = [];
  let totalFound = 0;

  for (let page = 1; page <= maxPages; page++) {
    try {
      const items = await fetchPagina(page);
      if (items.length === 0) break;
      totalFound += items.length;

      for (const item of items) {
        if (!item.link) { skipped++; continue; }

        const { data: existing } = await supabase
          .from("imoveis")
          .select("id")
          .eq("link", item.link)
          .maybeSingle();

        if (existing) { skipped++; continue; }

        const score = calcScoreSimples(item);
        const { error } = await supabase.from("imoveis").insert({
          titulo: item.titulo,
          cidade: item.cidade,
          bairro: item.bairro ?? null,
          valor_avaliacao: item.valor_avaliacao ?? null,
          lance_inicial: item.lance_inicial,
          desconto: item.desconto ?? null,
          score,
          status: "pendente",
          link: item.link ?? null,
          imagem_url: item.imagem_url ?? null,
          data_leilao: item.data_leilao ?? null,
          tipo_imovel: item.tipo_imovel ?? null,
          modalidade: item.modalidade ?? null,
          ocupado: item.ocupado ?? null,
          edital_url: item.edital_url ?? null,
          fonte: "leilao-imovel",
        });

        if (error) errors.push(`${item.titulo.slice(0, 40)}: ${error.message.slice(0, 80)}`);
        else saved++;
      }

      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      errors.push(`Página ${page}: ${err instanceof Error ? err.message.slice(0, 100) : String(err)}`);
      break;
    }
  }

  return { saved, skipped, errors, total_found: totalFound };
}

function calcScoreSimples(item: LeilaoImovelItem): number {
  let score = 5;
  const d = item.desconto ?? 0;
  if (d >= 60) score += 3;
  else if (d >= 40) score += 2;
  else if (d >= 20) score += 1;
  if (item.ocupado === false) score += 1;
  else if (item.ocupado === true) score -= 1;
  if (item.tipo_imovel === "Apartamento" || item.tipo_imovel === "Casa") score += 0.5;
  if (item.data_leilao) score += 0.5;
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}
