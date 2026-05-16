import { chromium } from "playwright-core";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const email = process.env.LEILAO_NINJA_EMAIL;
const password = process.env.LEILAO_NINJA_PASSWORD;

function findChrome() {
  const localAppData = process.env.LOCALAPPDATA || `C:\\Users\\${process.env.USERNAME}\\AppData\\Local`;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

const browser = await chromium.launch({
  headless: false, // visível para depuração
  executablePath: findChrome(),
});

const page = await browser.newPage({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});

// Login
await page.goto("https://leilaoninja.com/login", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1000);
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForURL("**/member/**", { timeout: 20000 });
console.log("Login OK:", page.url());

const BASE = "https://leilaoninja.com/member/search?estado_id%5B%5D=20&cidade_id%5B%5D=98&apenas_ativos=1&order_dir=desc&results_order_by=created_at&price_type=lance";
await page.goto(`${BASE}&page=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(2000);

// Scroll para carregar lazy content
for (let i = 0; i < 5; i++) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(500);
}

// Salvar HTML completo para inspeção
const html = await page.content();
fs.writeFileSync("debug-page.html", html);
console.log("HTML salvo em debug-page.html");

// Testar seletores comuns
const info = await page.evaluate(() => {
  const results = {};
  // Conta elementos por seletor
  const selectors = [
    ".imovel-card", "[class*='imovel']", "[class*='card']",
    "article", ".property", "[class*='property']",
    "[class*='item']", "[class*='listing']",
    "a[href*='/imovel/']",
  ];
  for (const sel of selectors) {
    results[sel] = document.querySelectorAll(sel).length;
  }
  // Mostra os primeiros links de imóvel
  const links = Array.from(document.querySelectorAll('a[href*="/imovel/"]')).slice(0, 3).map(a => ({
    href: a.href,
    text: a.textContent?.trim().slice(0, 80),
    parentClass: a.parentElement?.className,
    grandParentClass: a.parentElement?.parentElement?.className,
  }));
  results._imovelLinks = links;

  // URL atual
  results._url = window.location.href;
  return results;
});

console.log("\n=== Seletores encontrados ===");
for (const [k, v] of Object.entries(info)) {
  if (k.startsWith("_")) continue;
  if (v > 0) console.log(`  ${k}: ${v} elementos`);
}
console.log("\n=== Links de imóveis ===");
console.log(JSON.stringify(info._imovelLinks, null, 2));
console.log("\nURL:", info._url);

await page.waitForTimeout(3000);
await browser.close();
