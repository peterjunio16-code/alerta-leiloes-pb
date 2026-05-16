export function getBoasVindas(nome: string, groupLink?: string): string {
  const groupSection = groupLink
    ? `\n👥 *Seu grupo gratuito:*\n${groupLink}\n`
    : "";

  return `Olá, ${nome}! 👋

Bem-vindo(a) ao *Alerta Leilões PB* 🏠

Você acaba de entrar no maior grupo de inteligência imobiliária para leilões na Paraíba.

📌 *O que você vai receber:*
→ Alertas semanais de novos leilões
→ Análises educativas de oportunidades reais
→ Dicas práticas para investir com segurança
${groupSection}
💡 *Comandos úteis:*
Digite *RADAR* para conhecer nossa assinatura premium
Digite *MENTORIA* para saber sobre a mentoria individual
Digite *COMO FUNCIONA* para entender os 3 níveis
Digite *PREÇO* para ver nossa tabela de planos

Qualquer dúvida, é só perguntar! 🚀`;
}

export function getBoasVindasRadar(nome: string, radarGroupLink: string): string {
  return `Olá, ${nome}! 🎯

Seu acesso ao *Radar PB* foi confirmado! Parabéns por dar esse passo.

⭐ *Você agora tem acesso a:*
→ Alertas 48h antes dos leilões
→ Score de oportunidade (0–10) por imóvel
→ Análise jurídica resumida
→ Estimativa de lucro de cada imóvel

👥 *Entre no seu grupo exclusivo agora:*
${radarGroupLink}

💡 *Dica:* Ative as notificações do grupo para não perder nenhum alerta.

Bem-vindo(a) ao clube dos investidores que arrrematam com inteligência! 🏆`;
}

export function getSequenciaD1(nome: string): string {
  return `${nome}, você recebeu nosso primeiro alerta hoje 🏠

Notou que só mandamos *cidade, tipo e faixa de desconto*?

É proposital. O grupo gratuito recebe o sinal. Quem assina o *Radar PB* recebe tudo:

🔍 Score de oportunidade (0 a 10)
⚠️ Ocupação e riscos jurídicos
💰 Estimativa de retorno
🏛️ Link direto do leiloeiro
⏰ 48h antes do grupo gratuito

_Análise informativa. Não substitui advogado ou avaliação individual do edital._

Amanhã te mostro o que o Radar viu num imóvel real. 👀`;
}

export function getSequenciaD3(nome: string): string {
  const radar = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "") + "/radar";
  return `${nome}, aqui está o que o grupo gratuito *não* recebe 👇

Quando encontramos um apartamento em João Pessoa com 45% de desconto:

❌ *Gratuito recebe:* "Desconto acima de 40% — veja no Radar"
✅ *Radar PB recebe:*
   ⭐ Score 8.2/10
   🏠 Desocupado
   📋 Sem ônus além do IPTU
   💰 Avaliação: R$280k → Lance: R$154k
   🏛️ Link direto: Cravo Leilões
   📅 Leilão em 48h

A diferença entre ver a oportunidade e *agir* na oportunidade.

Por R$37,90/mês:
${radar}

_Cancele quando quiser. Sem fidelidade._`;
}

export function getSequenciaD7(nome: string): string {
  const radar = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "") + "/radar";
  return `Case real, ${nome} 🏘️

*Apartamento — Bairro dos Estados, João Pessoa*
📊 Avaliação: R$280.000
🔨 Lance mínimo: R$140.000
📉 Desconto: 50% | ⭐ Score: 8/10
✅ Desocupado, sem ônus além do IPTU

Arrematado por um assinante Radar PB. Hoje vale ~R$310k.

Quem estava no gratuito viu: *"Desconto acima de 40%".*
Quem estava no Radar viu: *score, riscos, link do leiloeiro e 48h de vantagem.*

Teria arrematado com essas informações? 🤔

Se sim, o Radar foi feito pra você:
${radar}`;
}

