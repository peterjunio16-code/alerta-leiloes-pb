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

export function getMentoriaAdminAlert(dados: Record<string, unknown>): string {
  return `🔔 *Nova candidatura — Mentoria Lance Certo*

👤 *Nome:* ${dados.nome}
📱 *WhatsApp:* ${dados.whatsapp}
🏠 *Já participou de leilão:* ${dados.participou_leilao === "sim" ? "Sim ✅" : "Não"}
💰 *Orçamento:* ${dados.orcamento}
🚧 *Principal trava:* ${dados.trava}

👉 Verifique no painel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/aplicacoes`;
}
