# Cheat-sheet de Q&A técnico — CONETUR (30/07/2026)

> Respostas curtas e defensáveis. Se não souber um número, dizer "trago o dado" — nunca inventar diante do conselho.

## Produto e conceito

**O que é o ISA?**
Índice de Saúde do Atrativo. Cada avaliação de turista pontua 8 dimensões (limpeza, sinalização, preservação, acessibilidade, segurança, custo-benefício, conservação, lotação). O algoritmo agrega isso num índice 0–100 por atrativo, ponderado, e serve inclusive como **critério de desempate** no ranking de roteiros.

**Como garantem que só recomendam quem é legal?**
Filtro no Cadastur: o parceiro tem o campo `regularizado`. Só entra na recomendação quem está ativo no Cadastur. Isso combate a informalidade — é um incentivo à formalização.

**Isso não é só um app de avaliação tipo TripAdvisor?**
Não. O TripAdvisor é opinião solta. O POTI cruza avaliação do turista com **base oficial (Cadastur, IBGE)** e devolve **inteligência de gestão** para o poder público — é B2G, não só B2C.

## Arquitetura e dados

**Qual a stack?**
Aplicação web Next.js/React (TypeScript), banco **Supabase (PostgreSQL)**, mapas MapLibre, hospedagem Vercel. Camada de IA via API do Google Gemini para os diagnósticos gerenciais. Multilíngue (PT/EN/ES).

**De onde vêm os dados?**
- **Cadastur** (Ministério do Turismo, dados abertos) — prestadores regularizados.
- **IBGE** — população, IDH, infraestrutura dos municípios.
- **Avaliações dos turistas** — em tempo real, via o próprio app (alimentam o ISA).
- Roadmap: **Sírio** (Fecomércio/Senac/Emprotur), Portal de Dados Abertos do RN, OPOTUR/UERN, e sinais de mídia social.

**Os dados são reais ou é demonstração?**
Cadastur, IBGE e os atrativos dos 3 polos são reais. As projeções preditivas (fluxo/receita futura) são o próximo passo — hoje mostramos o indicador e a base; o motor preditivo é o Release 2.

**E a privacidade / LGPD?**
As interações do turista são **anonimizadas** antes de qualquer agregação no painel do governo. Nenhum dado pessoal identificável vai para o B2G. Segurança: chaves de API só no servidor, nunca no navegador; controle de acesso por linha (RLS) no banco.

**E se cair a internet / o banco no palco?**
O app tem **camada de resiliência**: se o backend não responde, ele degrada para um snapshot local sem quebrar a tela. E temos vídeo de backup.

## Negócio e roadmap

**Como ganham dinheiro?**
Assinatura do painel B2G (governo/prefeituras) e B2B (redes hoteleiras/agências). Prestador pequeno entra de graça — visibilidade sem custo. **Não processamos pagamento nesta fase inicial** — somos direcionador informativo.

**Qual o tamanho do Release 1?**
Costa das Dunas, Costa Branca e Seridó: roteiro básico, filtro Cadastur, avaliações e ISA. Painel B2B, IA preditiva e alertas automáticos vêm em Release 2/3.

**Quem é o time?**
DunasTech: 5 sócios com papéis definidos (produto/negócio, backend/arquitetura, comercial/campo, gestão de projeto, branding/comunicação). Estrutura societária em formalização (LTDA).

**Por que confiar que vão entregar?**
É a ideia **vencedora geral e da trilha de turismo** do Hackathon do Sol. Já temos MVP funcional no ar, não só slide.

## Perguntas difíceis (preparar)

- **"E se mudar o governo/secretário?"** → O valor do dado é do estado, não de uma gestão. Propomos parceria institucional com a base ficando com a SETUR.
- **"Vocês têm CNPJ?"** → Em constituição (LTDA). *(Verificar status real antes do dia 30.)*
- **"Os dados do Cadastur estão desatualizados."** → Sincronização periódica; e o próprio uso do app ajuda a corrigir/atualizar o cadastro na ponta.
- **"Já falaram com a Emprotur/SETUR?"** → *(Preencher com o status real das conversas antes do palco.)*
