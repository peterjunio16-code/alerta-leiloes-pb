import { chromium } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";
import fs from "fs";
import { createServiceClient } from "@/lib/supabase/server";

export interface LeilaoNinjaItem {
  titulo: string;
  cidade: string;
  bairro?: string;
  valor_avaliacao?: number;
  lance_inicial: number;
  desconto?: number;
  score?: number;
  link?: string;
  imagem_url?: string;
  data_leilao?: string;
  edital_url?: string;
}

function getLocalChromePath(): string | null {
  const localAppData =
    process.env.LOCALAPPDATA ||
    (process.env.HOME
      ? undefined
      : `C:\\Users\\${process.env.USERNAME}\\AppData\\Local`);

  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    localAppData ? `${localAppData}\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe` : undefined,
    // fallback: newer playwright versions
    localAppData ? `${localAppData}\\ms-playwright\\chromium-1224\\chrome-win64\\chrome.exe` : undefined,
    localAppData ? `${localAppData}\\ms-playwright\\chromium-1230\\chrome-win64\\chrome.exe` : undefined,
  ].filter(Boolean) as string[];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

async function launchBrowser() {
  const localChrome = getLocalChromePath();
  if (localChrome) {
    // Running locally on Windows
    return chromium.launch({ headless: true, executablePath: localChrome });
  }
  // Running on Vercel / serverless Linux
  const executablePath = await chromiumServerless.executablePath();
  return chromium.launch({
    args: chromiumServerless.args,
    executablePath,
    headless: chromiumServerless.headless,
  });
}

function parseBRL(raw: string): number | undefined {
  const cleaned = raw.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned.replace(/[^\d.]/g, ""));
  return isNaN(num) || num === 0 ? undefined : num;
}

// Extrai o link público do leiloeiro na página de detalhe do LeilãoNinja
async function extractLeiloeiroUrl(
  page: Awaited<ReturnType<ReturnType<typeof chromium.launch>["newPage"]>>,
  ninjaUrl: string
): Promise<string | undefined> {
  try {
    await page.goto(ninjaUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1000);
    const url = await page.evaluate(() => {
      // Busca botão "Ver no site do leiloeiro"
      const links = Array.from(document.querySelectorAll("a"));
      const btn = links.find(
        (a) =>
          a.textContent?.toLowerCase().includes("ver no site") ||
          a.textContent?.toLowerCase().includes("site do leiloeiro") ||
          a.textContent?.toLowerCase().includes("ver no leiloeiro")
      );
      return btn?.href ?? null;
    });
    return url ?? undefined;
  } catch {
    return undefined;
  }
}

// Extrai os cards de uma página já carregada
async function extractCardsFromPage(page: Awaited<ReturnType<ReturnType<typeof chromium.launch>["newPage"]>>) {
  return page.evaluate(() => {
    const cards = document.querySelectorAll(".imovel-card");
    return Array.from(cards).map((card) => {
      const titulo = card.querySelector("h5")?.textContent?.trim() ?? "";
      const scoreText = card.querySelector(".ipl-circle")?.textContent?.trim() ?? "";
      const score = parseFloat(scoreText);
      const precos = Array.from(card.querySelectorAll("span.font-bold.text-primary-600"))
        .map((s) => s.textContent?.trim() ?? "");
      const img = card.querySelector("img");
      const imgSrc =
        img?.getAttribute("src") ||
        img?.getAttribute("data-src") ||
        img?.getAttribute("data-lazy") ||
        "";
      const link = (card.querySelector('a[href*="/imovel/"]') as HTMLAnchorElement | null)?.href ?? "";
      let localizacao = "";
      card.querySelectorAll("span, p, small").forEach((el) => {
        const t = el.textContent?.trim() ?? "";
        if (/^.+,\s*.+\/[A-Z]{2}$/.test(t) && localizacao === "") localizacao = t;
      });
      let dataLeilao = "";
      card.querySelectorAll("span, small, p").forEach((el) => {
        const t = el.textContent?.trim() ?? "";
        if (/\d{2}\/\d{2}\/\d{4}/.test(t) && dataLeilao === "") dataLeilao = t;
      });
      return {
        titulo,
        score: isNaN(score) ? 0 : score,
        preco1: precos[0] ?? "",
        preco2: precos[1] ?? "",
        imgSrc: imgSrc.length > 10 ? imgSrc : "",
        link,
        localizacao,
        dataLeilao,
      };
    });
  });
}

