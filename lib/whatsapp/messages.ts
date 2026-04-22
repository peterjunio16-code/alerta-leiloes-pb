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
⭐ Score Radar: 8/10
📋 Status: Desocupado, sem ônus além do IPTU

Esse imóvel foi arrematado por um membro do grupo em novembro. Hoje vale ~R$310k com a valorização do bairro.

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

Por apenas *R$37,90/mês*. Cancele quando quiser.

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
