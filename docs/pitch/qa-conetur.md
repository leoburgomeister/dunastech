# Q&A completo — CONETUR (30/07/2026)

> Versão final, consolidada na véspera. Substitui o `qa-tecnico.md` da branch de planejamento.
> Respostas curtas e defensáveis. Número sem certeza → **"trago o dado"** — nunca inventar diante do conselho.

## Produto e conceito

**O que é o ISA?**
Índice de Saúde do Atrativo. Cada avaliação de turista pontua 8 dimensões (limpeza, sinalização, preservação, acessibilidade, segurança, custo-benefício, conservação, lotação). O algoritmo agrega num índice 0–100 por atrativo, e ele é critério de desempate no ranking de roteiros.

**Isso não é um TripAdvisor?**
TripAdvisor é opinião solta. O POTI cruza a avaliação do turista com base oficial (Cadastur, IBGE) e devolve inteligência de gestão para quem decide política pública. E só recomenda quem está regular no Cadastur — é um incentivo à formalização.

**Como garantem que só recomendam quem é legal?**
Filtro na base do Cadastur: só entra na recomendação prestador ativo/regularizado. Combate à informalidade por desenho, não por fiscalização.

**Por que três polos no piloto?**
Não é cobertura — é teste de usabilidade e integração. Costa das Dunas e Costa Branca estressam volume de dado; Seridó valida o funcionamento onde a estrutura é fraca, exatamente onde a interiorização precisa provar valor. O roteiro B2C já é estadual desde o dia 1; o que se pilota é o painel de gestão por polo.

**E depois do piloto?**
Fase 2: os 11 polos, cada IGR com acesso próprio e controle sobre os atrativos do seu território.

## Contratação e preço

**Como o estado contrataria isso?** *(resposta mais importante da manhã)*
Existe instrumento próprio: o **Contrato Público para Solução Inovadora (CPSI)**, do Marco Legal das Startups — LC 182/2021. Feito exatamente para o poder público testar solução inovadora sem licitação tradicional, com risco tecnológico protegido. Até R$ 1,6 milhão, 12 meses prorrogáveis. É só a SETUR publicar o desafio.

*(Nota interna: é licitação em modalidade especial — concorrentes podem participar. Nossa vantagem: produto no ar, dado real integrado, chancela do hackathon. E o CPSI não obriga o estado a comprar depois do teste. Não falar essas ressalvas no plenário, mas saber.)*

**Quanto custa?**
"O piloto se encaixa no instrumento do Marco das Startups. Depois, o painel é licenciado por polo — e a referência é o que o estado já investe: só a capacitação dos polos custou quase R$ 1 milhão. O observatório dos 11 polos custa menos de dois terços disso, por ano. Trazemos a proposta detalhada na reunião técnica."

*(Se pressionarem: R$ 4.900/mês por dashboard de polo ≈ R$ 58,8 mil/ano; 11 polos ≈ R$ 647 mil/ano. Piloto CPSI: R$ 400–600 mil — NÃO abrir esse valor no plenário. Números são âncoras pendentes de validação contra custo real.)*

**Vocês vendem posição no ranking? / O estado abre a base e vocês vendem destaque?** *(pergunta hostil esperada)*
"Patrocínio compra visibilidade, não compra nota. O ISA é calculado pela avaliação do turista e ninguém paga para subir nele. Todo destaque pago vem rotulado como patrocinado, e só quem está regular no Cadastur pode patrocinar."

**O turista paga? O prestador pequeno paga?**
Não e não. B2C é gratuito sempre — é a fonte do dado. Prestador regularizado tem vitrine gratuita; o destaque patrocinado é opcional.

## Arquitetura e dados

**Qual a stack?**
Aplicação web Next.js/React (TypeScript), banco **Supabase (PostgreSQL)** em região brasileira, mapas MapLibre com imagem de satélite, hospedagem Vercel. IA via API do Google Gemini para os diagnósticos. Multilíngue (PT/EN/ES).

**Os dados são reais ou é demonstração?**
Destinos, municípios, Cadastur e IBGE são reais, servidos do banco em produção. As avaliações são reais e em tempo real — dá para ver o painel reagir ao vivo. As projeções preditivas (fluxo/receita futura) são o próximo release: hoje entregamos o indicador e a base.

**De onde vêm os dados?**
Cadastur (dados abertos do Ministério do Turismo), IBGE, e as avaliações dos turistas no próprio app. Roadmap: Sírio (Fecomércio/Senac/Emprotur), Portal de Dados Abertos do RN, OPOTUR/UERN e sinais de mídia social.

**E a LGPD?**
Interações do turista são anonimizadas antes de qualquer agregação no painel. Nenhum dado pessoal identificável vai para o B2G. Chaves de API só no servidor; controle de acesso por linha (RLS) no banco — na prática: visitante pode ler e enviar avaliação, mas não pode alterar nem apagar nada.

**E se cair a internet no palco?**
O app degrada para dados locais sem quebrar a tela (verificado em produção). E o notebook tem o 4G do celular como rota alternativa.

## Empresa e execução

**Vocês têm CNPJ?**
Sim — CNPJ ativo e **cadastro deferido no Cadastur** (julho/2026). A constituição da LTDA com os cinco sócios está em andamento.

**Já falaram com a SETUR/Emprotur?**
Sim — há conversas em andamento e interesse demonstrado. O que buscamos hoje é formalizar o próximo passo: a reunião técnica.

**Quem é o time?**
Cinco sócios com papéis definidos: produto/negócio, backend/arquitetura, comercial/campo, gestão de projeto, branding/comunicação.

**Por que confiar que vão entregar?**
Ideia vencedora geral e da trilha de turismo do Hackathon do Sol — e, diferente de um slide, o produto está no ar em dunastech.com.br, com dado real, hoje.

**"E se mudar o governo/secretário?"**
O valor do dado é do estado, não de uma gestão. A proposta é parceria institucional em que a base histórica fica com a SETUR.

**"Os dados do Cadastur estão desatualizados."**
Sincronização periódica com a fonte — e o uso do app na ponta ajuda a corrigir o cadastro: o prestador tem incentivo para se regularizar, porque é isso que o faz aparecer.
