# Alerta Leilões PB — Manual Completo do Sistema

**Data:** 16 de maio de 2026
**Sócios:** Peter (Tráfego & Sistema) · Marcelo (Atendimento & Negociação) · Domingos (Captação & Análise)

---

## O QUE É O ALERTA LEILÕES PB

É uma plataforma de inteligência imobiliária focada em leilões na Paraíba.

O sistema busca automaticamente imóveis em leilão (apartamentos, casas, terrenos, comerciais), analisa cada um com inteligência artificial, atribui uma nota de oportunidade e entrega alertas diretamente no WhatsApp dos clientes — sem que nenhum dos sócios precise fazer isso manualmente.

**O problema que resolvemos:**
Imóveis em leilão podem ter descontos de 30% a 70% sobre o valor de mercado. Porém, a maioria das pessoas não sabe identificar quais são realmente boas oportunidades e quais têm riscos jurídicos escondidos. Nós fazemos essa triagem automaticamente.

---

## OS TRÊS PRODUTOS

### 1. Grupo Gratuito (isca)
- **Preço:** Gratuito
- **Canal:** WhatsApp (broadcast individual, não grupo)
- **Frequência:** Diária (quando há imóveis novos)
- **O que recebe:**
  - Tipo do imóvel (apartamento, casa, etc.)
  - Cidade e estimativa de desconto (ex: "acima de 40%")
  - CTA para assinar o Radar PB
- **Objetivo:** Atrair o máximo de pessoas, mostrar que oportunidades existem, e converter para o Radar PB

### 2. Radar PB — R$37,90/mês (produto principal)
- **Preço:** R$37,90/mês (≈ R$1,26/dia)
- **Canal:** WhatsApp individual
- **Frequência:** Diária (quando há imóveis com score ≥ 5)
- **O que recebe:**
  - ⭐ Score de oportunidade de 0 a 10 (calculado por IA)
  - 🏠 Tipo, cidade, bairro e endereço
  - 💰 Valor de avaliação e lance mínimo
  - 📉 Percentual de desconto
  - ⚖️ Análise jurídica resumida (ocupado? tem ônus? débitos?)
  - 🏛️ Link direto para o site do leiloeiro
  - 📅 Data do leilão
  - ⏰ Recebe 48h antes do grupo gratuito
- **Pagamento:** Via Kiwify (cartão ou PIX) — recorrente mensal
- **Cancelamento:** A qualquer momento, sem multa

### 3. Mentoria Lance Certo (produto premium)
- **Preço:** A definir (sugestão: R$497 a R$997 por sessão)
- **Formato:** Reunião 1:1 agendada via WhatsApp
- **Duração:** ~60 minutos
- **O que é:** Uma conversa direta com Marcelo onde o cliente traz um imóvel específico do Radar e analisa juntos: riscos jurídicos do edital, estratégia de lance, estimativa de retorno
- **NÃO é:** Aula gravada, curso, área de membros ou material didático
- **Quem pode comprar:** Preferencialmente assinantes Radar com score ≥ 45
- **Como chega até a Mentoria:** Sistema identifica leads quentes → Marcelo aborda → candidatura → reunião agendada

---

## COMO O SISTEMA CAPTA OS IMÓVEIS

### Fonte principal: LeilãoNinja
O sistema acessa automaticamente o site **leilaoninja.com** usando um navegador robô (Playwright). Ele:
1. Filtra imóveis localizados na Paraíba
2. Lê título, cidade, bairro, valor de avaliação, lance mínimo, desconto, data do leilão
3. Entra na página de cada imóvel e captura o link do leiloeiro real (Cravo Leilões, Zuk, etc.)
4. Salva no banco de dados apenas imóveis novos (evita duplicatas)

Isso acontece automaticamente **2x por dia** (07:00 e 19:00 BRT).

### Score de Inteligência Artificial
Após captado, cada imóvel é analisado pelo modelo de IA **Claude (Anthropic)**. A IA recebe:
- Todos os dados do imóvel
- Percentual de desconto
- Situação de ocupação
- Informações jurídicas disponíveis

E retorna:
- **Score de 0 a 10** — nota objetiva de oportunidade
- **Análise resumida** — texto curto explicando os principais pontos

**O que o score considera:**
- 0–4: Desconto baixo, risco elevado ou dados insuficientes
- 5–6: Oportunidade moderada, vale analisar se conhece a região
- 7–8: Bom desconto + risco controlado, vale aprofundar
- 9–10: Excepcional — desocupado, sem ônus, desconto acima de 40%

---

## PIPELINE DIÁRIO — O QUE ACONTECE A CADA DIA

