# Alerta Leilões PB — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack lead generation and subscription platform for real estate auction intelligence in Paraíba, Brazil, with WhatsApp automation and an admin panel.

**Architecture:** Next.js 14 App Router for all pages and API routes; Supabase (PostgreSQL + Auth + Storage) for data persistence; Tailwind CSS with dark theme; WhatsApp Cloud API (Meta) for automations and notifications.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase JS v2, WhatsApp Cloud API, Resend (email fallback), Hotmart (checkout), Vercel (deploy)

---

## Scope Notice

This spec has 4 independent subsystems. They are implemented sequentially (each depends on the prior):

1. **Phase 1 — Project Bootstrap + DB** (Supabase schema + env)
2. **Phase 2 — Frontend Pages** (Landing, /grupo, /radar, /mentoria)
3. **Phase 3 — Admin Panel** (/admin/*)
4. **Phase 4 — WhatsApp Automations** (webhook + sequences)

---

## File Structure

```
alerta-leiloes-pb/
├── app/
│   ├── layout.tsx                  # Root layout (dark theme, fonts)
│   ├── page.tsx                    # Landing page (/)
│   ├── grupo/
│   │   └── page.tsx                # Grupo gratuito capture page
│   ├── radar/
│   │   └── page.tsx                # Radar PB sales page
│   ├── mentoria/
│   │   └── page.tsx                # Lance Certo qualification form
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout (auth guard)
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── leads/page.tsx          # Leads list
│   │   ├── imoveis/page.tsx        # Imóveis list + publish button
│   │   ├── assinantes/page.tsx     # Radar subscribers
│   │   └── aplicacoes/page.tsx     # Mentoria applications
│   └── api/
│       ├── leads/route.ts          # POST /api/leads (save lead)
│       ├── mentoria/route.ts       # POST /api/mentoria (save application)
│       ├── imoveis/
│       │   └── publicar/route.ts   # POST /api/imoveis/publicar
│       └── whatsapp/
│           └── webhook/route.ts    # GET+POST WhatsApp webhook
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Reusable CTA button
│   │   ├── Badge.tsx               # Status badge
│   │   └── Card.tsx                # Content card
│   ├── landing/
│   │   ├── Hero.tsx                # Hero section
│   │   ├── ComoFunciona.tsx        # "Como funciona" 3-step section
│   │   ├── ProvasSocial.tsx        # Social proof section
│   │   └── Footer.tsx              # Footer
│   ├── forms/
│   │   ├── GrupoForm.tsx           # Nome + WhatsApp form
│   │   └── MentoriaForm.tsx        # Qualification form
│   └── admin/
│       └── (tables inlined in admin page files)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client (RSC)
│   │   └── types.ts                # Generated DB types
│   ├── whatsapp/
│   │   ├── client.ts               # WhatsApp API wrapper
│   │   ├── messages.ts             # Message templates
│   │   └── keywords.ts             # Keyword → response map
│   └── utils.ts                    # formatPhone, etc.
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # All tables + RLS
├── .env.local.example              # Required env vars
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Phase 1 — Project Bootstrap + Database

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `.env.local.example`
- Create: `app/layout.tsx`

- [ ] **Step 1.1: Bootstrap Next.js**

```bash
cd "C:/Users/peter/OneDrive/Área de Trabalho/claude -meta ads"
npx create-next-app@latest alerta-leiloes-pb \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd alerta-leiloes-pb
```

- [ ] **Step 1.2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr \
  lucide-react \
  react-hook-form \
  @hookform/resolvers \
  zod \
  clsx \
  tailwind-merge
```

- [ ] **Step 1.3: Create `.env.local.example`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=alerta-leiloes-verify
WHATSAPP_ADMIN_NUMBER=5583999999999

# App
NEXT_PUBLIC_APP_URL=https://alertaleiloespb.com.br
NEXT_PUBLIC_WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/xxxxx
HOTMART_CHECKOUT_URL=https://pay.hotmart.com/xxxxx
CRON_SECRET=generate-a-random-secret-here
```

Copy to `.env.local` and fill in real values before running.

- [ ] **Step 1.4: Configure Tailwind with brand colors**

Edit `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#1a1a2e",
          surface: "#16213e",
          card: "#0f3460",
          accent: "#e63946",
          "accent-hover": "#c1121f",
          text: "#e0e0e0",
          muted: "#a0a0a0",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 1.5: Create root layout**

Create `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alerta Leilões PB — Inteligência Imobiliária",
  description:
    "Receba alertas de imóveis em leilão na Paraíba com desconto de até 70%. Filtrados, analisados e direto no seu WhatsApp.",
  openGraph: {
    title: "Alerta Leilões PB",
    description: "Inteligência Imobiliária para leilões na Paraíba",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-[#1a1a2e] text-[#e0e0e0] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 1.6: Update `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }
  html {
    scroll-behavior: smooth;
  }
  ::selection {
    background: #e63946;
    color: white;
  }
}

@layer utilities {
  .text-gradient {
    background: linear-gradient(135deg, #e63946, #ff6b6b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

- [ ] **Step 1.7: Commit**

```bash
git init
git add .
git commit -m "feat: bootstrap Next.js project with brand theme"
```

---

### Task 2: Supabase Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts`

- [ ] **Step 2.1: Create Supabase project**

1. Go to [supabase.com](https://supabase.com), create project "alerta-leiloes-pb"
2. Copy URL and anon key to `.env.local`
3. Copy service role key to `.env.local`

- [ ] **Step 2.2: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- LEADS
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'grupo', -- 'grupo' | 'radar' | 'mentoria'
  status TEXT NOT NULL DEFAULT 'novo', -- 'novo' | 'nutrição' | 'cliente' | 'inativo'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMÓVEIS
CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT,
  valor_avaliacao NUMERIC(12,2),
  lance_inicial NUMERIC(12,2) NOT NULL,
  desconto NUMERIC(5,2), -- percentage, e.g. 45.00
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 10),
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'publicado' | 'encerrado'
  link TEXT,
  data_leilao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSINANTES RADAR
CREATE TABLE assinantes_radar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ativo', -- 'ativo' | 'cancelado' | 'inadimplente'
  hotmart_subscriber_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APLICAÇÕES MENTORIA
CREATE TABLE aplicacoes_mentoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  participou_leilao BOOLEAN DEFAULT FALSE,
  orcamento TEXT, -- freeform: '<50k', '50-100k', '>100k'
  trava TEXT, -- what blocks them
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'contatado' | 'aprovado' | 'rejeitado'
  respostas JSONB, -- full form answers snapshot
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEQUÊNCIAS DE NUTRIÇÃO
CREATE TABLE sequencias_nutricao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  dia INTEGER NOT NULL, -- 1, 3, 7, 14
  enviado BOOLEAN DEFAULT FALSE,
  enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_whatsapp ON leads(whatsapp);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_imoveis_status ON imoveis(status);
CREATE INDEX idx_sequencias_lead ON sequencias_nutricao(lead_id);
CREATE INDEX idx_sequencias_enviado ON sequencias_nutricao(enviado);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER imoveis_updated_at BEFORE UPDATE ON imoveis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER assinantes_updated_at BEFORE UPDATE ON assinantes_radar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER aplicacoes_updated_at BEFORE UPDATE ON aplicacoes_mentoria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinantes_radar ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacoes_mentoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequencias_nutricao ENABLE ROW LEVEL SECURITY;

-- Public can insert leads and applications (anon key used from browser)
CREATE POLICY "leads_insert" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "aplicacoes_insert" ON aplicacoes_mentoria FOR INSERT TO anon WITH CHECK (true);

-- Service role can do everything (used by API routes with service key)
CREATE POLICY "leads_all_service" ON leads FOR ALL TO service_role USING (true);
CREATE POLICY "imoveis_all_service" ON imoveis FOR ALL TO service_role USING (true);
CREATE POLICY "assinantes_all_service" ON assinantes_radar FOR ALL TO service_role USING (true);
CREATE POLICY "aplicacoes_all_service" ON aplicacoes_mentoria FOR ALL TO service_role USING (true);
CREATE POLICY "sequencias_all_service" ON sequencias_nutricao FOR ALL TO service_role USING (true);
```

- [ ] **Step 2.3: Run migration in Supabase**

In Supabase Dashboard → SQL Editor, paste and run the migration file contents.

- [ ] **Step 2.4: Create Supabase browser client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2.5: Create Supabase server client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Service-role client for admin API routes
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
```

- [ ] **Step 2.6: Create TypeScript types**

Create `lib/supabase/types.ts`:

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          nome: string;
          whatsapp: string;
          origem: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          whatsapp: string;
          origem?: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      imoveis: {
        Row: {
          id: string;
          titulo: string;
          cidade: string;
          bairro: string | null;
          valor_avaliacao: number | null;
          lance_inicial: number;
          desconto: number | null;
          score: number | null;
          status: string;
          link: string | null;
          data_leilao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          cidade: string;
          bairro?: string;
          valor_avaliacao?: number;
          lance_inicial: number;
          desconto?: number;
          score?: number;
          status?: string;
          link?: string;
          data_leilao?: string;
        };
        Update: Partial<Database["public"]["Tables"]["imoveis"]["Insert"]>;
      };
      assinantes_radar: {
        Row: {
          id: string;
          lead_id: string;
          data_inicio: string;
          status: string;
          hotmart_subscriber_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          status?: string;
          hotmart_subscriber_code?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assinantes_radar"]["Insert"]>;
      };
      aplicacoes_mentoria: {
        Row: {
          id: string;
          lead_id: string | null;
          nome: string;
          whatsapp: string;
          participou_leilao: boolean;
          orcamento: string | null;
          trava: string | null;
          status: string;
          respostas: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string;
          nome: string;
          whatsapp: string;
          participou_leilao?: boolean;
          orcamento?: string;
          trava?: string;
          status?: string;
          respostas?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["aplicacoes_mentoria"]["Insert"]>;
      };
      sequencias_nutricao: {
        Row: {
          id: string;
          lead_id: string;
          dia: number;
          enviado: boolean;
          enviado_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          dia: number;
          enviado?: boolean;
          enviado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sequencias_nutricao"]["Insert"]>;
      };
    };
  };
}
```

- [ ] **Step 2.7: Commit**

```bash
git add .
git commit -m "feat: supabase schema and typed clients"
```

---

## Phase 2 — Frontend Pages

### Task 3: Shared UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `lib/utils.ts`

- [ ] **Step 3.1: Create utils**

Create `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(raw: string): string {
  // strips non-digits, ensures 55 country code prefix
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
```

- [ ] **Step 3.2: Create Button component**

Create `components/ui/Button.tsx`:

```typescript
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#e63946] focus:ring-offset-2 focus:ring-offset-[#1a1a2e] disabled:opacity-60 disabled:cursor-not-allowed",
          {
            "bg-[#e63946] hover:bg-[#c1121f] text-white shadow-lg shadow-[#e63946]/20 hover:shadow-[#e63946]/40 active:scale-[0.98]":
              variant === "primary",
            "bg-[#16213e] hover:bg-[#0f3460] text-white border border-[#0f3460]":
              variant === "secondary",
            "text-[#e0e0e0] hover:text-white hover:bg-white/10":
              variant === "ghost",
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Aguarde...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
```

- [ ] **Step 3.3: Create Card component**

Create `components/ui/Card.tsx`:

```typescript
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#16213e] border border-[#0f3460] rounded-xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3.4: Create Badge component**

Create `components/ui/Badge.tsx`:

```typescript
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  novo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ativo: "bg-green-500/20 text-green-300 border-green-500/30",
  pendente: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  publicado: "bg-green-500/20 text-green-300 border-green-500/30",
  encerrado: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  cancelado: "bg-red-500/20 text-red-300 border-red-500/30",
  contatado: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        variants[status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"
      )}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 3.5: Commit**

```bash
git add .
git commit -m "feat: shared UI components (Button, Card, Badge)"
```

---

### Task 4: Landing Page

**Files:**
- Create: `components/landing/Hero.tsx`
- Create: `components/landing/ComoFunciona.tsx`
- Create: `components/landing/ProvasSocial.tsx`
- Create: `components/landing/Footer.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 4.1: Create Hero component**

Create `components/landing/Hero.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-80" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e63946]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] px-4 py-1.5 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-[#e63946] rounded-full animate-pulse" />
          Inteligência Imobiliária para Leilões na Paraíba
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
          Imóveis em Leilão com{" "}
          <span className="text-gradient">até 70% de desconto</span>{" "}
          — direto no seu WhatsApp
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
          Receba alertas filtrados, analisados e com score de oportunidade de
          imóveis em leilão na Paraíba. Sem enrolação, sem juridiquês.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/grupo">
            <Button size="lg" className="w-full sm:w-auto">
              📲 Entrar no Grupo Gratuito
            </Button>
          </Link>
          <Link href="/radar">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Conhecer o Radar PB
            </Button>
          </Link>
        </div>

        {/* Social proof mini */}
        <p className="text-[#a0a0a0] text-sm pt-2">
          +500 investidores já recebem alertas • Atualizado toda semana
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.2: Create ComoFunciona component**

