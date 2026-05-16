/**
 * Scraper Caixa Econômica Federal — Imóveis para Venda/Leilão na PB
 *
 * Fontes:
 *   1. API pública: venda.caixa.gov.br (imóveis em venda direta)
 *   2. Leilões judiciais: leiloes.caixa.gov.br
 *
 * Não requer Playwright — usa fetch puro (mais estável em serverless).
 */

import { createServiceClient } from "@/lib/supabase/server";

export interface CaixaImovel {
  titulo: string;
  cidade: string;
  bairro?: string;
  endereco?: string;
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
  processo_numero?: string;
  fonte: "caixa";
}

export interface CaixaScrapeResult {
  saved: number;
  skipped: number;
  errors: string[];
  total_found: number;
}

// Caixa Venda Direta API — retorna JSON paginado
async function fetchCaixaVendaPage(uf: string, page: number): Promise<CaixaImovel[]> {
  const url = new URL("https://venda.caixa.gov.br/portalimoveiscef/rest/imoveis/listaimoveis");
  url.searchParams.set("tipoBusca", "LISTA");
  url.searchParams.set("uf", uf);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", "50");
  url.searchParams.set("sort", "preco,ASC");

  const res = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; AlertaLeiloesPB/1.0)",
      "Referer": "https://venda.caixa.gov.br/",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Caixa API error: HTTP ${res.status}`);
  }

  const data = await res.json();
  const items: CaixaImovel[] = [];

  // A Caixa retorna diferentes formatos — normaliza aqui
  const list = data?.listaimoveis ?? data?.imoveis ?? data?.content ?? data ?? [];
  if (!Array.isArray(list)) return items;

  for (const item of list) {
    try {
      const lance = parseFloat(String(item.preco ?? item.valorVenda ?? item.lance ?? 0).replace(/[^\d,]/g, "").replace(",", "."));
      const avaliacao = parseFloat(String(item.valorAvaliacao ?? item.avaliacao ?? 0).replace(/[^\d,]/g, "").replace(",", "."));

      if (!lance || lance <= 0) continue;

      const cidade = normalizeCity(
        item.municipio ?? item.cidade ?? item.nomeMunicipio ?? ""
      );
      if (!cidade) continue;

      const desconto = avaliacao > 0 && lance > 0
        ? Math.round((1 - lance / avaliacao) * 100)
        : undefined;

      const tipo = normalizeTipo(item.tipo ?? item.tipoImovel ?? item.descricaoTipo ?? "");
      const numLogradouro = item.numero ? ` ${item.numero}` : "";
      const endereco = item.logradouro ? `${item.logradouro}${numLogradouro}` : undefined;

      items.push({
        titulo: buildTitulo(tipo, cidade, item.bairro),
        cidade,
        bairro: item.bairro ?? undefined,
        endereco,
        valor_avaliacao: avaliacao > 0 ? avaliacao : undefined,
        lance_inicial: lance,
        desconto: desconto && desconto > 0 ? desconto : undefined,
        link: buildLink(item),
        imagem_url: item.urlFoto ?? item.foto ?? undefined,
        data_leilao: parseDate(item.dataLeilao ?? item.data),
        tipo_imovel: tipo,
        modalidade: item.modalidade ?? item.descricaoModalidade ?? undefined,
        ocupado: parseOcupado(item.ocupado ?? item.situacaoOcupacao),
        edital_url: item.urlEdital ?? item.edital ?? undefined,
        processo_numero: String(item.matricula ?? item.numeroProcesso ?? "").trim() || undefined,
        fonte: "caixa",
      });
    } catch {
      // item malformado, ignora
    }
  }

  return items;
}

function normalizeCity(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    || "";
}

function normalizeTipo(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("apart") || r.includes("apto")) return "Apartamento";
  if (r.includes("casa")) return "Casa";
  if (r.includes("terreno") || r.includes("lote")) return "Terreno";
  if (r.includes("comercial") || r.includes("sala")) return "Comercial";
  if (r.includes("rural") || r.includes("sítio") || r.includes("sitio")) return "Rural";
  return raw || "Imóvel";
}

function buildTitulo(tipo: string, cidade: string, bairro?: string): string {
  const loc = bairro ? `${bairro} — ${cidade}` : cidade;
  return `${tipo} em ${loc}`;
}

function buildLink(item: Record<string, unknown>): string | undefined {
  const id = item.id ?? item.codigo ?? item.matricula;
  if (!id) return undefined;
  return `https://venda.caixa.gov.br/portalimoveiscef/imovel/${id}`;
}

function parseDate(raw: unknown): string | undefined {
  if (!raw) return undefined;
  try {
    const d = new Date(String(raw));
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

function parseOcupado(raw: unknown): boolean | undefined {
  if (raw === null || raw === undefined) return undefined;
  const s = String(raw).toLowerCase();
  if (s.includes("desocup") || s === "false" || s === "0" || s === "n") return false;
  if (s.includes("ocup") || s === "true" || s === "1" || s === "s") return true;
  return undefined;
}

/**
 * Scrape completo: busca todas as páginas de PB e salva no Supabase.
 */
export async function scrapeCaixaCEF(maxPages = 20): Promise<CaixaScrapeResult> {
  const supabase = createServiceClient();
  let saved = 0;
  let skipped = 0;
  const errors: string[] = [];
  let totalFound = 0;
  const CIDADES_PB = new Set<string>();

  // Busca imóveis na PB
  for (let page = 0; page < maxPages; page++) {
    try {
      const items = await fetchCaixaVendaPage("PB", page);

      if (items.length === 0) break; // sem mais páginas

      totalFound += items.length;

      for (const item of items) {
        CIDADES_PB.add(item.cidade);

        // Verifica se já existe (por link ou processo)
        const { data: existing } = await supabase
          .from("imoveis")
          .select("id")
          .or(
            item.processo_numero
              ? `link.eq.${item.link},processo_numero.eq.${item.processo_numero}`
              : `link.eq.${item.link}`
          )
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        // Calcula score inicial simples
        const score = calcScoreSimples(item);

        const { error } = await supabase.from("imoveis").insert({
          titulo: item.titulo,
          cidade: item.cidade,
          bairro: item.bairro ?? null,
          endereco: item.endereco ?? null,
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
          processo_numero: item.processo_numero ?? null,
          fonte: "caixa",
        });

        if (error) {
          errors.push(`${item.titulo}: ${error.message.slice(0, 100)}`);
        } else {
          saved++;
        }
      }

      // Pausa entre páginas
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Página ${page}: ${msg.slice(0, 150)}`);
      break;
    }
  }

  return { saved, skipped, errors, total_found: totalFound };
}

/**
 * Score simples baseado só em dados disponíveis sem IA.
 * Score com IA é gerado separadamente via /api/admin/imoveis/[id]/score
 */
function calcScoreSimples(item: CaixaImovel): number {
  let score = 5; // base

  // Desconto
  const d = item.desconto ?? 0;
  if (d >= 60) score += 3;
  else if (d >= 40) score += 2;
  else if (d >= 20) score += 1;

  // Desocupado = melhor
  if (item.ocupado === false) score += 1;
  else if (item.ocupado === true) score -= 1;

  // Tipo favorito
  if (item.tipo_imovel === "Apartamento" || item.tipo_imovel === "Casa") score += 0.5;

  // Tem data (leilão confirmado)
  if (item.data_leilao) score += 0.5;

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}