### 07:00 — Pipeline Radar PB
```
1. Scraping: acessa LeilãoNinja e salva imóveis novos
2. Enriquecimento: visita cada imóvel e captura link do leiloeiro real
3. Score IA: analisa até 15 imóveis novos com Claude
4. Filtragem: seleciona imóveis com score >= 5 que ainda não foram enviados
5. Envio: manda alerta para todos os assinantes Radar ativos (um a um)
6. Destaque: se score >= 8, envia alerta adicional com CTA Mentoria
7. Marca no banco: registra data/hora do envio para não enviar de novo
```

### 07:30 — Pipeline Gratuito
```
1. Busca imóveis que o Radar já recebeu mas o gratuito ainda não
2. Monta teaser: só tipo, cidade e faixa de desconto (sem score, sem análise)
3. Envia para todos os leads gratuitos ativos (excluindo quem já é Radar)
4. Inclui CTA: "Quer ver score completo? Assine o Radar PB"
```

### 08:00 — Régua de Nutrição
```
Verifica sequências pendentes e envia a mensagem do dia:

GRUPO GRATUITO:
- D+1: "Notou que só mandamos cidade e desconto? É proposital."
- D+3: Comparação lado a lado: gratuito ❌ vs Radar ✅ (com caso real)
- D+7: Case real de arremate (apartamento 50% desconto, hoje vale +R$60k)
- D+14: "14 dias de alertas. Chegou a hora de decidir."

ASSINANTES RADAR (onboarding):
- D+1: Como ler o score 0–10 e o que cada faixa significa
- D+3: 5 pontos para verificar antes de dar o lance
- D+7: Do lance à imissão — o processo completo passo a passo
- D+30: "Você já arrematou? Quer analisar um imóvel comigo?" → CTA Mentoria
```

### 09:00 — Score Mentoria (Lead Scoring)
```
Calcula pontuação de engajamento de cada lead (0–100 pontos):

+10 pts → Tem nome cadastrado
+15 pts → Ativo há 7+ dias
+10 pts → Ativo há 14+ dias
+10 pts → Ativo há 30+ dias
+15 pts → Completou toda a régua gratuita (4/4 mensagens entregues)
+30 pts → É assinante Radar ativo (já pagou uma vez)
+10 pts → Já preencheu candidatura para Mentoria

Score 70+  = 🔥 Muito quente — abordar para Mentoria hoje
Score 45–69 = ⭐ Quente — enviar CTA Radar se ainda gratuito
Score 20–44 = 📈 Morno — deixar a régua trabalhar
Score 0–19  = Lead novo ou inativo
```

---

## JORNADA COMPLETA DE UM CLIENTE

```
[TOPO DO FUNIL — Peter]
Pessoa vê anúncio no Instagram/Facebook
         ↓
Acessa o site ou manda "oi" no WhatsApp
         ↓
Sistema cadastra automaticamente no banco
Envia mensagem de boas-vindas
Cria régua D+1, D+3, D+7, D+14

[MEIO DO FUNIL — Sistema Automático]
Recebe alertas diários (teaser)
         ↓
D+1: Entende a diferença gratuito vs Radar
D+3: Vê caso real detalhado do Radar
D+7: Vê case de arremate bem-sucedido
D+14: Recebe proposta direta de assinatura

[CONVERSÃO — Sistema + Kiwify]
Acessa alerta-leiloes-pb.vercel.app/radar
Assina por R$37,90/mês via Kiwify
         ↓
Kiwify notifica o sistema automaticamente
Sistema: cancela régua gratuita pendente
Sistema: cria régua Radar D+1/3/7/30
Sistema: envia boas-vindas Radar + link do grupo

[ENGAJAMENTO RADAR — Sistema Automático]
D+1: Aprende a ler o score
D+3: Aprende a verificar imóvel antes de licitar
D+7: Entende o processo do lance à imissão
D+30: "Você já arrematou? Quer a Mentoria?"

[VENDA MENTORIA — Marcelo]
Sistema identifica lead com score 70+
Marcelo vê no painel /admin/leads
Marcelo aborda pelo WhatsApp
Candidatura preenchida em /mentoria
Reunião 1:1 agendada e realizada
```

---

## PAPEL DE CADA SÓCIO — DETALHADO

---

### 🎯 PETER — Tráfego & Sistema

**Responsabilidades:**

*Tráfego Pago:*
- Criar campanhas no Meta Ads (Instagram e Facebook)
- Segmentar para pessoas interessadas em investimento imobiliário na PB
- Monitorar custo por lead e otimizar os criativos
- Testar novos ângulos de anúncio (ex: "Imóvel a R$140k que vale R$280k")

*Sistema:*
- Monitorar se os pipelines rodaram corretamente todo dia
- Resolver erros técnicos quando aparecerem
- Fazer deploys de melhorias no sistema
- Garantir que as integrações estão funcionando (WhatsApp, Kiwify, Supabase)

