import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slug(titulo) {
  return titulo
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Date.now().toString(36);
}

const artigos = [
  {
    titulo: "Como Funciona um Leilão de Imóveis na Paraíba: Guia Completo para Iniciantes",
    resumo: "Entenda o passo a passo para participar de leilões de imóveis em João Pessoa e na Paraíba, do edital até o arremate.",
    tags: ["leilão", "paraíba", "guia", "iniciante", "joão pessoa"],
    conteudo: `# Como Funciona um Leilão de Imóveis na Paraíba: Guia Completo para Iniciantes

Se você nunca participou de um leilão de imóveis, o processo pode parecer intimidador. Mas a realidade é que qualquer pessoa física pode participar — e as oportunidades na Paraíba são reais.

## O que é um leilão de imóvel?

Um leilão de imóvel acontece quando um bem é colocado à venda de forma pública, geralmente porque o devedor não pagou um financiamento (leilão extrajudicial) ou porque um juiz determinou a venda de um bem penhorado para pagar uma dívida (leilão judicial).

O lance mínimo costuma ser bem abaixo do valor de mercado — às vezes 50%, 60% ou até 70% menor.

## Tipos de leilão em João Pessoa e PB

### Leilão Judicial
- Determinado por ordem judicial
- Publicado no Diário Oficial
- Requer más condições de ocupação verificadas
- Pode ter mais riscos jurídicos

### Leilão Extrajudicial
- Promovido por bancos (CEF, Bradesco, Itaú etc.)
- Imóvel retomado por falta de pagamento
- Geralmente mais limpo juridicamente
- Processo mais rápido de transferência

## Passo a passo para participar

**1. Encontre o leilão**
Use plataformas como LeilãoNinja, Sold ou os sites dos próprios leiloeiros. O Radar PB já faz essa busca por você na Paraíba.

**2. Leia o edital com atenção**
O edital contém todas as informações: valor de avaliação, lance mínimo, condições de pagamento, situação de ocupação e ônus existentes. Nunca pule essa etapa.

**3. Analise o imóvel**
Se possível, visite o local. Verifique a matrícula no cartório, consulte débitos de IPTU e condomínio, e avalie a localização.

**4. Cadastre-se no leiloeiro**
Você precisa de CPF, RG e comprovante de residência. Algumas plataformas aceitam documentos digitais.

**5. Dê o lance**
Leilões online acontecem em tempo real. Defina seu limite máximo antes de começar e não deixe a emoção ultrapassar o orçamento.

**6. Arremate e pague**
Após vencer, você receberá o auto de arrematação. O pagamento geralmente é à vista ou parcelado conforme o edital.

## O que verificar antes de dar o lance

✅ Matrícula do imóvel (pedir no cartório de registro de imóveis)
✅ Certidões de ônus reais
✅ IPTU em dia ou valor dos débitos
✅ Taxa de condomínio (para apartamentos)
✅ Situação de ocupação (livre, ocupado pelo devedor, locatário)
✅ Existência de recursos pendentes no processo

## Quanto custa além do lance?

- **ITBI** (Imposto de Transmissão): em João Pessoa é 2% do valor do imóvel
- **Cartório** (escritura e registro): aproximadamente 1% a 2%
- **Comissão do leiloeiro**: normalmente 5% sobre o lance
- **Eventuais reformas** dependendo do estado do imóvel

## Conclusão

Leilões de imóveis na Paraíba são uma das formas mais eficientes de adquirir imóveis com desconto real. Mas exigem preparo, análise e paciência. Com as informações certas, o risco cai drasticamente.

O Radar PB monitora diariamente os leilões em toda a Paraíba e entrega alertas com análise de score, riscos e link direto para o edital — direto no seu WhatsApp.`,
  },

  {
    titulo: "Leilão Judicial vs Extrajudicial: Qual a Diferença e Qual é Mais Seguro?",
    resumo: "Descubra as principais diferenças entre leilões judiciais e extrajudiciais e como isso afeta o risco e a rentabilidade do seu arremate.",
    tags: ["leilão judicial", "leilão extrajudicial", "riscos", "educação", "segurança"],
    conteudo: `# Leilão Judicial vs Extrajudicial: Qual a Diferença e Qual é Mais Seguro?

Uma das dúvidas mais comuns de quem está começando no mercado de leilões imobiliários é: qual é melhor — o leilão judicial ou o extrajudicial? A resposta depende do perfil do investidor e do imóvel em questão.

## Leilão Judicial

O leilão judicial acontece por determinação de um juiz, geralmente dentro de um processo de execução de dívida. O imóvel é penhorado e levado a leilão para pagar os credores.

### Características:
- Publicado no Diário Oficial e em jornais de grande circulação
- Pode ter recursos pendentes (o devedor pode recorrer)
- Processo mais lento para receber o imóvel
- Possibilidade de o devedor ainda estar morando no imóvel
- Pode haver débitos acumulados de IPTU e condomínio

### Vantagens:
- Descontos maiores (às vezes 50-70% abaixo da avaliação)
- Volume de imóveis maior
- Oportunidades para negociadores experientes

### Riscos:
- Recursos judiciais podem atrasar a posse por meses
- Imóvel pode estar ocupado por inquilinos com contrato
- Débitos anteriores ao arremate podem existir

## Leilão Extrajudicial

Acontece quando um banco ou instituição financeira retoma um imóvel financiado por falta de pagamento do mutuário. Não envolve o Judiciário — segue um processo administrativo previsto em contrato.

### Características:
- Promovido por bancos: CEF, Bradesco, Itaú, Santander
- Imóvel é retomado através da alienação fiduciária
- Processo mais rápido e previsível
- Geralmente mais documentação disponível

### Vantagens:
- Mais segurança jurídica (banco já "limpou" o imóvel)
- Processo de transferência mais rápido
- Documentação mais organizada
- Bancos muitas vezes oferecem financiamento para compra

### Riscos:
- Descontos menores que os judiciais
- Imóvel pode ainda estar ocupado pelo antigo dono
- Pode haver atrasos na desocupação

## Tabela comparativa

| Critério | Judicial | Extrajudicial |
|---|---|---|
| Desconto médio | 40–70% | 25–50% |
| Risco jurídico | Alto | Baixo |
| Velocidade de posse | Lenta (meses) | Rápida (semanas) |
| Documentação | Incompleta | Organizada |
| Financiamento | Raro | Possível |

## Qual escolher?

Para **iniciantes**, leilões extrajudiciais são mais seguros: menos surpresas, processo mais claro e risco jurídico controlado.

Para **investidores experientes**, leilões judiciais oferecem descontos maiores — mas exigem análise minuciosa do processo, consulta jurídica e paciência.

O Radar PB indica no score de cada imóvel o tipo de leilão e o nível de risco jurídico, para que você tome a decisão com informação completa.`,
  },

  {
    titulo: "5 Erros Que Fazem Iniciantes Perder Dinheiro em Leilões de Imóveis",
    resumo: "Conheça os erros mais comuns de quem está começando e aprenda a evitá-los antes de dar o primeiro lance.",
    tags: ["erros", "dicas", "iniciante", "cuidados", "lance"],
    conteudo: `# 5 Erros Que Fazem Iniciantes Perder Dinheiro em Leilões de Imóveis

Leilões de imóveis podem ser excelentes oportunidades — mas também armadilhas para quem não se prepara. Veja os 5 erros mais comuns e como evitá-los.

## Erro 1: Não ler o edital completo

O edital é o documento mais importante de qualquer leilão. Ele contém informações sobre:

- Valor mínimo de lance
- Condições de pagamento
- Situação de ocupação
- Débitos existentes (IPTU, condomínio)
- Prazo para desocupação

**Muitos iniciantes olham apenas o lance mínimo e ignoram o restante.** Isso pode resultar em surpresas desagradáveis — como descobrir que o imóvel está ocupado por inquilinos com contrato vigente, ou que existem dívidas de condomínio superiores a R$ 30.000.

✅ **Solução:** Leia o edital do início ao fim. Se tiver dúvidas, consulte um advogado especializado em direito imobiliário.

## Erro 2: Não verificar a matrícula do imóvel

A matrícula é o "RG" do imóvel. Ela registra todo o histórico do bem: proprietários anteriores, hipotecas, penhoras, ações judiciais vinculadas.

Comprar sem verificar a matrícula é como comprar um carro sem checar o histórico de batidas e alienações.

✅ **Solução:** Solicite a certidão de matrícula atualizada no Cartório de Registro de Imóveis da comarca onde o imóvel está localizado. Custa em torno de R$ 50-100 e pode salvar seu investimento.

## Erro 3: Não calcular o custo total

O lance é só o começo. Muitos iniciantes esquecem de incluir no cálculo:

- **ITBI**: 2% sobre o valor do imóvel em João Pessoa
- **Cartório** (escritura + registro): ~1,5% do valor
- **Comissão do leiloeiro**: geralmente 5% sobre o lance
- **Reforma**: o imóvel pode precisar de obras
- **Dívidas de condomínio/IPTU**: o arrematante pode ser responsabilizado

**Exemplo:** Lance de R$ 150.000 pode ter R$ 20.000 a R$ 30.000 em custos adicionais.

✅ **Solução:** Some tudo antes de definir o lance máximo. O Simulador do Alerta Leilões PB ajuda você a calcular a margem real da operação.

## Erro 4: Se emocionar durante o leilão

Leilões ao vivo — ou mesmo online — criam uma adrenalina que pode fazer você ultrapassar seu limite. Outro participante aumenta o lance, você reage impulsivamente, e de repente pagou 20% a mais do que planejou.

✅ **Solução:** Defina seu lance máximo **antes** de entrar no leilão e não mude esse número, independente do que aconteça. Se outro licitante ultrapassar, deixe ir. Sempre haverá outro imóvel.

## Erro 5: Ignorar a situação de ocupação

Imóveis ocupados são um dos maiores riscos em leilões judiciais. O antigo morador pode:

- Recusar a sair voluntariamente
- Exigir ação de reintegração de posse na Justiça
- Danificar o imóvel antes de sair
- Ter contrato de locação que precisa ser respeitado

O processo de reintegração de posse pode levar de 6 meses a mais de 1 ano em João Pessoa.

✅ **Solução:** Prefira imóveis desocupados para os primeiros arremates. O Radar PB indica claramente o status de ocupação de cada imóvel monitorado.

---

## Resumo

Leilões de imóveis na Paraíba são uma excelente forma de investir com desconto — desde que você se prepare. Leia o edital, verifique a matrícula, calcule todos os custos, mantenha a disciplina durante o lance e atenção ao status de ocupação.

Com a análise certa, o risco cai muito e a rentabilidade aumenta significativamente.`,
  },

  {
    titulo: "Score de Oportunidade: Como Avaliamos Cada Leilão no Radar PB",
    resumo: "Conheça os 6 critérios que usamos para calcular a nota de cada imóvel em leilão monitorado pelo Radar PB na Paraíba.",
    tags: ["score", "análise", "radar pb", "metodologia", "critérios"],
    conteudo: `# Score de Oportunidade: Como Avaliamos Cada Leilão no Radar PB

Quando você recebe um alerta do Radar PB, cada imóvel já vem com uma nota de 0 a 10. Essa nota é o *Score de Oportunidade* — uma análise objetiva baseada em 6 critérios que determinam se o leilão vale a pena ou não.

Aqui está exatamente como calculamos.

## Por que um score objetivo?

O mercado de leilões tem milhares de imóveis. Na Paraíba, monitoramos dezenas de novos leilões toda semana. Sem um critério de filtragem, você perderia horas analisando imóveis ruins antes de encontrar uma oportunidade real.

O score elimina o "achismo" e coloca os melhores imóveis no topo da sua lista — automaticamente.

## Os 6 Critérios

### 1. Desconto no Lance (peso: 25%)
Comparamos o lance mínimo com o valor de avaliação do imóvel. Quanto maior o desconto, maior a nota.

- Desconto acima de 50%: nota 9-10
- Desconto entre 30-50%: nota 6-8
- Desconto abaixo de 30%: nota 0-5

### 2. Localização e Liquidez (peso: 20%)
Avaliamos o bairro e a facilidade de revenda ou locação do imóvel. Bairros com alta demanda em João Pessoa (Miramar, Tambaú, Cabo Branco, Bessa, Aeroclube) recebem notas mais altas.

Também consideramos a tipologia: apartamentos têm liquidez maior que terrenos, na maioria dos casos.

### 3. Situação de Ocupação (peso: 20%)
Imóvel desocupado = nota máxima. Imóvel com ocupante sem título jurídico = nota média. Imóvel com locatário com contrato = nota baixa.

Ocupação é um dos fatores que mais impacta o custo real e o prazo da operação.

### 4. Ônus e Débitos (peso: 15%)
Analisamos a matrícula disponível no edital, verificando penhoras, hipotecas e a regularidade do IPTU. Imóvel com matrícula limpa recebe nota máxima.

### 5. Risco Jurídico (peso: 10%)
Leilões judiciais com recursos pendentes têm risco maior. Avaliamos o tipo do leilão, o estágio do processo e a probabilidade de o devedor recorrer com sucesso.

### 6. Tipo e Estado do Imóvel (peso: 10%)
Apartamentos residenciais em bom estado têm maior liquidez. Imóveis comerciais, terrenos e imóveis que precisam de reforma pesada recebem desconto na nota.

## Como interpretar o score

| Score | Interpretação |
|---|---|
| 0–4 | Evitar — risco alto ou desconto insuficiente |
| 4–7 | Analisar — pode valer, mas exige cuidado |
| 7–10 | Priorizar — oportunidade com bom potencial |

## Importante: o score é um guia, não uma garantia

O score do Radar PB é uma ferramenta educativa e de filtragem. Ele não substitui a análise individual do edital, a visita ao imóvel e a consulta a um advogado especializado.

Cada operação é única. O score ajuda você a priorizar onde investir seu tempo de análise — mas a decisão final é sempre sua.

---

Quer receber imóveis com score alto direto no seu WhatsApp? Faça parte do grupo gratuito do Alerta Leilões PB.`,
  },

  {
    titulo: "Melhores Bairros para Investir em Leilões de Imóveis em João Pessoa",
    resumo: "Descubra quais bairros de João Pessoa têm maior liquidez para imóveis arrematados em leilão e por que a localização é tão importante.",
    tags: ["joão pessoa", "bairros", "liquidez", "investimento", "localização"],
    conteudo: `# Melhores Bairros para Investir em Leilões de Imóveis em João Pessoa

Quando se trata de leilões imobiliários, o desconto no lance é importante — mas a localização do imóvel determina a velocidade com que você consegue revender ou alugar depois do arremate.

Em João Pessoa, alguns bairros têm liquidez muito maior que outros. Aqui está nossa análise baseada no monitoramento contínuo do mercado imobiliário da capital paraibana.

## Por que a localização importa tanto?

Um imóvel com desconto de 60% num bairro de baixa demanda pode ser um problema. Já um imóvel com desconto de 40% em Miramar ou Tambaú tende a ter saída rápida — seja pela venda ou pela locação.

A liquidez determina:
- **O tempo** até você recuperar o investimento
- **O risco** de ficar com um imóvel encalhado
- **A margem real** da operação

## Bairros com maior liquidez em João Pessoa

### Zona Sul (Alta liquidez)

**Miramar**
Um dos bairros mais valorizados de João Pessoa. Apartamentos têm alta demanda tanto para locação quanto para venda. Excelente infraestrutura, próximo ao litoral sul.

**Tambaú e Cabo Branco**
Beira-mar, turístico e residencial. Imóveis aqui têm potencial de renda com aluguel por temporada além do convencional. Alta liquidez.

**Bessa e Intermares**
Crescimento acelerado nos últimos anos. Perfil mais jovem, boa infraestrutura, preços ainda acessíveis comparado a Tambaú. Excelente relação custo-benefício.

### Zona Leste e Centro (Liquidez média-alta)

**Aeroclube e Portal do Sol**
Bairros consolidados com boa infraestrutura. Alta demanda por apartamentos de 2 e 3 quartos.

**Altiplano**
Perfil de classe média-alta. Empreendimentos novos, boa valorização. Demanda crescente.

**Bancários e Água Fria**
Próximos à UFPB. Forte demanda por locação de estudantes e servidores públicos. Boa liquidez para apartamentos menores.

### Interior da PB (Liquidez regional)

**Campina Grande**
Segunda maior cidade da PB. Mercado robusto, especialmente próximo à UFCG. Bons descontos em leilões judiciais.

**Patos, Cajazeiras, Sousa**
Mercados menores mas com oportunidades pontuais e menos concorrência.

## O que evitar

🚩 **Bairros sem infraestrutura consolidada** — mesmo com desconto alto, o imóvel pode demorar muito para valorizar ou ter saída.

🚩 **Imóveis comerciais em regiões com vacância alta** — salas comerciais e galpões têm liquidez menor na maioria das cidades do interior.

🚩 **Terrenos sem documentação completa** — processo mais complexo e demorado.

## Como o Radar PB usa essa informação

No score de cada imóvel, o critério "Localização e Liquidez" pondera exatamente esses fatores. Bairros com alta demanda em João Pessoa recebem notas maiores — independente do desconto no lance.

Isso garante que você priorize imóveis que têm potencial real de rentabilidade, não apenas aqueles que parecem baratos no papel.

---

Quer receber alertas de leilões nos melhores bairros de João Pessoa? Entre no grupo gratuito do Alerta Leilões PB e receba análises direto no seu WhatsApp.`,
  },
];

async function seed() {
  console.log("🌱 Inserindo artigos no blog...\n");
  let ok = 0, erro = 0;

  for (const artigo of artigos) {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        titulo: artigo.titulo,
        slug: slug(artigo.titulo),
        resumo: artigo.resumo,
        conteudo: artigo.conteudo,
        publicado: true,
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error(`❌ Erro: ${artigo.titulo.slice(0, 50)}...`);
      console.error(`   ${error.message}`);
      erro++;
    } else {
      console.log(`✅ Criado: ${artigo.titulo.slice(0, 60)}...`);
      console.log(`   /blog/${data.slug}`);
      ok++;
    }
  }

  console.log(`\n📊 Resultado: ${ok} criados, ${erro} erros`);
  process.exit(0);
}

seed();