Create `components/landing/ComoFunciona.tsx`:

```typescript
import { Card } from "@/components/ui/Card";

const niveis = [
  {
    numero: "01",
    titulo: "Grupo Gratuito",
    subtitulo: "Para quem quer aprender",
    descricao:
      "Alertas semanais de imóveis em leilão na Paraíba. Conteúdo educativo, cases reais e dicas para quem está começando. Totalmente gratuito.",
    cor: "#a0a0a0",
    icone: "📢",
  },
  {
    numero: "02",
    titulo: "Radar PB",
    subtitulo: "R$ 197/mês • Para quem quer agir",
    descricao:
      "Alertas com 48h de antecedência, score de oportunidade (0–10), análise de risco jurídico, estimativa de lucro e acesso ao histórico completo.",
    cor: "#e63946",
    icone: "🎯",
    destaque: true,
  },
  {
    numero: "03",
    titulo: "Lance Certo",
    subtitulo: "Mentoria Individual • Vagas limitadas",
    descricao:
      "Acompanhamento 1:1 para arrematar com segurança. Estratégia de lance, due diligence completa, acesso aos bastidores e suporte pós-arrematação.",
    cor: "#ffd700",
    icone: "🏆",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 px-4 bg-[#16213e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Como funciona o{" "}
            <span className="text-gradient">Alerta Leilões PB</span>
          </h2>
          <p className="text-[#a0a0a0] text-lg max-w-2xl mx-auto">
            Três níveis de acesso para cada momento da sua jornada em leilões
            imobiliários
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {niveis.map((nivel) => (
            <Card
              key={nivel.numero}
              className={nivel.destaque ? "border-[#e63946]/50 ring-1 ring-[#e63946]/20" : ""}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{nivel.icone}</span>
                  <span
                    className="text-5xl font-black opacity-20"
                    style={{ color: nivel.cor }}
                  >
                    {nivel.numero}
                  </span>
                </div>
                {nivel.destaque && (
                  <span className="inline-block bg-[#e63946]/20 text-[#e63946] text-xs font-bold px-3 py-1 rounded-full border border-[#e63946]/30">
                    MAIS POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold">{nivel.titulo}</h3>
                <p className="text-sm font-medium" style={{ color: nivel.cor }}>
                  {nivel.subtitulo}
                </p>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">
                  {nivel.descricao}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.3: Create ProvasSocial component**

Create `components/landing/ProvasSocial.tsx`:

```typescript
import { Card } from "@/components/ui/Card";