**Painel Admin — o que usar:**
- `/admin` → Dashboard com números do dia
- `/admin/leads` → Quantidade de leads novos
- `/admin/imoveis` → Imóveis captados e scores
- `/admin/templates` → Templates de WhatsApp aprovados pela Meta

**Rotina diária (10 min):**
1. Verificar se pipeline-radar rodou às 07:00 ✓
2. Verificar se pipeline-gratuito rodou às 07:30 ✓
3. Checar quantos imóveis novos foram captados
4. Ver custo por lead no Meta Ads

**Alertas de problema:**
- Pipeline não rodou → verificar Vercel → Settings → Cron Jobs
- Zero imóveis captados → LeilãoNinja pode estar fora do ar
- WhatsApp não entregou → verificar saldo de mensagens no Meta Business

---

### 📞 MARCELO — Atendimento & Negociação

**Responsabilidades:**

*Atendimento WhatsApp:*
- Responder dúvidas de leads que mandam mensagem
- Nunca deixar mensagem sem resposta por mais de 2h em dias úteis
- Identificar objeções e rebater com argumentos do sistema

*Abordagem ativa (prospecção):*
- Todos os dias abrir `/admin/leads` → filtro "🔥 Candidatos Mentoria"
- Leads com score 70+ = abordar hoje via WhatsApp
- Leads com score 45–69 e origem "gratuito" = enviar CTA Radar

*Negociação e fechamento:*
- Converter leads gratuitos → Radar PB
- Converter assinantes Radar → Mentoria Lance Certo
- Acompanhar candidaturas em `/admin/aplicacoes`

*Reuniões de Mentoria:*
- Agendar horário com candidatos aprovados
- Conduzir reunião 1:1 de ~60 minutos via videochamada ou presencial
- Pós-reunião: enviar template `mentoria_pos_reuniao` com próximos passos

**Painel Admin — o que usar:**
- `/admin/leads` → Filtro "🔥 Candidatos Mentoria" — lista diária de quem abordar
- `/admin/aplicacoes` → Candidaturas pendentes de análise
- `/admin/assinantes` → Assinantes Radar ativos (para acompanhamento)

**Rotina diária (30 min):**
1. Abrir `/admin/leads` → ordenar por Score → ver quem está 70+
2. Abordar os 3 primeiros da lista que ainda não foram contatados hoje
3. Responder todas as mensagens pendentes no WhatsApp
4. Verificar candidaturas novas em `/admin/aplicacoes`

**Script de abordagem (score 70+):**
> "Olá [nome], aqui é o Marcelo do Alerta Leilões PB.
> Você acompanha nossos alertas há [X dias] e está entre os perfis mais engajados.
> Temos um imóvel com score [X]/10 em [cidade/bairro] que pode ser interessante.
> Você teria 20 minutos para conversar esta semana sobre como arrematá-lo com segurança?"

**Objeções comuns e respostas:**

| Objeção | Resposta |
|---|---|
| "Muito caro" | "R$1,26/dia. Se você perder um imóvel com 40% de desconto por falta de informação, quanto custou?" |
| "Não sei como funciona leilão" | "Exatamente por isso o Radar existe. O D+7 te manda o passo a passo completo." |
| "Tenho medo de risco jurídico" | "Cada alerta já traz a análise jurídica resumida. Você vê o risco antes de decidir." |
| "Vou pensar" | "Claro. Mas leilão tem data — quando você decidir, o imóvel pode já ter sido arrematado." |

---

### 🏠 DOMINGOS — Captação, Análise & Divulgação

**Responsabilidades:**

*Revisão diária dos imóveis (antes das 07:00):*
- Acessar `/admin/imoveis` e filtrar por status `pendente`
- Para cada imóvel, verificar:
  - Score faz sentido para o imóvel? (IA pode errar)
  - Imóvel marcado como "ocupado" está correto?
  - Análise jurídica está completa?
  - Link do leiloeiro funciona?
  - Data do leilão está correta?

*Quando a IA erra:*
- Score alto em imóvel com problemas → ajustar manualmente para ≤ 4
- Score baixo em imóvel excelente → ajustar e republicar
- Análise incompleta → complementar antes das 07:00

*Captação manual:*
- Se encontrar imóvel excelente fora do sistema (Cravo Leilões direto, Zuk, etc.) → cadastrar manualmente no `/admin/imoveis`
- Preencher: título, cidade, bairro, lance, avaliação, data, link, ocupação
- O sistema gera o score IA automaticamente após salvar

*Divulgação:*
- Identificar os melhores imóveis da semana para destacar nos anúncios
- Passar para Peter os dados do imóvel para criar criativo de anúncio

