import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin/auth";

// Banco de artigos pré-escritos — rotaciona semanalmente
const BANCO_ARTIGOS = [
  {
    titulo: "Como Avaliar um Imóvel em Leilão Antes de Dar o Lance",
    resumo: "Conheça as 5 perguntas essenciais que todo arrematante experiente faz antes de disputar um leilão.",
    conteudo: `# Como Avaliar um Imóvel em Leilão Antes de Dar o Lance

Antes de dar o lance em qualquer imóvel de leilão, é fundamental fazer uma análise criteriosa. Arrematantes inexperientes costumam cometer erros que custam caro — e que poderiam ser evitados com perguntas simples.

## 1. O imóvel está ocupado?

Este é o primeiro ponto de atenção. Imóveis ocupados exigem processo de imissão na posse, que pode levar meses. Verifique se o edital menciona a situação de ocupação.

## 2. Qual é a situação jurídica?

Antes de arrematar, consulte a matrícula do imóvel no cartório e verifique:
- Hipotecas ou penhoras pendentes
- Ações judiciais em andamento
- Débitos de IPTU

## 3. O lance inicial representa um desconto real?

Compare o valor de lance com o valor de avaliação e com o preço de mercado do imóvel na região. O desconto verdadeiro só existe quando há referência de mercado.

## 4. Quais são os custos adicionais?

Além do lance, considere:
- ITBI (Imposto de Transmissão de Bens Imóveis)
- Custas cartorárias
- Honorários do leiloeiro (comissão)
- Eventuais reformas e regularizações

## 5. Qual é o prazo de pagamento?

Leilões judiciais e extrajudiciais têm prazos diferentes. Certifique-se que você tem o capital disponível ou financiamento aprovado antes de disputar.

## Conclusão

Uma análise completa antes do leilão é o que separa o arrematante estratégico do impulsivo. Use o **Score de Oportunidade do Radar PB** para ter todos esses critérios avaliados automaticamente antes de cada imóvel.`,
  },
  {
    titulo: "ITBI em Leilões de Imóveis: Quanto Você Vai Pagar?",
    resumo: "Entenda como é calculado o ITBI em leilões judiciais e extrajudiciais e como isso impacta a rentabilidade do seu arremate.",
    conteudo: `# ITBI em Leilões de Imóveis: Quanto Você Vai Pagar?

O ITBI (Imposto de Transmissão de Bens Imóveis) é um dos custos mais esquecidos por quem está começando em leilões. Ignorá-lo pode transformar um bom negócio em um mau investimento.

## O que é o ITBI?

É o imposto municipal cobrado na transferência de propriedade de imóveis. Em João Pessoa — PB, a alíquota é de **3%** sobre o valor venal ou o valor de arremate, o que for maior.

## Como é calculado no leilão?

Muitos prefeituras calculam o ITBI sobre o **valor de avaliação do imóvel**, não sobre o valor do seu lance. Isso significa que mesmo comprando com 50% de desconto, você pode pagar ITBI sobre o valor cheio.

### Exemplo prático:
- Valor de avaliação: R$ 300.000
- Seu lance: R$ 150.000
- ITBI calculado sobre: R$ 300.000
- ITBI a pagar (3%): **R$ 9.000**

## Como reduzir o impacto do ITBI?

Em leilões extrajudiciais (banco), o ITBI costuma ser calculado sobre o valor de arremate. Em leilões judiciais, há mais variação — consulte a legislação do município.

## Outros custos que entram na conta

- Comissão do leiloeiro: 5% sobre o valor do arremate
- Registro em cartório: varia por município
- Eventuais débitos assumidos: IPTU, condomínio atrasado

## Conclusão

Sempre calcule o **custo total de aquisição** antes de dar seu lance. O Radar PB inclui uma estimativa de custos em cada análise para que você nunca seja surpreendido.`,
  },
  {
    titulo: "Leilão de 1ª e 2ª Praça: Qual a Diferença e Quando Comprar?",
    resumo: "Descubra a diferença entre primeira e segunda praça em leilões judiciais e qual é o melhor momento para fazer sua oferta.",
    conteudo: `# Leilão de 1ª e 2ª Praça: Qual a Diferença e Quando Comprar?

Se você já pesquisou leilões judiciais, certamente encontrou os termos "1ª praça" e "2ª praça". Entender a diferença entre eles é fundamental para uma estratégia de arremate eficaz.

## O que é a 1ª Praça?

Na primeira praça, o imóvel é ofertado pelo **valor de avaliação**. Só é vendido se alguém fizer uma oferta igual ou superior a esse valor. Caso não haja lances, o leilão vai para a segunda praça.

## O que é a 2ª Praça?

Na segunda praça, o imóvel pode ser arrematado por **qualquer valor acima de 50% da avaliação** (regra geral). Isso é onde as maiores oportunidades aparecem — e onde o risco também é maior.

## Quando comprar na 1ª Praça?

Compre na 1ª praça quando o imóvel tem concorrência alta e o valor de avaliação já representa um bom desconto em relação ao mercado. É mais seguro juridicamente.

## Quando comprar na 2ª Praça?

A 2ª praça oferece maior potencial de desconto. Compre quando:
- Você já fez due diligence completo
- O imóvel está desocupado
- Não há ônus ocultos na matrícula

## Atenção: o que o edital diz?

Sempre leia o edital completo. Ele especifica o valor mínimo de cada praça, as condições de pagamento e os ônus que o arrematante assume.

## Conclusão

Saber em qual praça agir — e com qual estratégia — é o que diferencia o arrematante amador do profissional. O Radar PB identifica automaticamente se o imóvel está em 1ª ou 2ª praça e calcula o desconto real para você.`,
  },
  {
    titulo: "Financiamento Bancário Para Imóvel Arrematado em Leilão: É Possível?",
    resumo: "Saiba se você pode financiar um imóvel adquirido em leilão e quais bancos aceitam esse tipo de operação na Paraíba.",
    conteudo: `# Financiamento Bancário Para Imóvel Arrematado em Leilão: É Possível?

Uma das dúvidas mais comuns de quem está começando em leilões é: preciso ter o valor total em caixa? A resposta depende do tipo de leilão.

## Leilões Extrajudiciais (Banco)

Nos leilões realizados por instituições financeiras (Caixa, Bradesco, Santander), é comum que o próprio banco ofereça **financiamento do imóvel arrematado**. Isso significa que você pode dar uma entrada e financiar o restante.

A Caixa, por exemplo, aceita financiar imóveis vendidos em seus próprios leilões com condições do programa habitacional.

## Leilões Judiciais

Nos leilões judiciais, em geral, o pagamento deve ser feito **à vista** ou dentro do prazo estipulado no edital (geralmente 15 a 30 dias). Algumas comarcas permitem parcelamento com aprovação do juiz — mas isso é exceção.

## Alternativas ao Financiamento Tradicional

- **Capital próprio**: a situação mais simples e sem burocracia
- **Consórcio contemplado**: cartas de consórcio com crédito liberado
- **Crédito com garantia de imóvel**: use outro imóvel como garantia para ter capital disponível

## O que fazer antes de participar

1. Verifique no edital se o leilão aceita financiamento
2. Se aceitar, pré-aprove seu crédito antes do leilão
3. Tenha comprovante de capacidade de pagamento em mãos

## Conclusão

Não ter capital total não significa que você está fora dos leilões — mas exige mais planejamento. O Radar PB sinaliza nos alertas quando um imóvel aceita financiamento bancário, facilitando sua estratégia.`,
  },
  {
    titulo: "Os Melhores Bairros de João Pessoa Para Investir via Leilão em 2025",
    resumo: "Análise dos bairros com maior potencial de valorização em João Pessoa para quem quer investir em imóveis via leilão.",
    conteudo: `# Os Melhores Bairros de João Pessoa Para Investir via Leilão em 2025

Escolher o bairro certo é tão importante quanto encontrar um bom desconto. Um imóvel barato no lugar errado pode ser um investimento ruim. Veja nossa análise dos bairros com maior potencial em João Pessoa.

## Manaíra e Tambaú — Litorâneos e sempre valorizados

A orla de João Pessoa continua sendo a região mais disputada. Imóveis nesses bairros têm alta liquidez — você consegue alugar ou vender com facilidade. Desconto médio em leilão: **42%**.

## Intermares e Bessa — Crescimento acelerado

Esses bairros do litoral norte têm crescido rapidamente. Novos empreendimentos elevam o valor de imóveis mais antigos. Ótimas oportunidades para quem busca imóveis para reformar e revender.

## Altiplano e Expedicionários — Bairros nobres em expansão

Infraestrutura de alto padrão e crescente demanda por imóveis de médio-alto padrão. Leilões nessa região frequentemente apresentam descontos de **35 a 55%** em relação ao valor de mercado.

## Cristo Redentor e Mangabeira — Volume e oportunidades

Com alta densidade populacional, esses bairros têm grande volume de imóveis em leilão. Indicado para quem quer escalar o número de arremates, com imóveis de ticket menor e retorno via aluguel.

## Como o Radar PB filtra por bairro

No Radar PB, você pode configurar alertas específicos por bairro. Assim que um imóvel de Manaíra ou Altiplano entrar no radar com score acima de 7, você recebe o alerta primeiro.

## Conclusão

João Pessoa tem oportunidades em todos os perfis de bairro. A chave é alinhar sua estratégia (renda passiva, revenda ou moradia) com o bairro certo. O Radar PB faz esse cruzamento por você.`,
  },
  {
    titulo: "Dívidas de IPTU e Condomínio em Leilões: Quem Paga?",
    resumo: "Entenda quem é responsável pelas dívidas de IPTU e condomínio quando você arremata um imóvel em leilão — e como se proteger.",
    conteudo: `# Dívidas de IPTU e Condomínio em Leilões: Quem Paga?

Uma das armadilhas mais comuns em leilões de imóveis é assumir dívidas que não eram esperadas. Antes de dar seu lance, você precisa entender quem paga o quê.

## IPTU em Leilões Judiciais

Em leilões judiciais, a jurisprudência consolidada do STJ determina que **as dívidas de IPTU anteriores ao arremate são sub-rogadas** — ou seja, passam para o arrematante. Por isso é fundamental verificar o extrato de débitos municipais antes de licitar.

Como verificar: solicite a certidão de débitos do imóvel na Prefeitura de João Pessoa pelo site oficial ou presencialmente no Centro Administrativo.

## Condomínio em Leilões Judiciais

As dívidas de condomínio também seguem a mesma regra — o arrematante herda os débitos. O STJ tem entendido que o condomínio tem natureza propter rem (segue o imóvel, não o devedor).

## Como se Proteger

1. **Leia o edital**: alguns editais especificam que as dívidas são pagas com o produto do arremate
2. **Solicite extrato de débitos antes do leilão**: tanto IPTU quanto condomínio
3. **Calcule os débitos no seu custo de aquisição**: não se surpreenda depois
4. **Consulte um advogado**: especialmente em imóveis com histórico de inadimplência longa

## Leilões Extrajudiciais (Banco)

Nos leilões de banco, as dívidas costumam ser quitadas antes da transferência — mas confirme isso no edital. É uma das vantagens desse tipo de leilão.

## Conclusão

Conhecer as dívidas do imóvel não é opcional — é parte do processo de due diligence. O Radar PB inclui uma seção de ônus conhecidos em cada análise para que você entre no leilão com segurança.`,
  },
  {
    titulo: "Como Usar o Score de Oportunidade Para Escolher os Melhores Leilões",
    resumo: "Entenda os 6 critérios do Score de Oportunidade do Radar PB e como usá-los para priorizar os melhores arremates.",
    conteudo: `# Como Usar o Score de Oportunidade Para Escolher os Melhores Leilões

Com dezenas de leilões acontecendo todo mês na Paraíba, como saber em qual focar? O Score de Oportunidade do Radar PB foi criado exatamente para isso.

## O que é o Score de Oportunidade?

É uma pontuação de 0 a 10 atribuída a cada imóvel monitorado, com base em 6 critérios objetivos. Quanto maior o score, maior o potencial de rentabilidade do arremate.

## Os 6 Critérios Avaliados

### 1. Desconto sobre a avaliação (peso 30%)
Quanto o lance inicial está abaixo do valor de avaliação. Descontos acima de 50% pontuam o máximo.

### 2. Liquidez do bairro (peso 20%)
Bairros com alta demanda de aluguel e compra recebem pontuação maior. Manaíra, Tambaú e Altiplano têm histórico de liquidez alta.

### 3. Situação de ocupação (peso 20%)
Imóvel desocupado = score máximo. Ocupado com inquilino = médio. Ocupado por devedores = baixo.

### 4. Situação jurídica (peso 15%)
Matrícula limpa e sem ônus além do exequível pontuam bem. Múltiplas penhoras ou processos em andamento reduzem o score.

### 5. Tipo de leilão (peso 10%)
Extrajudicial tende a ter mais previsibilidade jurídica. Judicial de 2ª praça com desconto agressivo pode compensar.

### 6. Prazo até o leilão (peso 5%)
Imóveis com mais de 15 dias até o leilão permitem due diligence completo — pontuam melhor.

## Como Interpretar o Score

- **8-10**: Oportunidade prioritária. Faça a due diligence imediatamente.
- **6-7**: Boa oportunidade com pontos de atenção. Avalie caso a caso.
- **4-5**: Oportunidade mediana. Pode ser interessante com estratégia específica.
- **0-3**: Risco elevado. Não recomendado para iniciantes.

## Conclusão

O Score de Oportunidade existe para que você gaste energia apenas nos imóveis com real potencial. Assine o Radar PB e receba no WhatsApp apenas os alertas com score acima do seu critério mínimo.`,
  },
  {
    titulo: "Passo a Passo Para Participar do Seu Primeiro Leilão de Imóvel",
    resumo: "Um roteiro completo e prático para quem vai participar do primeiro leilão de imóvel na Paraíba — do cadastro à arrematação.",
    conteudo: `# Passo a Passo Para Participar do Seu Primeiro Leilão de Imóvel

Participar de um leilão pela primeira vez pode parecer intimidante, mas o processo é mais simples do que parece. Veja o roteiro completo.

## Etapa 1: Escolha o Imóvel com Antecedência

Nunca entre em um leilão de improviso. Selecione o imóvel com pelo menos **15 dias de antecedência** — tempo suficiente para fazer a due diligence completa.

Use o Alerta Leilões PB para receber notificações de novos imóveis que entram no radar semanalmente.

## Etapa 2: Leia o Edital Completo

O edital é o documento mais importante. Nele você encontra:
- Valor de avaliação e lance mínimo
- Data, horário e forma de participação (presencial ou online)
- Condições de pagamento
- Ônus que o arrematante assume
- Documentação exigida

## Etapa 3: Faça a Due Diligence

- Visite o imóvel (se possível)
- Consulte a matrícula no cartório
- Verifique débitos de IPTU
- Calcule custos totais (ITBI + comissão + regularizações)

## Etapa 4: Defina Seu Lance Máximo

Com todos os custos mapeados, defina o valor máximo que você pode pagar e ainda ter a rentabilidade desejada. **Nunca ultrapasse esse valor** no calor do leilão.

## Etapa 5: Faça Seu Cadastro Na Plataforma

Para leilões online, você precisa de:
- CPF/CNPJ
- Documento de identidade
- Comprovante de residência

Faça o cadastro com antecedência — a aprovação pode levar horas.

## Etapa 6: Participe do Leilão

No leilão online, acompanhe os lances em tempo real. No presencial, chegue cedo e esteja com sua documentação em mãos.

## Etapa 7: Após o Arremate

Se você vencer: assine o auto de arrematação, efetue o pagamento no prazo e inicie o processo de transferência. Parabéns — você é um arrematante!

## Conclusão

O segredo do sucesso em leilões está na preparação, não na impulsividade. O Radar PB cuida da parte de monitoramento e análise para que você foque no que importa: a decisão de compra.`,
  },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function POST() {
  if (!getAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Verifica quantos artigos já existem para escolher o próximo do banco
  const { count } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true });

  const total = count ?? 0;
  const artigo = BANCO_ARTIGOS[total % BANCO_ARTIGOS.length];

  const slug = slugify(artigo.titulo) + "-" + Date.now().toString(36);

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      titulo: artigo.titulo,
      slug,
      conteudo: artigo.conteudo,
      resumo: artigo.resumo,
      publicado: true,
    })
    .select("id,slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    id: data.id,
    slug: data.slug,
    titulo: artigo.titulo,
  });
}