export function getSequenciaD14(nome: string): string {
  const radar = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "") + "/radar";
  return `${nome}, 14 dias de alertas. Chegou a hora de decidir 🎯

Você já sabe que leilão tem oportunidade real.
Você já viu imóveis com 40%+ de desconto passando pelo grupo.

A questão é: quando aparecer *o* imóvel certo, você vai ter as informações para agir?

*Radar PB — R$37,90/mês:*
✅ Score completo + análise de risco
✅ Link direto do leiloeiro
✅ 48h antes do grupo gratuito
✅ Cancele quando quiser

👉 ${radar}

Dúvida? Responde aqui que respondo pessoalmente. 🤝

_Análise informativa. Não substitui advogado, corretor ou avaliação individual do edital._`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉGUA PÓS-ASSINATURA RADAR PB (onboarding de novos assinantes)
// D+1: Como ler o score | D+3: O que verificar | D+7: Case real | D+30: CTA mentoria
// ─────────────────────────────────────────────────────────────────────────────

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "");
}

export function getRadarOnboardingD1(nome: string): string {
  return `${nome}, como ler o score que você vai receber 📊

Cada alerta Radar PB traz uma nota de *0 a 10*. Veja o que significa:

🔴 *0–4* → Desconto baixo, risco elevado ou dados incompletos. Pular.
🟡 *5–6* → Oportunidade moderada. Avalie só se conhece a região.
🟢 *7–8* → Bom desconto + risco controlado. Vale aprofundar.
⭐ *9–10* → Excepcional. Imóvel desocupado, sem ônus, desconto > 40%.

Junto ao score você também recebe:
📍 Cidade e bairro
💰 Avaliação × lance mínimo
⚖️ Situação jurídica resumida
🏛️ Link direto do leiloeiro

_Análise informativa. Não substitui advogado ou avaliação individual do edital._`;
}

export function getRadarOnboardingD3(nome: string): string {
  return `${nome}, você recebeu o alerta — e agora? 🏠

Antes de dar o lance, verifique estes 5 pontos rápidos:

1️⃣ *Matrícula atualizada* — confirme no cartório (CRI) se há ônus além do descrito
2️⃣ *Ocupação* — imóvel ocupado pode levar meses (ou anos) para desocupar
3️⃣ *Débitos de condomínio* — o arrematante herda a partir do leilão
4️⃣ *IPTU* — verifique situação na prefeitura (arrematante assume)
5️⃣ *Edital completo* — leia as condições especiais no site do leiloeiro

O Radar PB já entrega o resumo desses pontos em cada alerta.
Sua função é confirmar e decidir.

Dúvida em algum ponto? Responda aqui. 🤝`;
}

export function getRadarOnboardingD7(nome: string): string {
  const mentoria = appUrl() + "/mentoria";
  return `${nome}, da análise ao arremate — o caminho 🔨

Muita gente acha que leilão é só dar o maior lance. Não é.

*Passo a passo real:*
1. Recebe o alerta Radar PB (você já está aqui ✅)
2. Lê o edital completo no site do leiloeiro
3. Visita ou pesquisa o imóvel (fotos, Google Maps, vizinhos)
4. Consulta a matrícula atualizada (R$30 no cartório)
5. Define seu lance máximo considerando custos pós-arrematação
6. Participa do leilão online (geralmente 20–40 min)
7. Se arrematar: assina auto de arrematação e paga ITBI + custas
8. Solicita imissão na posse (se ocupado, via advogado)

*Parece muito?* A maioria das pessoas trava no passo 4 ou 5.

Se quiser um guia 1:1 personalizado para o seu primeiro arremate:
${mentoria}`;
}

export function getRadarOnboardingD30(nome: string): string {
  const mentoria = appUrl() + "/mentoria";
  return `${nome}, 30 dias de Radar PB — e agora? 🎯

Você já recebeu dezenas de alertas com score, análise jurídica e link do leiloeiro.

Pergunta direta: *você já chegou perto de arrematar algum imóvel?*

→ *Sim, mas tive dúvidas no caminho* — a Mentoria Lance Certo é pra você.
→ *Não, ainda não me sinto seguro* — exatamente o que a Mentoria resolve.
→ *Sim, já arrematei!* — ótimo. Me conta, seria um case incrível! 🏆

A Mentoria é uma *reunião 1:1* comigo onde analisamos:
📋 Um imóvel real do Radar que você quer avaliar
⚖️ Riscos jurídicos específicos do edital
💰 Estratégia de lance para o seu perfil de investidor

Não é gravado, não tem aula. É uma conversa de investidor para investidor.

Interessado?
${mentoria}`;
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
