// SETUP REQUIRED: npm install playwright && npx playwright install chromium
import { chromium } from "playwright";
import { createServiceClient } from "@/lib/supabase/server";

export interface LeilaoNinjaItem {
  titulo: string;
  cidade: string;
  bairro?: string;
  valor_avaliacao?: number;
  lance_inicial: number;
  desconto?: number;
  link?: string;
  data_leilao?: string;
}

export async function scrapeLeilaoNinja(): Promise<{
  saved: number;
  skipped: number;
  errors: string[];
}> {
  const email = process.env.LEILAO_NINJA_EMAIL;
  const password = process.env.LEILAO_NINJA_PASSWORD;

  if (!email || !password) {
    throw new Error("LEILAO_NINJA_EMAIL and LEILAO_NINJA_PASSWORD are required");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const items: LeilaoNinjaItem[] = [];
  const errors: string[] = [];

  try {
    // Login
    await page.goto("https://leilaoninja.com/login", { waitUntil: "networkidle" });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL("**/member/**", { timeout: 15000 });

    // Navigate to dashboard
    await page.goto("https://leilaoninja.com/member/dashboard", {
      waitUntil: "networkidle",
    });

    // Extract listings
    // NOTE: Selectors below are best-effort. Validate against actual DOM and update if needed.
    const listings = await page.evaluate(() => {
      const cards = document.querySelectorAll(
        '[class*="property"], [class*="imovel"], [class*="leilao"], [class*="card"], .item, article'
      );

      return Array.from(cards).map((card) => {
        const text = (sel: string) => card.querySelector(sel)?.textContent?.trim() ?? "";
        const attr = (sel: string, a: string) =>
          card.querySelector(sel)?.getAttribute(a) ?? "";

        return {
          titulo: text('h2, h3, [class*="title"], [class*="titulo"]') || text("h4"),
          cidade: text('[class*="city"], [class*="cidade"], [class*="local"]'),
          bairro: text('[class*="bairro"], [class*="neighborhood"]'),
          lance_raw: text('[class*="lance"], [class*="bid"], [class*="preco"], [class*="price"]'),
          avaliacao_raw: text('[class*="avaliacao"], [class*="valor"], [class*="value"]'),
          desconto_raw: text('[class*="desconto"], [class*="discount"]'),
          data_raw: text('[class*="data"], [class*="date"], time'),
          link: attr("a", "href") || attr('[class*="link"] a', "href"),
        };
      });
    });

    const parseBRL = (raw: string): number | undefined => {
      const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
      const num = parseFloat(cleaned);
      return isNaN(num) || num === 0 ? undefined : num;
    };

    const parseDesconto = (raw: string): number | undefined => {
      const match = raw.match(/(\d+(?:[.,]\d+)?)\s*%/);
      if (match) return parseFloat(match[1].replace(",", "."));
      return undefined;
    };

    for (const l of listings) {
      if (!l.titulo || l.titulo.length < 3) continue;
      const lance = parseBRL(l.lance_raw);
      if (!lance) continue;

      const item: LeilaoNinjaItem = {
        titulo: l.titulo,
        cidade: l.cidade || "Paraíba",
        bairro: l.bairro || undefined,
        lance_inicial: lance,
        valor_avaliacao: parseBRL(l.avaliacao_raw),
        desconto: parseDesconto(l.desconto_raw),
        link: l.link
          ? l.link.startsWith("http")
            ? l.link
            : `https://leilaoninja.com${l.link}`
          : undefined,
        data_leilao: l.data_raw || undefined,
      };

      if (!item.desconto && item.valor_avaliacao && item.lance_inicial) {
        item.desconto = parseFloat(
          (
            ((item.valor_avaliacao - item.lance_inicial) / item.valor_avaliacao) *
            100
          ).toFixed(2)
        );
      }

      items.push(item);
    }
  } catch (err) {
    errors.push(`Scrape error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await browser.close();
  }

  if (items.length === 0 && errors.length === 0) {
    errors.push(
      "No items extracted. Selectors may need updating — inspect the actual DOM at leilaoninja.com/member/dashboard"
    );
  }

  const supabase = createServiceClient();
  let saved = 0;
  let skipped = 0;

  for (const item of items) {
    if (item.link) {
      const { data: existing } = await supabase
        .from("imoveis")
        .select("id")
        .eq("link", item.link)
        .single();

      if (existing) {
        skipped++;
        continue;
      }
    }

    const { error } = await supabase.from("imoveis").insert({
      ...item,
      status: "pendente",
      score: 0,
    });

    if (error) {
      errors.push(`Insert error for "${item.titulo}": ${error.message}`);
    } else {
      saved++;
    }
  }

  return { saved, skipped, errors };
}
