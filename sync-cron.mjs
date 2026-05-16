// Script para rodar na VPS via cron — sem servidor HTTP
// Uso: node sync-cron.mjs
// Crontab: 0 8 * * * /usr/bin/node /home/usuario/alerta-leiloes/sync-cron.mjs >> /var/log/alerta-sync.log 2>&1

import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: new URL(".env.local", import.meta.url).pathname });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function findChrome() {
  const isLinux = process.platform === "linux";
  if (isLinux) {
    const candidates = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      `${process.env.HOME}/.cache/ms-playwright/chromium-1224/chrome-linux/chrome`,
      `${process.env.HOME}/.cache/ms-playwright/chromium-1230/chrome-linux/chrome`,
      `${process.env.HOME}/.cache/ms-playwright/chromium-1161/chrome-linux/chrome`,
    ];
    return candidates.find((p) => fs.existsSync(p)) ?? null;
  }
  const localAppData = process.env.LOCALAPPDATA || `C:\\Users\\${process.env.USERNAME}\\AppData\\Local`;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    `${localAppData}\\ms-playwright\\chromium-1224\\chrome-win64\\chrome.exe`,
    `${localAppData}\\ms-playwright\\chromium-1230\\chrome-win64\\chrome.exe`,
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function parseBRL(raw) {
  if (!raw) return undefined;
  const cleaned = raw.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned.replace(/[^\d.]/g, ""));
  return isNaN(num) || num === 0 ? undefined : num;
}

async function sync(maxPages = 30) {
  const email = process.env.LEILAO_NINJA_EMAIL;
  const password = process.env.LEILAO_NINJA_PASSWORD;
  if (!email || !password) throw new Error("Credenciais não configuradas");

  const chromePath = findChrome();
  console.log(`[${new Date().toISOString()}] Chrome: ${chromePath ?? "playwright bundled"}`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    ...(chromePath ? { executablePath: chromePath } : {}),
  });

  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const items = [];
  const errors = [];

  try {
    await page.goto("https://leilaoninja.com/login", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/member/**", { timeout: 20000 });
    console.log(`[${new Date().toISOString()}] Login OK`);

    const BASE = "https://leilaoninja.com/member/search?estado_id%5B%5D=20&cidade_id%5B%5D=98&apenas_ativos=1&order_dir=desc&results_order_by=created_at&price_type=lance";

    await page.goto(`${BASE}&page=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".imovel-card", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const totalPages = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="page="]'));
      const nums = links.map(a => { const m = (a.getAttribute("href") || "").match(/[?&]page=(\d+)/); return m ? parseInt(m[1]) : 0; }).filter(n => n > 0);
      return nums.length > 0 ? Math.max(...nums) : 1;
    });

    const pagesToScrape = Math.min(totalPages, maxPages);
    console.log(`[${new Date().toISOString()}] Total: ${totalPages} páginas, scraping até ${pagesToScrape}`);

    const { data: existingLinks } = await supabase.from("imoveis").select("link").not("link", "is", null);
    const knownLinks = new Set((existingLinks ?? []).map(r => r.link));

    for (let pageNum = 1; pageNum <= pagesToScrape; pageNum++) {
      if (pageNum > 1) {
        await page.goto(`${BASE}&page=${pageNum}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForSelector(".imovel-card", { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(600);
      }

      for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(400);
      }

      const cards = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".imovel-card")).map(card => ({
          titulo: card.querySelector("h5")?.textContent?.trim() ?? "",
          score: parseFloat(card.querySelector(".ipl-circle")?.textContent?.trim() ?? "0") || 0,
          avaliacao: card.querySelector("span.font-bold.text-gray-500")?.textContent?.trim() ?? "",
          lance: card.querySelector("span.font-bold.text-primary-600")?.textContent?.trim() ?? "",
          imgSrc: card.querySelector("img")?.getAttribute("src") || "",
          link: card.querySelector('a[href*="/imovel/"]')?.href ?? "",
          localizacao: (() => {
            let loc = "";
            card.querySelectorAll("p").forEach(el => {
              const t = el.textContent?.trim() ?? "";
              if (/^.+,\s*.+\/[A-Z]{2}$/.test(t) && !loc) loc = t;
            });
            return loc;
          })(),
        }));
      });

      if (cards.length === 0) {
        console.log(`[${new Date().toISOString()}] Página ${pageNum}: sem cards, parando`);
        break;
      }

      let novoNestaPagina = 0;
      let consecutiveDupes = 0;
      for (const c of cards) {
        if (!c.titulo || c.titulo.length < 5) continue;
        if (c.link && knownLinks.has(c.link)) { consecutiveDupes++; if (consecutiveDupes >= 5) break; continue; }
        consecutiveDupes = 0;

        const lanceVal = parseBRL(c.lance || c.avaliacao);
        if (!lanceVal) continue;
        const avaliacaoVal = parseBRL(c.avaliacao);

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
        novoNestaPagina++;
      }

      console.log(`[${new Date().toISOString()}] Página ${pageNum}/${pagesToScrape} — ${novoNestaPagina} novos (total: ${items.length})`);
    }
  } catch (err) {
    errors.push(err.message);
    console.error(`[${new Date().toISOString()}] ERRO:`, err.message);
  } finally {
    await browser.close();
  }

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

  console.log(`[${new Date().toISOString()}] ✅ Resultado: saved=${saved} skipped=${skipped} errors=${errors.length}`);
  if (errors.length) console.error("Erros:", errors);
  return { saved, skipped, errors };
}

sync(30).catch(console.error);