**Painel Admin — o que usar:**
- `/admin/imoveis` → Lista completa com filtros por status, score, cidade
- Botão "Gerar Score IA" → Pede nova análise para um imóvel específico
- Botão "Publicar" → Aprova manualmente um imóvel para envio

**Rotina diária (20 min antes das 07:00):**
1. Abrir `/admin/imoveis` → filtrar `pendente`
2. Verificar imóveis com score ≥ 7 — esses vão para o Radar hoje
3. Conferir ocupação e link do leiloeiro
4. Corrigir o que estiver errado
5. Se tudo ok → pipeline envia automaticamente às 07:00

**Critérios para um bom imóvel:**
- ✅ Desconto ≥ 30% sobre o valor de avaliação
- ✅ Imóvel desocupado (ou em processo de desocupação conhecido)
- ✅ Sem ônus além de IPTU (sem hipoteca, sem penhora)
- ✅ Leiloeiro confiável (Cravo, Zuk, Sold, Lance Imóveis)
- ✅ Data do leilão em 5 a 30 dias
- ✅ Localização em município da PB com boa liquidez

---

## TECNOLOGIA — O QUE CADA COISA É

| Componente | O que é | Por que usamos |
|---|---|---|
| **Next.js** | Framework do site | Site + painel admin + APIs tudo em um lugar |
| **Supabase** | Banco de dados na nuvem | Guarda leads, imóveis, assinantes, sequências |
| **Vercel** | Hospedagem do site | Deploy automático, crons diários, escalável |
| **WhatsApp Cloud API** | API oficial do WhatsApp | Única forma legal de enviar mensagens em massa |
| **Kiwify** | Plataforma de pagamento | Processa assinatura Radar, notifica o sistema |
| **Claude (Anthropic)** | Inteligência Artificial | Gera o score e a análise de cada imóvel |
| **LeilãoNinja** | Agregador de leilões | Fonte dos imóveis (único com cobertura PB) |
| **GitHub** | Controle de versão do código | Histórico + deploy automático ao fazer push |

---

## NÚMEROS DE REFERÊNCIA

### Métricas para monitorar toda semana

| Métrica | Meta | Responsável |
|---|---|---|
| Leads novos / semana | ≥ 20 | Peter |
| Custo por lead | ≤ R$5 | Peter |
| Taxa conversão gratuito → Radar | ≥ 5% | Marcelo |
| Assinantes Radar ativos | crescendo | Marcelo |
| Imóveis captados / semana | ≥ 10 | Domingos |
| Imóveis com score ≥ 7 | ≥ 2/semana | Domingos |
| Candidaturas Mentoria / mês | ≥ 3 | Marcelo |

### Projeção financeira simples

| Assinantes Radar | Receita mensal |
|---|---|
| 50 | R$1.895/mês |
| 100 | R$3.790/mês |
| 200 | R$7.580/mês |
| 500 | R$18.950/mês |

*(mais vendas de Mentoria por cima)*

---

## REGRAS DE OURO — NÃO NEGOCIÁVEIS

1. **Peter não responde WhatsApp de leads** — o sistema responde automaticamente. Se precisar de atendimento humano, Marcelo assume.

2. **Marcelo não altera código nem pipelines** — qualquer problema técnico, chama Peter via WhatsApp.

3. **Domingos revisa imóveis antes das 07:00** — o pipeline é automático. Se não revisar, imóveis com dados errados podem ser enviados.

4. **Nunca enviar imóvel sem score da IA** — é o diferencial do produto. Imóvel sem análise = não enviamos.

5. **Gratuito nunca recebe análise completa** — score, análise jurídica e link do leiloeiro são exclusivos do Radar. Isso protege o valor da assinatura.

6. **Toda venda de Mentoria passa por candidatura** — Marcelo não fecha Mentoria sem a pessoa preencher o formulário em `/mentoria`. Serve para qualificar o lead.

7. **Nunca prometer garantia de arremate ou lucro** — toda comunicação inclui o disclaimer: *"Análise informativa. Não substitui advogado ou avaliação individual do edital."*

---

## CONTATOS E ACESSOS

| Serviço | Acesso | Responsável |
|---|---|---|
| Painel Admin | alerta-leiloes-pb.vercel.app/admin | Todos |
| Vercel (hospedagem) | vercel.com | Peter |
| Supabase (banco) | supabase.com | Peter |
| Meta Business (WhatsApp) | business.facebook.com | Peter |
| Kiwify (pagamentos) | kiwify.com.br | Peter + Marcelo |
| GitHub (código) | github.com/peterjunio16-code | Peter |
| WhatsApp do negócio | +55 83 98666-5448 | Marcelo (atendimento) |

---

*Alerta Leilões PB — Sistema documentado em 16/05/2026*
*Peter · Marcelo · Domingos*