export async function scrapeLeilaoNinja(maxPages = 50): Promise<{
  saved: number;
  skipped: number;
  errors: string[];
}> {
  const email = process.env.LEILAO_NINJA_EMAIL;
  const password = process.env.LEILAO_NINJA_PASSWORD;

  if (!email || !password) {
    throw new Error("LEILAO_NINJA_EMAIL e LEILAO_NINJA_PASSWORD são obrigatórios no .env.local");
  }

  // Declarado aqui para estar disponível tanto no bloco try quanto após o finally
  const supabase = createServiceClient();

  const browser = await launchBrowser();

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  const detailPage = await context.newPage(); // Página separada para detalhes

  const items: LeilaoNinjaItem[] = [];
  const errors: string[] = [];

  // Base URL: João Pessoa (98), Paraíba (20), leilões ativos, mais recentes
  const BASE_SEARCH =
    "https://leilaoninja.com/member/search?" +
    "estado_id%5B%5D=20&cidade_id%5B%5D=98&apenas_ativos=1" +
    "&order_dir=desc&results_order_by=created_at&price_type=lance";

  try {
    // 1. Login
    await page.goto("https://leilaoninja.com/login", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/member/**", { timeout: 30000 });

    // 2. Descobre o total de páginas na página 1
    await page.goto(`${BASE_SEARCH}&page=1`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1500);

    const totalPages = await page.evaluate(() => {
      // Pega o maior número de página nos links de paginação
      const links = Array.from(document.querySelectorAll('a[href*="page="]'));
      const nums = links
        .map((a) => {
          const m = (a.getAttribute("href") || "").match(/[?&]page=(\d+)/);
          return m ? parseInt(m[1]) : 0;
        })
        .filter((n) => n > 0);
      return nums.length > 0 ? Math.max(...nums) : 1;
    });

    const pagesToScrape = Math.min(totalPages, maxPages);
    console.log(`LeilãoNinja: ${totalPages} páginas encontradas, raspando até ${pagesToScrape}`);

    // Busca os links já existentes no banco para parar cedo
    const { data: existingLinks } = await supabase
      .from("imoveis")
      .select("link")
      .not("link", "is", null);
    const knownLinks = new Set((existingLinks ?? []).map((r: { link: string }) => r.link));

    const STOP_AFTER_DUPLICATES = 5; // Para se encontrar 5 seguidos já existentes

    // 3. Itera por todas as páginas — para quando encontrar apenas duplicatas
    let stopScraping = false;
    for (let pageNum = 1; pageNum <= pagesToScrape && !stopScraping; pageNum++) {
      try {
        if (pageNum > 1) {
          await page.goto(`${BASE_SEARCH}&page=${pageNum}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          await page.waitForTimeout(800);
        }

        // Scrola para carregar lazy-load
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight));
          await page.waitForTimeout(400);
        }

        const rawListings = await extractCardsFromPage(page);
        if (rawListings.length === 0) break;

        let consecutiveDuplicates = 0;

        for (const l of rawListings) {
          if (!l.titulo || l.titulo.length < 5) continue;
          if (!l.imgSrc) continue;

          // Se o link já existe no banco, conta como duplicata
          if (l.link && knownLinks.has(l.link)) {
            consecutiveDuplicates++;
            if (consecutiveDuplicates >= STOP_AFTER_DUPLICATES) {
              console.log(`Encontrados ${STOP_AFTER_DUPLICATES} duplicatas seguidas na página ${pageNum} — parando.`);
              stopScraping = true;
              break;
            }
            continue;
          }
          consecutiveDuplicates = 0; // Reset ao encontrar imóvel novo

          const avaliacao = l.preco2 ? parseBRL(l.preco1) : undefined;
          const lance = parseBRL(l.preco2 || l.preco1);
          if (!lance) continue;

          const [bairroPart, cidadePart] = l.localizacao.split(",").map((s) => s.trim());
          const cidade = cidadePart?.split("/")[0]?.trim() || "João Pessoa";
          const bairro = bairroPart || undefined;

          let desconto: number | undefined;
          if (avaliacao && lance && avaliacao > lance) {
            desconto = parseFloat((((avaliacao - lance) / avaliacao) * 100).toFixed(1));
          }

          let dataLeilao: string | undefined;
          if (l.dataLeilao) {
            const match = l.dataLeilao.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) dataLeilao = `${match[3]}-${match[2]}-${match[1]}`;
          }

          // Visita a página do imóvel no LeilãoNinja para pegar o link público do leiloeiro
          let edital_url: string | undefined;
          if (l.link) {
            edital_url = await extractLeiloeiroUrl(detailPage, l.link);
          }

          items.push({
            titulo: l.titulo,
            cidade,
            bairro,
            lance_inicial: lance,
            valor_avaliacao: avaliacao,
            desconto,
            score: l.score,
            link: l.link || undefined,
            imagem_url: l.imgSrc,
            data_leilao: dataLeilao,
            edital_url,
          });
          if (l.link) knownLinks.add(l.link); // Evita duplicata dentro da mesma sessão
        }
      } catch (pageErr) {
        errors.push(`Erro na página ${pageNum}: ${pageErr instanceof Error ? pageErr.message : String(pageErr)}`);
      }
    }
  } catch (err) {
    errors.push(`Erro no scraper: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await browser.close();
  }

  if (items.length === 0 && errors.length === 0) {
    errors.push("Nenhum imóvel encontrado. Verifique o login e se há leilões ativos em João Pessoa/PB.");
  }

  // 4. Salva no Supabase (deduplica por link)
  let saved = 0;
  let skipped = 0;

  for (const item of items) {
    let isDuplicate = false;

    if (item.link) {
      const { data: existing } = await supabase
        .from("imoveis")
        .select("id")
        .eq("link", item.link)
        .maybeSingle();
      if (existing) isDuplicate = true;
    }

    if (isDuplicate) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("imoveis").insert({
      ...item,
      status: "pendente",
      grupo_destino: "gratuito",
    });

    if (error) {
      errors.push(`Erro ao salvar "${item.titulo}": ${error.message}`);
    } else {
      saved++;
    }
  }

  return { saved, skipped, errors };
}
