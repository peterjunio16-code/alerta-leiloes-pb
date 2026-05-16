// Servidor local de sincronização — rode com: node sync-server.mjs
import { createServer } from "http";
import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PORT = 3100;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function findChrome() {
  const isLinux = process.platform === "linux";
  if (isLinux) {
    // Linux (VPS/servidor): usa Playwright bundled ou Chrome instalado
    const linuxCandidates = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      `${process.env.HOME}/.cache/ms-playwright/chromium-1224/chrome-linux/chrome`,
      `${process.env.HOME}/.cache/ms-playwright/chromium-1230/chrome-linux/chrome`,
      `${process.env.HOME}/.cache/ms-playwright/chromium-1161/chrome-linux/chrome`,
    ];
    return linuxCandidates.find((p) => fs.existsSync(p)) ?? null;
  }
  // Windows
  const localAppData = process.env.LOCALAPPDATA || `C:\\Users\\${process.env.USERNAME}\\AppData\\Local`;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${localAppData}\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe`,
    `${localAppData}\\ms-playwright\\chromium-1224\\chrome-win64\\chrome.exe`,
    `${localAppData}\\ms-playwright\\chromium-1230\\chrome-win64\\chrome.exe`,
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function parseBRL(raw) {
  const cleaned = raw.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned.replace(/[^\d.]/g, ""));
  return isNaN(num) || num === 0 ? undefined : num;
}

async function sync(maxPages = 20) {
  const email = process.env.LEILAO_NINJA_EMAIL;
  const password = process.env.LEILAO_NINJA_PASSWORD;
  if (!email || !password) throw new Error("Credenciais LeilãoNinja não configuradas no .env.local");

  const chromePath = findChrome();
  console.log("Chrome:", chromePath ?? "playwright bundled");
  const browser = await chromium.launch({
    headless: true,
    ...(chromePath ? { executablePath: chromePath } : {}),
  });

  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const items = [];
  const errors = [];

  try {
    // Login
    await page.goto("https://leilaoninja.com/login", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/member/**", { timeout: 20000 });
    console.log("Login OK:", page.url());

    const BASE = "https://leilaoninja.com/member/search?estado_id%5B%5D=20&cidade_id%5B%5D=98&apenas_ativos=1&order_dir=desc&results_order_by=created_at&price_type=lance";

    // Descobre total de páginas
    await page.goto(`${BASE}&page=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Espera os cards aparecerem (JS rendering)
    await page.waitForSelector(".imovel-card", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const totalPages = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="page="]'));
      const nums = links.map(a => { const m = (a.getAttribute("href") || "").match(/[?&]page=(\d+)/); return m ? parseInt(m[1]) : 0; }).filter(n => n > 0);
      return nums.length > 0 ? Math.max(...nums) : 1;
    });

    const pagesToScrape = Math.min(totalPages, maxPages);
    console.log(`Total: ${totalPages} páginas, scraping até ${pagesToScrape}`);

    // Links já no banco
    const { data: existingLinks } = await supabase.from("imoveis").select("link").not("link", "is", null);
    const knownLinks = new Set((existingLinks ?? []).map(r => r.link));

    for (let pageNum = 1; pageNum <= pagesToScrape; pageNum++) {
      if (pageNum > 1) {
        await page.goto(`${BASE}&page=${pageNum}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Espera os cards aparecerem antes de extrair
        await page.waitForSelector(".imovel-card", { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(600);
      }

      for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(400);
      }

      const pageDebug = await page.evaluate(() => ({
        cards: document.querySelectorAll(".imovel-card").length,
        title: document.title,
        url: window.location.href,
        bodySnippet: document.body?.textContent?.trim().slice(0, 200),
      }));
      console.log(`  p${pageNum}: cards=${pageDebug.cards} title="${pageDebug.title}" url=${pageDebug.url}`);
      if (pageDebug.cards === 0) console.log(`  body: ${pageDebug.bodySnippet}`);

      const cards = await page.evaluate(() => {
        const cards = document.querySelectorAll(".imovel-card");
        return Array.from(cards).map(card => {
          const titulo = card.querySelector("h5")?.textContent?.trim() ?? "";
          const scoreText = card.querySelector(".ipl-circle")?.textContent?.trim() ?? "";
          const score = parseFloat(scoreText);
          // Avaliação: text-gray-500, Lance: text-primary-600
          const avaliacao = card.querySelector("span.font-bold.text-gray-500")?.textContent?.trim() ?? "";
          const lance = card.querySelector("span.font-bold.text-primary-600")?.textContent?.trim() ?? "";
          const img = card.querySelector("img");
          const imgSrc = img?.getAttribute("src") || img?.getAttribute("data-src") || "";
          const link = card.querySelector('a[href*="/imovel/"]')?.href ?? "";
          let localizacao = "";
          card.querySelectorAll("span, p, small").forEach(el => {
            const t = el.textContent?.trim() ?? "";
            if (/^.+,\s*.+\/[A-Z]{2}$/.test(t) && localizacao === "") localizacao = t;
          });
          return { titulo, score: isNaN(score) ? 0 : score, avaliacao, lance, imgSrc, link, localizacao };
        });
      });

      if (cards.length === 0) break;

      // Debug primeiro card
      if (pageNum === 1 && cards.length > 0) {
        console.log("  Primeiro card:", JSON.stringify(cards[0]));
      }

      let consecutiveDupes = 0;
      for (const c of cards) {
        if (!c.titulo || c.titulo.length < 5) { console.log("  SKIP titulo:", JSON.stringify(c.titulo)); continue; }
        if (c.link && knownLinks.has(c.link)) { consecutiveDupes++; if (consecutiveDupes >= 5) break; continue; }
        consecutiveDupes = 0;

        const lanceVal = parseBRL(c.lance || c.avaliacao);
        if (!lanceVal) continue;
        const avaliacaoVal = c.avaliacao ? parseBRL(c.avaliacao) : undefined;

        let desconto;
        if (avaliacaoVal && lanceVal && avaliacaoVal > lanceVal) {
          desconto = parseFloat((((avaliacaoVal - lanceVal) / avaliacaoVal) * 100).toFixed(1));
        }

        const [bairroPart, cidadePart] = (c.localizacao || "").split(",").map(s => s.trim());
        const cidade = cidadePart?.split("/")?.[0]?.trim() || "João Pessoa";

        items.push({
          titulo: c.titulo,
          cidade,
          bairro: bairroPart || undefined,
          lance_inicial: lanceVal,
          valor_avaliacao: avaliacaoVal,
          desconto,
          score: c.score,
          link: c.link || undefined,
          imagem_url: c.imgSrc.length > 10 ? c.imgSrc : undefined,
        });

        if (c.link) knownLinks.add(c.link);
      }

      console.log(`Página ${pageNum}/${pagesToScrape} — ${items.length} novos até agora`);
    }
  } catch (err) {
    errors.push(`Erro: ${err.message}`);
    console.error(err);
  } finally {
    await browser.close();
  }

  // Salva no Supabase
  let saved = 0, skipped = 0;
  for (const item of items) {
    if (item.link) {
      const { data: ex } = await supabase.from("imoveis").select("id").eq("link", item.link).maybeSingle();
      if (ex) { skipped++; continue; }
    }
    const { error } = await supabase.from("imoveis").insert({ ...item, status: "pendente", grupo_destino: "gratuito" });
    if (error) errors.push(`Erro ao salvar "${item.titulo}": ${error.message}`);
    else saved++;
  }

  return { saved, skipped, errors };
}

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }
  if (req.url === "/ping") { res.writeHead(200); res.end("ok"); return; }

  if (req.url === "/sync" && req.method === "POST") {
    console.log("Iniciando sincronização...");
    try {
      const result = await sync(20);
      console.log("Resultado:", result);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ errors: [err.message] }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n✅ Servidor de sync rodando em http://localhost:${PORT}`);
  console.log("   Aguardando chamadas do painel admin...\n");
});