const depoimentos = [
  {
    nome: "Roberto S.",
    cidade: "João Pessoa, PB",
    texto:
      "Arrematei um apartamento em Miramar por R$180k, avaliado em R$320k. O score 9/10 do Radar me deu confiança pra ir fundo.",
    resultado: "Lucro estimado: R$140k",
  },
  {
    nome: "Fernanda L.",
    cidade: "Campina Grande, PB",
    texto:
      "Estava com medo do processo jurídico. A análise do Radar PB mostrou que o imóvel estava limpo. Não teria ido sem ela.",
    resultado: "Imóvel quitado 58% abaixo do valor",
  },
  {
    nome: "Marcos T.",
    cidade: "Cabedelo, PB",
    texto:
      "Entrei pelo grupo gratuito, em 3 semanas já entendia mais de leilão do que em 2 anos lendo sozinho. Hoje sou assinante do Radar.",
    resultado: "3 imóveis analisados em 30 dias",
  },
];

export function ProvasSocial() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Resultados reais de{" "}
            <span className="text-gradient">membros reais</span>
          </h2>
          <p className="text-[#a0a0a0] text-lg">
            Sem promessas de ficção. Apenas oportunidades analisadas com seriedade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {depoimentos.map((dep) => (
            <Card key={dep.nome}>
              <div className="space-y-4">
                <div className="flex text-[#e63946]">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <p className="text-[#e0e0e0] text-sm leading-relaxed italic">
                  "{dep.texto}"
                </p>
                <div className="border-t border-[#0f3460] pt-4">
                  <p className="font-semibold text-sm">{dep.nome}</p>
                  <p className="text-[#a0a0a0] text-xs">{dep.cidade}</p>
                  <p className="text-[#e63946] text-xs font-bold mt-1">
                    {dep.resultado}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border border-[#0f3460] rounded-2xl p-8 bg-[#16213e]">
          {[
            { valor: "+500", label: "Membros no grupo" },
            { valor: "47", label: "Imóveis analisados" },
            { valor: "R$2.1M", label: "Em oportunidades mapeadas" },
            { valor: "68%", label: "Desconto médio nos alertas" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[#e63946]">
                {stat.valor}
              </p>
              <p className="text-[#a0a0a0] text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.4: Create Footer**

Create `components/landing/Footer.tsx`:

```typescript
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0f3460] border-t border-[#16213e] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">
              Alerta Leilões PB
            </h3>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Inteligência imobiliária para quem quer arrematar com segurança
              na Paraíba.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Acesso</h4>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li><Link href="/grupo" className="hover:text-white transition-colors">Grupo Gratuito</Link></li>
              <li><Link href="/radar" className="hover:text-white transition-colors">Radar PB — R$197/mês</Link></li>
              <li><Link href="/mentoria" className="hover:text-white transition-colors">Mentoria Lance Certo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li>WhatsApp: (83) 9 9999-9999</li>
              <li>alertaleiloespb@gmail.com</li>
              <li>João Pessoa, PB</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#1a1a2e] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#a0a0a0]">
          <p>© 2026 Alerta Leilões PB. Todos os direitos reservados.</p>
          <p>Informações educacionais. Não constitui consultoria de investimento.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4.5: Assemble landing page**

Replace `app/page.tsx`:

```typescript
import { Hero } from "@/components/landing/Hero";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { ProvasSocial } from "@/components/landing/ProvasSocial";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ComoFunciona />
      <ProvasSocial />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4.6: Test locally**

```bash
npm run dev
# Open http://localhost:3000 — verify dark theme, hero, 3 cards, testimonials, footer
```

- [ ] **Step 4.7: Commit**

```bash
git add .
git commit -m "feat: landing page with hero, como funciona, provas sociais, footer"
```

---

### Task 5: API Route — Save Lead

**Files:**
- Create: `app/api/leads/route.ts`

- [ ] **Step 5.1: Create leads API route**

Create `app/api/leads/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { getBoasVindas, getSequenciaDias } from "@/lib/whatsapp/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, whatsapp, origem = "grupo" } = body;

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios" },
        { status: 400 }
      );
    }

    const phone = formatPhone(whatsapp);
    const supabase = createServiceClient();

    // Upsert lead (avoid duplicates by phone)
    const { data: lead, error } = await supabase
      .from("leads")
      .upsert(
        { nome, whatsapp: phone, origem },
        { onConflict: "whatsapp", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;

    // Schedule nurture sequence (days 1, 3, 7, 14)
    const diasSequencia = [1, 3, 7, 14];
    await supabase.from("sequencias_nutricao").insert(
      diasSequencia.map((dia) => ({ lead_id: lead.id, dia }))
    );

    // Send welcome WhatsApp message (non-blocking)
    sendWhatsAppMessage(phone, getBoasVindas(nome)).catch(console.error);

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("Error saving lead:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 5.2: Commit**

```bash
git add app/api/leads/route.ts
git commit -m "feat: POST /api/leads — save lead to Supabase + welcome message"
```

---

### Task 6: Grupo Gratuito Page (/grupo)

**Files:**
- Create: `components/forms/GrupoForm.tsx`
- Create: `app/grupo/page.tsx`

- [ ] **Step 6.1: Create GrupoForm**

Create `components/forms/GrupoForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome completo"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido")
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Formato: (83) 99999-9999"),
});

type FormData = z.infer<typeof schema>;

export function GrupoForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, origem: "grupo" }),
    });
    setSubmitted(true);
    // Redirect to WhatsApp group after 2s
    setTimeout(() => {
      window.location.href = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || "#";
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-6xl">✅</div>
        <h3 className="text-2xl font-bold text-white">Perfeito!</h3>
        <p className="text-[#a0a0a0]">
          Redirecionando para o grupo do WhatsApp...
        </p>
        <p className="text-sm text-[#a0a0a0]">
          Caso não seja redirecionado,{" "}
          <a
            href={process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || "#"}
            className="text-[#e63946] underline"
          >
            clique aqui
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
          Seu nome completo
        </label>
        <input
          {...register("nome")}
          placeholder="Ex: João Silva"
          className="w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946] transition-colors placeholder-[#a0a0a0]"
        />
        {errors.nome && (
          <p className="text-[#e63946] text-xs mt-1">{errors.nome.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#e0e0e0] mb-2">
          WhatsApp (com DDD)
        </label>
        <input
          {...register("whatsapp")}
          placeholder="(83) 99999-9999"
          className="w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946] transition-colors placeholder-[#a0a0a0]"
        />
        {errors.whatsapp && (
          <p className="text-[#e63946] text-xs mt-1">
            {errors.whatsapp.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        📲 Entrar no Grupo Gratuito
      </Button>

      <p className="text-xs text-center text-[#a0a0a0]">
        Seus dados são 100% seguros. Sem spam.
      </p>
    </form>
  );
}
```

- [ ] **Step 6.2: Create grupo page**

Create `app/grupo/page.tsx`:

```typescript
import { GrupoForm } from "@/components/forms/GrupoForm";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "Grupo Gratuito — Alerta Leilões PB",
  description:
    "Entre no grupo gratuito e receba alertas semanais de imóveis em leilão na Paraíba.",
};

export default function GrupoPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="p-4 border-b border-[#16213e]">
        <Link href="/" className="text-[#e63946] font-bold text-lg">
          ← Alerta Leilões PB
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="text-5xl">📲</span>
            <h1 className="text-3xl font-extrabold">
              Acesse o Grupo{" "}
              <span className="text-gradient">100% Gratuito</span>
            </h1>
            <p className="text-[#a0a0a0]">
              Preencha seus dados para receber o link de acesso imediato ao
              grupo de leilões da Paraíba.
            </p>
          </div>

          {/* Benefícios */}
          <ul className="space-y-2">
            {[
              "Alertas semanais de novos leilões",
              "Análises educativas de casos reais",
              "Dicas de como avaliar um imóvel",
              "Comunidade ativa de investidores",
            ].map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-[#e0e0e0]">
                <span className="text-[#e63946] font-bold">✓</span> {b}
              </li>
            ))}
          </ul>

          {/* Form card */}
          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8">
            <GrupoForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 6.3: Test**

```bash
npm run dev
# Navigate to http://localhost:3000/grupo
# Fill form → should POST to /api/leads → show success → redirect to WhatsApp link
```

- [ ] **Step 6.4: Commit**

```bash
git add .
git commit -m "feat: /grupo page with lead capture form and Supabase integration"
```

---

### Task 7: Radar PB Sales Page (/radar)

**Files:**
- Create: `app/radar/page.tsx`

- [ ] **Step 7.1: Create radar page**

Create `app/radar/page.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Radar PB — Alerta Leilões PB",
  description: "Assine o Radar PB por R$197/mês e receba alertas com score, análise jurídica e estimativa de lucro.",
};

const beneficios = [
  "Alertas com 48h de antecedência dos leilões",
  "Score de oportunidade de 0 a 10",
  "Análise de risco jurídico simplificada",
  "Estimativa de lucro potencial",
  "Histórico completo de imóveis analisados",
  "Acesso ao grupo exclusivo de assinantes",
  "Relatório semanal em PDF",
  "Suporte via WhatsApp em dias úteis",
];

const faq = [
  {
    q: "Como funciona o acesso?",
    a: "Após o pagamento, você receberá automaticamente os alertas pelo WhatsApp e acesso ao grupo exclusivo de assinantes. Funciona em qualquer WhatsApp.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem fidelidade. Cancele quando quiser direto na Hotmart ou enviando mensagem para nós.",
  },
  {
    q: "Serve para quem mora fora da Paraíba?",
    a: "Sim. O Radar PB mapeia leilões da Paraíba, mas você pode arrematar de qualquer lugar do Brasil — presencial ou online.",
  },
  {
    q: "O Radar garante lucro nos leilões?",
    a: "Não. O Radar é uma ferramenta de análise e inteligência. A decisão de arrematação é sempre sua. Recomendamos sempre due diligence própria.",
  },
  {
    q: "Os imóveis do Radar são regularizados?",
    a: "Analisamos o risco jurídico e indicamos o score. Imóveis com irregularidades graves recebem score baixo e não são recomendados.",
  },
];

export default function RadarPage() {
  const checkoutUrl = process.env.HOTMART_CHECKOUT_URL || "#";

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="p-4 border-b border-[#16213e]">
        <Link href="/" className="text-[#e63946] font-bold text-lg">← Alerta Leilões PB</Link>
      </nav>

      {/* VSL Section */}
      <section className="py-16 px-4 text-center bg-[#16213e]">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-block bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] px-4 py-1 rounded-full text-sm font-bold">
            RADAR PB — Inteligência de Leilões
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Pare de perder{" "}
            <span className="text-gradient">oportunidades de 40-70% de desconto</span>{" "}
            por falta de informação
          </h1>
          <p className="text-[#a0a0a0] text-lg">
            Assista ao vídeo abaixo e entenda como o Radar PB funciona na prática
          </p>

          {/* VSL embed — replace VIDEO_ID with actual YouTube/Vimeo ID */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#0f3460] bg-[#0f3460]">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1"
              title="Radar PB — Como funciona"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Benefits + Price */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-6">O que você recebe:</h2>
            <ul className="space-y-3">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[#e0e0e0]">
                  <span className="text-[#e63946] font-bold mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="sticky top-8">
            <div className="space-y-6 text-center">
              <div>
                <p className="text-[#a0a0a0] text-sm line-through mb-1">De R$297/mês</p>
                <p className="text-5xl font-black text-white">R$197</p>
                <p className="text-[#a0a0a0] text-sm">/mês • cancele quando quiser</p>
              </div>

              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full">
                  🎯 Assinar o Radar PB Agora
                </Button>
              </a>

              <div className="border-t border-[#0f3460] pt-4 space-y-2 text-xs text-[#a0a0a0]">
                <p>✅ Pagamento seguro via Hotmart</p>
                <p>✅ Acesso imediato após confirmação</p>
                <p>✅ Garantia de 7 dias</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#16213e]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <Card key={item.q}>
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add app/radar/page.tsx
git commit -m "feat: /radar sales page with VSL, benefits, price, and FAQ"
```

---

### Task 8: Mentoria Page (/mentoria)

**Files:**
- Create: `components/forms/MentoriaForm.tsx`
- Create: `app/api/mentoria/route.ts`
- Create: `app/mentoria/page.tsx`

- [ ] **Step 8.1: Create mentoria API route**

Create `app/api/mentoria/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import { getMentoriaAdminAlert } from "@/lib/whatsapp/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, whatsapp, participou_leilao, orcamento, trava } = body;

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const phone = formatPhone(whatsapp);
    const supabase = createServiceClient();

    // Upsert lead
    const { data: lead } = await supabase
      .from("leads")
      .upsert({ nome, whatsapp: phone, origem: "mentoria" }, { onConflict: "whatsapp" })
      .select()
      .single();

    // Save application
    const respostas = { nome, whatsapp: phone, participou_leilao, orcamento, trava };
    await supabase.from("aplicacoes_mentoria").insert({
      lead_id: lead?.id,
      nome,
      whatsapp: phone,
      participou_leilao: participou_leilao === "sim",
      orcamento,
      trava,
      respostas,
    });

    // Notify admin via WhatsApp
    const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
    if (adminNumber) {
      sendWhatsAppMessage(adminNumber, getMentoriaAdminAlert(respostas)).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving mentoria application:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 8.2: Create MentoriaForm**

Create `components/forms/MentoriaForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  participou_leilao: z.enum(["sim", "nao"], { required_error: "Selecione uma opção" }),
  orcamento: z.string().min(1, "Selecione seu orçamento"),
  trava: z.string().min(10, "Descreva sua principal dificuldade (mínimo 10 caracteres)"),
});

type FormData = z.infer<typeof schema>;

export function MentoriaForm() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/mentoria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-6xl">🏆</div>
        <h3 className="text-2xl font-bold">Candidatura recebida!</h3>
        <p className="text-[#a0a0a0]">
          Analisaremos seu perfil e entraremos em contato em até 48 horas via
          WhatsApp.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946] transition-colors placeholder-[#a0a0a0]";
  const labelClass = "block text-sm font-medium text-[#e0e0e0] mb-2";
  const errorClass = "text-[#e63946] text-xs mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className={labelClass}>Nome completo *</label>
        <input {...register("nome")} placeholder="Seu nome completo" className={inputClass} />
        {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
      </div>

      <div>
        <label className={labelClass}>WhatsApp (com DDD) *</label>
        <input {...register("whatsapp")} placeholder="(83) 99999-9999" className={inputClass} />
        {errors.whatsapp && <p className={errorClass}>{errors.whatsapp.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Você já participou de algum leilão imobiliário? *</label>
        <select {...register("participou_leilao")} className={inputClass}>
          <option value="">Selecione...</option>
          <option value="nao">Não, é meu primeiro contato</option>
          <option value="sim">Sim, já participei</option>
        </select>
        {errors.participou_leilao && <p className={errorClass}>{errors.participou_leilao.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Qual seu orçamento disponível para investimento? *</label>
        <select {...register("orcamento")} className={inputClass}>
          <option value="">Selecione...</option>
          <option value="ate-50k">Até R$50.000</option>
          <option value="50k-100k">R$50.000 a R$100.000</option>
          <option value="100k-200k">R$100.000 a R$200.000</option>
          <option value="acima-200k">Acima de R$200.000</option>
        </select>
        {errors.orcamento && <p className={errorClass}>{errors.orcamento.message}</p>}
      </div>

      <div>
        <label className={labelClass}>O que te trava hoje para arrematar em leilão? *</label>
        <textarea
          {...register("trava")}
          rows={4}
          placeholder="Ex: Tenho medo do processo jurídico, não sei como avaliar se o imóvel vale a pena..."
          className={`${inputClass} resize-none`}
        />
        {errors.trava && <p className={errorClass}>{errors.trava.message}</p>}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        🏆 Enviar Candidatura
      </Button>

      <p className="text-xs text-center text-[#a0a0a0]">
        Vagas limitadas. Responderemos em até 48 horas.
      </p>
    </form>
  );
}
```

- [ ] **Step 8.3: Create mentoria page**

Create `app/mentoria/page.tsx`:

```typescript
import { MentoriaForm } from "@/components/forms/MentoriaForm";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "Mentoria Lance Certo — Alerta Leilões PB",
  description: "Mentoria individual para arrematar com segurança na Paraíba. Vagas limitadas.",
};

export default function MentoriaPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="p-4 border-b border-[#16213e]">
        <Link href="/" className="text-[#e63946] font-bold text-lg">← Alerta Leilões PB</Link>
      </nav>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <span className="text-5xl">🏆</span>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Mentoria{" "}
              <span className="text-gradient">Lance Certo</span>
            </h1>
            <p className="text-[#a0a0a0] text-lg">
              Acompanhamento individual para quem quer arrematar com
              segurança, estratégia e máximo retorno.
            </p>
          </div>

          {/* O que está incluso */}
          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8 space-y-4">
            <h2 className="font-bold text-white text-lg mb-4">O que está incluso:</h2>
            {[
              "Sessões 1:1 com análise do seu perfil de investidor",
              "Estratégia personalizada de lance",
              "Due diligence completa do imóvel",
              "Acesso aos bastidores dos processos judiciais",
              "Suporte direto no dia do leilão",
              "Pós-arrematação: imissão de posse e regularização",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-[#e63946] font-bold">✓</span>
                <span className="text-[#e0e0e0] text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8">
            <h2 className="font-bold text-white text-xl mb-6 text-center">
              Preencha sua candidatura
            </h2>
            <MentoriaForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 8.4: Commit**

```bash
git add .
git commit -m "feat: /mentoria qualification form with admin WhatsApp notification"
```

---

## Phase 3 — Admin Panel

### Task 9: Admin Authentication (Supabase Auth + Middleware)

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`
- Modify: `app/admin/layout.tsx` (redirect if unauthenticated)

Admin access is protected with Supabase email/password auth. Only authenticated users can access `/admin/*`.

- [ ] **Step 9.0a: Create middleware to protect /admin routes**

Create `middleware.ts` at project root:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (not /admin/login)
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 9.0b: Create admin login page**

Create `app/admin/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciais inválidas.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#1a1a2e]">
      <div className="max-w-md w-full bg-[#16213e] border border-[#0f3460] rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Alerta Leilões PB</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-[#e0e0e0] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#e0e0e0] mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946]"
            />
          </div>
          {error && <p className="text-[#e63946] text-sm">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Setup instruction:** After deploy, create the admin user in Supabase Dashboard → Authentication → Users → Invite user (or create with email+password).

- [ ] **Step 9.0c: Commit**

```bash
git add middleware.ts app/admin/login/
git commit -m "feat: admin auth with Supabase middleware and login page"
```

---

### Task 10: WhatsApp Client Library

**Files:**
- Create: `lib/whatsapp/client.ts`
- Create: `lib/whatsapp/messages.ts`
- Create: `lib/whatsapp/keywords.ts`

- [ ] **Step 9.1: Create WhatsApp client**

Create `lib/whatsapp/client.ts`:

```typescript
const WHATSAPP_API_URL = "https://graph.facebook.com/v20.0";

export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn("WhatsApp credentials not configured");
    return;
  }

  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }
}
```

- [ ] **Step 9.2: Create message templates**

Create `lib/whatsapp/messages.ts`:

```typescript
export function getBoasVindas(nome: string): string {
  return `Olá, ${nome}! 👋

Bem-vindo(a) ao *Alerta Leilões PB* 🏠

Você acaba de entrar no maior grupo de inteligência imobiliária para leilões na Paraíba.

📌 *O que você vai receber:*
→ Alertas semanais de novos leilões
→ Análises educativas de oportunidades reais
→ Dicas práticas para investir com segurança

💡 *Comandos úteis neste WhatsApp:*
Digite *RADAR* para conhecer nossa assinatura premium
Digite *MENTORIA* para saber sobre a mentoria individual
Digite *COMO FUNCIONA* para entender os 3 níveis
Digite *PREÇO* para ver nossa tabela de planos

Qualquer dúvida, é só perguntar! 🚀`;
}

export function getSequenciaD1(nome: string): string {
  return `Olá, ${nome}! 📚

É o *Dia 1* da sua jornada com o Alerta Leilões PB.

Hoje quero te contar o que você pode *realmente esperar* do grupo:

✅ Alertas filtrados — não mandamos qualquer coisa
✅ Score de 0 a 10 — você sabe exatamente o quanto cada imóvel vale
✅ Sem juridiquês — análise em linguagem simples

Amanhã começo a te mostrar como lemos o edital de um leilão em 10 minutos. Fica ligado! 👀`;
}

export function getSequenciaD3(nome: string): string {
  return `${nome}, como lemos um edital de leilão em menos de 10 minutos 📋

3 perguntas que respondem 80% dos riscos:

1️⃣ *Ocupação:* O imóvel está ocupado? Por quem?
2️⃣ *Ônus:* Há dívidas além do IPTU? (IPTU vai junto, resto não obrigatoriamente)
3️⃣ *Valor de avaliação vs. lance:* Desconto real é acima de 40%

Guarda esse filtro. Vai te salvar de muita dor de cabeça. 💡

Dúvidas? Responde aqui.`;
}

export function getSequenciaD7(nome: string): string {
  return `Case real para você analisar, ${nome} 🏘️

*Apartamento — Bairro dos Estados, João Pessoa*
📊 Avaliação: R$280.000
🔨 Lance mínimo: R$140.000
📉 Desconto: 50%
⚖️ Score Radar: 8/10
📋 Status: Desocupado, sem ônus além do IPTU

Esse imóvel foi arremato por um membro do grupo em novembro. Hoje vale ~R$310k com a valorização do bairro.

Teria arrematado? Responde aqui 👇

(Quem assina o *Radar PB* recebeu esse alerta 48h antes do leilão)`;
}

export function getSequenciaD14(nome: string): string {
  return `${nome}, chegou a hora de dar o próximo passo? 🎯

Você já aprendeu os fundamentos. Já viu cases reais. Entende o filtro básico.

O *Radar PB* foi criado para quem quer *agir com inteligência*:

✅ Alertas 48h antes dos leilões
✅ Score completo de cada imóvel
✅ Análise jurídica resumida
✅ Estimativa de lucro

Por apenas *R$197/mês*. Cancele quando quiser.

👉 Acesse agora: ${process.env.NEXT_PUBLIC_APP_URL}/radar

Tem dúvida? Responde aqui que eu respondo pessoalmente. 🤝`;
}

export function getMentoriaAdminAlert(dados: Record<string, unknown>): string {
  return `🔔 *Nova candidatura — Mentoria Lance Certo*

👤 *Nome:* ${dados.nome}
📱 *WhatsApp:* ${dados.whatsapp}
🏠 *Já participou de leilão:* ${dados.participou_leilao === "sim" ? "Sim ✅" : "Não"}
💰 *Orçamento:* ${dados.orcamento}
🚧 *Principal trava:* ${dados.trava}

👉 Verifique no painel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/aplicacoes`;
}
```

- [ ] **Step 9.3: Create keywords handler**

Create `lib/whatsapp/keywords.ts`:

```typescript
type KeywordResponse = {
  match: boolean;
  message: string;
};

const KEYWORD_MAP: Record<string, string> = {
  RADAR: `🎯 *Radar PB — Inteligência de Leilões*

Alertas filtrados com 48h de antecedência, score de oportunidade (0–10), análise jurídica e estimativa de lucro.

*R$197/mês* • Cancele quando quiser • Garantia de 7 dias

👉 Saiba mais e assine agora:
${process.env.NEXT_PUBLIC_APP_URL}/radar`,

  MENTORIA: `🏆 *Mentoria Lance Certo*

Acompanhamento individual para arrematar com segurança, estratégia e máximo retorno.

Vagas limitadas. Candidature-se agora:
👉 ${process.env.NEXT_PUBLIC_APP_URL}/mentoria`,

  "COMO FUNCIONA": `📚 *Como funciona o Alerta Leilões PB:*

🆓 *Nível 1 — Grupo Gratuito*
Alertas semanais e conteúdo educativo. Para quem está aprendendo.

🎯 *Nível 2 — Radar PB (R$197/mês)*
Alertas antecipados, score, análise jurídica. Para quem quer agir.

🏆 *Nível 3 — Mentoria Lance Certo*
1:1 para arrematar com total segurança. Vagas limitadas.

Qual nível faz mais sentido pra você hoje?`,

  PRECO: `💰 *Tabela de planos:*

🆓 *Grupo Gratuito* — R$ 0
→ Alertas semanais + conteúdo educativo
→ ${process.env.NEXT_PUBLIC_APP_URL}/grupo

🎯 *Radar PB* — R$197/mês
→ Alertas 48h antes + score + análise jurídica + estimativa de lucro
→ ${process.env.NEXT_PUBLIC_APP_URL}/radar

🏆 *Lance Certo (Mentoria)* — Sob consulta
→ Acompanhamento 1:1 completo
→ ${process.env.NEXT_PUBLIC_APP_URL}/mentoria`,
};

export function getKeywordResponse(message: string): KeywordResponse {
  const normalized = message.trim().toUpperCase();
  const matched = Object.keys(KEYWORD_MAP).find((k) => normalized.includes(k));

  if (matched) {
    return { match: true, message: KEYWORD_MAP[matched] };
  }

  return { match: false, message: "" };
}
```

- [ ] **Step 9.4: Commit**

```bash
git add lib/
git commit -m "feat: WhatsApp client, message templates, and keyword handler"
```

---

### Task 11: WhatsApp Webhook

**Files:**
- Create: `app/api/whatsapp/webhook/route.ts`

- [ ] **Step 10.1: Create webhook route**

Create `app/api/whatsapp/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getKeywordResponse } from "@/lib/whatsapp/keywords";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

// Webhook verification (Meta requires GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages?.length) {
      return NextResponse.json({ status: "no_message" });
    }

    const message = messages[0];
    const from = message.from as string;
    const text = message.text?.body as string;

    if (!text) return NextResponse.json({ status: "non_text" });

    const { match, message: responseMessage } = getKeywordResponse(text);

    if (match) {
      await sendWhatsAppMessage(from, responseMessage);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
```

- [ ] **Step 10.2: Commit**

```bash
git add app/api/whatsapp/
git commit -m "feat: WhatsApp webhook (verification + keyword responses)"
```

---

### Task 12: Admin Panel

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/leads/page.tsx`
- Create: `app/admin/imoveis/page.tsx`
- Create: `app/admin/assinantes/page.tsx`
- Create: `app/admin/aplicacoes/page.tsx`
- Create: `app/api/imoveis/publicar/route.ts`
(Tables are implemented inline in each admin page file — no separate component files)

- [ ] **Step 11.1: Create admin layout**

Create `app/admin/layout.tsx`:

```typescript
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/assinantes", label: "Assinantes Radar" },
  { href: "/admin/aplicacoes", label: "Candidaturas" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#1a1a2e]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#16213e] border-r border-[#0f3460] flex flex-col">
        <div className="p-6 border-b border-[#0f3460]">
          <p className="text-xs text-[#a0a0a0] uppercase tracking-wider mb-1">Painel Admin</p>
          <h1 className="text-lg font-bold text-white">Alerta Leilões PB</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-[#a0a0a0] hover:text-white hover:bg-[#0f3460] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#0f3460]">
          <Link href="/" className="text-xs text-[#a0a0a0] hover:text-white">
            ← Ver site público
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 11.2: Create admin dashboard**

Create `app/admin/page.tsx`:

```typescript
import { createServiceClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [leads, assinantes, aplicacoes, imoveis] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("assinantes_radar").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("aplicacoes_mentoria").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("imoveis").select("id", { count: "exact", head: true }).eq("status", "publicado"),
  ]);

  const stats = [
    { label: "Total de Leads", value: leads.count ?? 0, icon: "👥" },
    { label: "Assinantes Radar", value: assinantes.count ?? 0, icon: "🎯" },
    { label: "Candidaturas Pendentes", value: aplicacoes.count ?? 0, icon: "⏳" },
    { label: "Imóveis Publicados", value: imoveis.count ?? 0, icon: "🏠" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="text-sm text-[#a0a0a0] mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.3: Create leads admin page**

Create `app/admin/leads/page.tsx`:

```typescript
import { createServiceClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = createServiceClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leads ({leads?.length ?? 0})</h1>
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Nome", "WhatsApp", "Origem", "Status", "Data"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {leads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#0f3460]/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{lead.nome}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{lead.whatsapp}</td>
                <td className="px-4 py-3 text-[#a0a0a0] capitalize">{lead.origem}</td>
                <td className="px-4 py-3"><Badge status={lead.status} /></td>
                <td className="px-4 py-3 text-[#a0a0a0]">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads?.length && (
          <p className="text-center text-[#a0a0a0] py-12">Nenhum lead cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.4: Create publicar imóvel API route**

Create `app/api/imoveis/publicar/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

export async function POST(request: NextRequest) {
  try {
    const { imovelId } = await request.json();
    const supabase = createServiceClient();

    // Get imóvel details
    const { data: imovel, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", imovelId)
      .single();

    if (error || !imovel) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Update status to published
    await supabase
      .from("imoveis")
      .update({ status: "publicado" })
      .eq("id", imovelId);

    // Get all active leads (for broadcast — in production, use Meta broadcast API)
    const { data: leads } = await supabase
      .from("leads")
      .select("whatsapp, nome")
      .eq("status", "ativo")
      .limit(50); // WhatsApp API limits: adjust for your volume

    const desconto = imovel.desconto ? `${imovel.desconto}%` : "significativo";
    const dataLeilao = imovel.data_leilao
      ? new Date(imovel.data_leilao).toLocaleDateString("pt-BR")
      : "Em breve";

    const msg = `🏠 *Novo Alerta — Alerta Leilões PB*

📍 *${imovel.titulo}*
📌 ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}
💰 Lance mínimo: R$ ${imovel.lance_inicial.toLocaleString("pt-BR")}
📉 Desconto: ${desconto} abaixo da avaliação
⭐ Score: ${imovel.score ?? "—"}/10
📅 Data do leilão: ${dataLeilao}
${imovel.link ? `\n🔗 Mais detalhes: ${imovel.link}` : ""}

Quer análise completa? Assine o *Radar PB*:
👉 ${process.env.NEXT_PUBLIC_APP_URL}/radar`;

    // Send to each lead (non-blocking, rate limited)
    if (leads?.length) {
      for (const lead of leads) {
        await sendWhatsAppMessage(lead.whatsapp, msg);
        await new Promise((r) => setTimeout(r, 500)); // 500ms delay between messages
      }
    }

    return NextResponse.json({ success: true, notified: leads?.length ?? 0 });
  } catch (err) {
    console.error("Error publishing imóvel:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 11.5: Create imóveis admin page**

Create `app/admin/imoveis/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Imovel = Database["public"]["Tables"]["imoveis"]["Row"];

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [publishing, setPublishing] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("imoveis")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setImoveis(data ?? []));
  }, []);

  const handlePublicar = async (id: string) => {
    if (!confirm("Publicar este imóvel e notificar os leads?")) return;
    setPublishing(id);
    try {
      await fetch("/api/imoveis/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imovelId: id }),
      });
      setImoveis((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "publicado" } : i))
      );
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imóveis ({imoveis.length})</h1>
      </div>

      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Título", "Cidade", "Lance Mínimo", "Desconto", "Score", "Status", "Ação"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {imoveis.map((imovel) => (
              <tr key={imovel.id} className="hover:bg-[#0f3460]/50">
                <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{imovel.titulo}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{imovel.cidade}</td>
                <td className="px-4 py-3 text-white">{formatCurrency(imovel.lance_inicial)}</td>
                <td className="px-4 py-3 text-[#e63946] font-bold">{imovel.desconto ? `${imovel.desconto}%` : "—"}</td>
                <td className="px-4 py-3 text-white">{imovel.score ?? "—"}/10</td>
                <td className="px-4 py-3"><Badge status={imovel.status} /></td>
                <td className="px-4 py-3">
                  {imovel.status === "pendente" && (
                    <Button
                      size="sm"
                      loading={publishing === imovel.id}
                      onClick={() => handlePublicar(imovel.id)}
                    >
                      Publicar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!imoveis.length && (
          <p className="text-center text-[#a0a0a0] py-12">Nenhum imóvel cadastrado.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.6: Create assinantes and aplicações pages**

Create `app/admin/assinantes/page.tsx`:

```typescript
import { createServiceClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AssinantesPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("assinantes_radar")
    .select("*, leads(nome, whatsapp)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assinantes Radar ({data?.length ?? 0})</h1>
      <div className="bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f3460]">
            <tr>
              {["Nome", "WhatsApp", "Desde", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f3460]">
            {data?.map((s) => (
              <tr key={s.id} className="hover:bg-[#0f3460]/50">
                <td className="px-4 py-3 text-white">{(s.leads as { nome: string } | null)?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{(s.leads as { whatsapp: string } | null)?.whatsapp ?? "—"}</td>
                <td className="px-4 py-3 text-[#a0a0a0]">{new Date(s.data_inicio).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3"><Badge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && <p className="text-center text-[#a0a0a0] py-12">Nenhum assinante ativo.</p>}
      </div>
    </div>
  );
}
```

Create `app/admin/aplicacoes/page.tsx`:

```typescript
import { createServiceClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AplicacoesPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("aplicacoes_mentoria")
    .select("*")
    .order("created_at", { ascending: false });

  const orcamentoLabel: Record<string, string> = {
    "ate-50k": "Até R$50k",
    "50k-100k": "R$50k–100k",
    "100k-200k": "R$100k–200k",
    "acima-200k": "+R$200k",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Candidaturas Mentoria ({data?.length ?? 0})</h1>
      <div className="space-y-4">
        {data?.map((a) => (
          <div key={a.id} className="bg-[#16213e] border border-[#0f3460] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{a.nome}</h3>
                <p className="text-[#a0a0a0] text-sm">{a.whatsapp}</p>
              </div>
              <Badge status={a.status} />
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#a0a0a0] text-xs mb-1">Já fez leilão?</p>
                <p className="text-white">{a.participou_leilao ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-xs mb-1">Orçamento</p>
                <p className="text-white">{orcamentoLabel[a.orcamento ?? ""] ?? a.orcamento ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-xs mb-1">Data</p>
                <p className="text-white">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[#a0a0a0] text-xs mb-1">Principal trava</p>
              <p className="text-[#e0e0e0] text-sm bg-[#0f3460] rounded-lg p-3">{a.trava}</p>
            </div>
          </div>
        ))}
        {!data?.length && <p className="text-center text-[#a0a0a0] py-12">Nenhuma candidatura ainda.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.7: Commit**

```bash
git add .
git commit -m "feat: admin panel with leads, imoveis, assinantes, aplicacoes"
```

---

## Phase 4 — Nurture Sequence Automation

### Task 13: Cron Job for Nurture Sequences

**Files:**
- Create: `app/api/cron/nutricao/route.ts`

- [ ] **Step 12.1: Create cron route**

Create `app/api/cron/nutricao/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";
import {
  getSequenciaD1,
  getSequenciaD3,
  getSequenciaD7,
  getSequenciaD14,
} from "@/lib/whatsapp/messages";

const SEQUENCIA_MAP: Record<number, (nome: string) => string> = {
  1: getSequenciaD1,
  3: getSequenciaD3,
  7: getSequenciaD7,
  14: getSequenciaD14,
};

// This route is called by Vercel Cron or an external cron service daily
export async function GET(request: NextRequest) {
  // Security: verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  let processed = 0;

  for (const dia of [1, 3, 7, 14]) {
    // Find sequences due today for this day number
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - dia);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data: sequences } = await supabase
      .from("sequencias_nutricao")
      .select("*, leads(nome, whatsapp)")
      .eq("dia", dia)
      .eq("enviado", false)
      .lte("created_at", `${cutoffStr}T23:59:59Z`)
      .limit(50);

    if (!sequences?.length) continue;

    for (const seq of sequences) {
      const lead = seq.leads as { nome: string; whatsapp: string } | null;
      if (!lead) continue;

      const messageFn = SEQUENCIA_MAP[dia];
      if (!messageFn) continue;

      try {
        await sendWhatsAppMessage(lead.whatsapp, messageFn(lead.nome));
        await supabase
          .from("sequencias_nutricao")
          .update({ enviado: true, enviado_em: now.toISOString() })
          .eq("id", seq.id);
        processed++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Failed to send sequence day ${dia} to ${lead.whatsapp}:`, err);
      }
    }
  }

  return NextResponse.json({ success: true, processed });
}
```

- [ ] **Step 12.2: Configure Vercel Cron**

Add to `vercel.json` (create if not exists):

```json
{
  "crons": [
    {
      "path": "/api/cron/nutricao",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Add `CRON_SECRET` to `.env.local` (generate random string).

- [ ] **Step 12.3: Commit**

```bash
git add .
git commit -m "feat: nurture sequence cron job (days 1/3/7/14)"
```

---

## Phase 5 — LeilãoNinja Scraper

### Task 14: Scraper de Imóveis do LeilãoNinja

**Context:** O admin precisa importar oportunidades do dashboard privado do LeilãoNinja (https://leilaoninja.com/member/dashboard) diretamente para a tabela `imoveis` no Supabase. O scraper faz login com credenciais configuradas em env vars, extrai os listings e os salva. O botão "Publicar" existente no painel admin já cuida do envio para o grupo do WhatsApp.

**Files:**
- Create: `lib/scraper/leilao-ninja.ts` — Playwright scraper (login + extract)
- Create: `app/api/admin/scrape/route.ts` — POST endpoint que dispara o scrape
- Modify: `app/admin/imoveis/page.tsx` — adicionar botão "Sincronizar LeilãoNinja"
- Modify: `.env.local.example` — adicionar `LEILAO_NINJA_EMAIL` e `LEILAO_NINJA_PASSWORD`

- [ ] **Step 14.1: Install Playwright**

```bash
cd alerta-leiloes-pb
npm install playwright @playwright/test
npx playwright install chromium
```

- [ ] **Step 14.2: Add env vars to `.env.local.example`**

Add to the env file:
```env
# LeilãoNinja scraper
LEILAO_NINJA_EMAIL=seu@email.com
LEILAO_NINJA_PASSWORD=sua_senha
```

Also add to the reference table at the bottom of this plan:
| `LEILAO_NINJA_EMAIL` | Credencial de login no LeilãoNinja |
| `LEILAO_NINJA_PASSWORD` | Senha de login no LeilãoNinja |

- [ ] **Step 14.3: Create the scraper**

Create `lib/scraper/leilao-ninja.ts`:

```typescript
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
    // Step 1: Login
    await page.goto("https://leilaoninja.com/login", { waitUntil: "networkidle" });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL("**/member/**", { timeout: 15000 });

    // Step 2: Navigate to dashboard
    await page.goto("https://leilaoninja.com/member/dashboard", {
      waitUntil: "networkidle",
    });

    // Step 3: Extract listings
    // NOTE: Selectors below are best-effort based on common patterns.
    // They MUST be validated against the actual page structure
    // by inspecting the DOM at https://leilaoninja.com/member/dashboard
    // Update selectors in this function if the scrape returns 0 items.
    const listings = await page.evaluate(() => {
      const cards = document.querySelectorAll(
        // Adjust selector to match LeilãoNinja's actual card/row class
        '[class*="property"], [class*="imovel"], [class*="leilao"], [class*="card"], .item, article'
      );

      return Array.from(cards).map((card) => {
        const text = (sel: string) =>
          card.querySelector(sel)?.textContent?.trim() ?? "";
        const attr = (sel: string, attr: string) =>
          card.querySelector(sel)?.getAttribute(attr) ?? "";

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

    // Step 4: Parse and normalize
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
      if (!lance) continue; // skip if no valid bid price

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

      // Calculate desconto if not present but avaliacao is
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

  // Step 5: Save to Supabase (skip duplicates by link)
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
      score: 0, // admin manually sets score before publishing
    });

    if (error) {
      errors.push(`Insert error for "${item.titulo}": ${error.message}`);
    } else {
      saved++;
    }
  }

  return { saved, skipped, errors };
}
```

- [ ] **Step 14.4: Create API route to trigger scrape**

Create `app/api/admin/scrape/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { scrapeLeilaoNinja } from "@/lib/scraper/leilao-ninja";

// Only callable from admin panel (protected by middleware)
export async function POST() {
  try {
    const result = await scrapeLeilaoNinja();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 14.5: Add "Sincronizar LeilãoNinja" button to admin imóveis page**

Modify `app/admin/imoveis/page.tsx` — add this button and scrape handler inside the `ImoveisPage` component, immediately after the `handlePublicar` function:

```typescript
// Add this state at the top of the component:
const [syncing, setSyncing] = useState(false);
const [syncResult, setSyncResult] = useState<{
  saved?: number;
  skipped?: number;
  errors?: string[];
} | null>(null);

// Add this function after handlePublicar:
const handleSync = async () => {
  setSyncing(true);
  setSyncResult(null);
  try {
    const res = await fetch("/api/admin/scrape", { method: "POST" });
    const data = await res.json();
    setSyncResult(data);
    // Refresh imóveis list
    const { data: fresh } = await supabase
      .from("imoveis")
      .select("*")
      .order("created_at", { ascending: false });
    setImoveis(fresh ?? []);
  } catch {
    setSyncResult({ errors: ["Falha na conexão com o scraper"] });
  } finally {
    setSyncing(false);
  }
};
```

Add this UI in the page header (after the `<h1>` tag):
```typescript
<div className="flex items-center gap-4">
  <Button
    variant="secondary"
    loading={syncing}
    onClick={handleSync}
  >
    🔄 Sincronizar LeilãoNinja
  </Button>
</div>

{syncResult && (
  <div
    className={`rounded-xl p-4 text-sm border ${
      syncResult.errors?.length
        ? "bg-red-500/10 border-red-500/30 text-red-300"
        : "bg-green-500/10 border-green-500/30 text-green-300"
    }`}
  >
    {syncResult.saved !== undefined && (
      <p>✅ {syncResult.saved} imóveis salvos • {syncResult.skipped} ignorados (duplicados)</p>
    )}
    {syncResult.errors?.map((e, i) => (
      <p key={i}>⚠️ {e}</p>
    ))}
  </div>
)}
```

- [ ] **Step 14.6: Commit**

```bash
git add lib/scraper/ app/api/admin/scrape/ app/admin/imoveis/page.tsx .env.local.example
git commit -m "feat: LeilaoNinja scraper — login, extract, save to Supabase, admin sync button"
```

---

## Phase 6 — Deploy

### Task 15: Deploy to Vercel

- [ ] **Step 13.1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USER/alerta-leiloes-pb.git
git push -u origin main
```

- [ ] **Step 13.2: Deploy on Vercel**

1. Go to [vercel.com](https://vercel.com) → Import project from GitHub
2. Set all environment variables from `.env.local.example`
3. Deploy

- [ ] **Step 13.3: Configure WhatsApp webhook**

In Meta Developer Dashboard:
1. Go to WhatsApp → Configuration
2. Set webhook URL: `https://alertaleiloespb.com.br/api/whatsapp/webhook`
3. Set verify token: value from `WHATSAPP_VERIFY_TOKEN` in env
4. Subscribe to `messages` field

- [ ] **Step 13.4: Final validation checklist**

- [ ] Landing page loads at `/`
- [ ] `/grupo` form submits → lead saved in Supabase → WhatsApp message sent
- [ ] `/radar` shows VSL and checkout button
- [ ] `/mentoria` form submits → application saved → admin WhatsApp alert
- [ ] `/admin` shows stats
- [ ] `/admin/leads` lists leads
- [ ] `/admin/imoveis` shows publish button → clicking sends WhatsApp blast
- [ ] WhatsApp keyword RADAR → response sent
- [ ] WhatsApp keyword MENTORIA → response sent
- [ ] Cron endpoint returns `{ processed: N }`

- [ ] **Step 13.5: Final commit**

```bash
git add vercel.json
git commit -m "feat: vercel cron config and deploy setup"
```

---

## Environment Variables Reference

| Variable | Where to get |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Developer → WhatsApp → API Setup |
| `WHATSAPP_ACCESS_TOKEN` | Meta Developer → WhatsApp → API Setup |
| `WHATSAPP_VERIFY_TOKEN` | Any string you choose (e.g. `alerta-leiloes-verify`) |
| `WHATSAPP_ADMIN_NUMBER` | Your WhatsApp number with country code (e.g. `5583999999999`) |
| `NEXT_PUBLIC_APP_URL` | Your domain (e.g. `https://alertaleiloespb.com.br`) |
| `NEXT_PUBLIC_WHATSAPP_GROUP_LINK` | WhatsApp group invite link |
| `HOTMART_CHECKOUT_URL` | Hotmart product checkout link |
| `CRON_SECRET` | Random string for cron route auth |
