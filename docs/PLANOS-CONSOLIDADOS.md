# Planos, relatórios e ações — consolidação

> Levantamento de **20/08/2026** sobre todo documento de planejamento do repositório
> (raiz, `.gsd/`, `docs/`, adapters) **e das branches não mergeadas** (`cursor/*`).
> Reúne num lugar só o que está aberto, o que já foi entregue sem ser marcado, e o
> que ficou obsoleto. Fontes citadas em cada item.

---

## 1. Mapa dos documentos

| Onde | O que há | Situação |
|---|---|---|
| Raiz (`PROJECT_RULES.md`, `GSD-STYLE.md`, `model_capabilities.yaml`) | Regras do harness GSD | Válidos, mas o protocolo GSD **não é o processo em uso** (ver §4.1) |
| `.gsd/` (SPEC, ROADMAP, STATE, TODO, REQUIREMENTS, DECISIONS, JOURNAL, ARCHITECTURE, STACK) | Estado do projeto — **congelado em 26/06/2026**, era hackathon | **Obsoleto em bloco**: descreve Streamlit + Firestore; o produto é Next.js + Supabase. Roadmap marca 0/9 planos enquanto ~40 commits de feature já entraram |
| `docs/runbook.md`, `model-selection-playbook.md`, `token-optimization-guide.md` | Guias operacionais do harness | Válidos |
| `docs/pitch/` (cartão de palco, roteiro, 2 Q&As) | Material do CONETUR (30/07/2026) | Evento passou. `qa-conetur.md` **substitui** `qa-tecnico.md`; `cartao-de-palco.md` substitui `roteiro-3min.md` — as versões superadas seguem no repo sem marcação |
| `docs/superpowers/specs/` (5 specs) | Design de mapa 3D, pitch, abertura do mapa, **ISA nas rotas**, alcance dos transportes | 4 implementadas (o ISA em 20/08), 1 obsoleta por data (pitch) |
| `docs/superpowers/plans/` (3 planos) | Planos TDD passo a passo | 92 checkboxes somados, **zero marcados** — os 3 já executados (o do ISA em 20/08) |
| Branch `cursor/plano-acao-consolidado-8aa1` | `docs/startup/00–08` + dashboard: visão, relatório estratégico com OKRs, sociedade/equity, governança RACI, metodologia, cronograma, **plano consolidado de 23/07** | **Só existe na branch.** O doc se declara "plano operacional único" e nunca foi mergeado. A branch **não é mergeável como está** (deletaria `src/lib/map/`, `route-planner.ts`, `supabase/migrations/`) — o aproveitável é cherry-pick dos docs |
| Branch `cursor/setup-dev-environment-9835` | `AGENTS.md` + `docs/architecture/` (4 docs) | Arquitetura real documentada — também só na branch, mesma ressalva de merge |
| `.gemini/antigravity/.../walkthrough.md` | Relatório de implementação "V2" | Histórico; cita commit e domínio que não batem com a `main` atual |

---

## 2. Ações em aberto (consolidadas e deduplicadas)

### A. Bloqueadores operacionais — dependem de acesso do PO, não de código

| # | Ação | Fonte |
|---|---|---|
| A1 | ~~Cadastrar `NEXT_PUBLIC_MAPTILER_KEY` na Vercel em **Production e Preview**~~ — **FEITO**: conferido em 20/08 via `vercel env ls` (Production, Preview, 23d) | plano mapa 3D §Ações do PO |
| A2 | ~~**Restringir a chave MapTiler por domínio**~~ — **FEITO em 20/08**: origens `dunastech.com.br`, `*.dunastech.com.br`, `*.vercel.app`, `localhost` | idem |
| A3 | ~~Limpar a tabela `feedbacks`~~ — **FEITO em 20/08**: 18 linhas de teste removidas, backup em `supabase/backups/2026-08-20-feedbacks-teste.json` | spec ISA §Pré-voo |
| A4 | Confirmar eventos Realtime de `feedbacks` chegando na home em produção | idem |
| A5 | ~~Rodar as migrations~~ — **FEITO em 20/08** (0004, 0005 e 0006 aplicadas via MCP) | esta sessão |
| A7 | ~~**Habilitar "Anonymous sign-ins"**~~ — **FEITO em 20/08** (PO ligou no painel). Google ainda `false` se for manter login social (A8) | esta sessão |
| A8 | **Configurar o provedor Google** no Supabase Auth, se o login social for para continuar | esta sessão |
| A6 | Conferência visual do mergulho do mapa num Chrome real (critérios 2, 4, 6 da spec do mapa 3D) | spec abertura §Verificação |

### B. Dívida de produto especificada e não implementada

~~**O bloco ISA (B1–B4) é o único trabalho de código com spec + plano prontos e comprovadamente não executado.**~~ **Implementado em 20/08/2026** — ver §5. Restam abertos os itens B5–B21 abaixo.

| # | Ação | Fonte / evidência |
|---|---|---|
| B1 | ~~ISA como peso na geração de rotas~~ — **RESOLVIDO em 20/08** (`isaByDestination`, pivô 60 × 0,8) | spec+plano `2026-07-29-isa-na-geracao-de-rotas` |
| B2 | ~~Substituição de destino-assinatura com ISA < 60 + aviso em 3 idiomas~~ — **RESOLVIDO em 20/08** | idem |
| B3 | ~~Suavização do ISA por amostra (K=3)~~ — **RESOLVIDO em 20/08** | idem |
| B4 | ~~Home calcular ISA com feedbacks reais~~ — **RESOLVIDO em 20/08** (`subscribeFeedbacks` + memo `isaByDestination`) | idem |
| B5 | Suspensão de atrativo pela IGR usando `destinos.status` — **o bloqueio caiu**: agora há sessão Supabase no browser, então `auth.uid()` deixou de ser NULL e a RLS consegue autorizar a escrita | spec ISA §Próximos passos |
| B6 | Camada de IGR no modelo (`regioes_turisticas` com FK) | idem |
| B7 | Fallback do ISA sem fluxo/investimento (retorna 70 fixo → empate em massa) | idem |
| B8 | ~~Atrações somem no sync~~ — **RESOLVIDO em 20/08** (mapper + migration 0005 + reserva estática) | esta sessão |
| B9 | Catálogo intermediário (nada entre Maracajaú e Gostoso; 246 km sem parada até Mossoró) | spec alcance §Próximos passos |
| B10 | ~~Fechar a porta do `escolher(Infinity)`~~ — **RESOLVIDO em 21/08**: barreira de alcance nunca cede; déficit vira dia de permanência (destino repetido, perna 0 km); catálogo deduplicado por nome em `planRoute`. Bug da busca (assinatura furando alcance) também fechado. Os 2 `it.fails` viraram testes normais; suíte 269 verde, tsc limpo | idem — relacionado aos 2 bugs capturados com `it.fails` na revisão de 20/08 |
| B11 | Reavaliar teto de buggy (12) se o catálogo do litoral norte crescer | idem |
| B12 | Roteiros 13–15 dias: alvo encosta no catálogo e o ISA deixa de influenciar | spec ISA §Limitação |
| B13 | Papel "gestor de polo" (multi-tenancy) — registrado "para não virar surpresa de escopo" | spec pitch §6 |
| B14 | ~~Migrar auth para Supabase~~ — **RESOLVIDO em 20/08**: Firebase removido do projeto, auth sobre a tabela `usuarios` | spec pitch §10 + spec ISA |
| B15 | Remover `leaflet`/`react-leaflet` (usados só em `legacy/` e no mapa admin) | spec mapa 3D §Fora de escopo |

| B16–B21 | `DestinationMap` 2D→3D; Google 3D fase 2; refactor `TouristHomePage` (1998 linhas); fundir steps 1–2 do wizard; painel B2B; motor preditivo | specs diversas §Fora de escopo |

À lista soma-se a **dívida achada pela revisão de 20/08** e ainda não corrigida: destino da busca fura o limite de distância do transporte; dias vazios com nomes duplicados; coordenadas do seed divergem do cache OSRM (~9 km na Lagoa de Pitangui → 100% cache miss); memos com deps `[]` não recomputam pós-sync; vazamento de interval em `firebase.ts`.

~~RLS de `feedbacks` sem predicado~~ — **FEITO em 20/08**: `0008` aplicada em produção (insert anônimo → `P0001` «Avaliação exige usuário autenticado»). ~~`/api/gemini` e `/api/scraper` sem auth/rate limit~~ — **FEITO e verificado em produção em 21/08**: `POST /api/gemini` sem sessão → 401; `/api/scraper` → 405 (commit `f8967da`).

### C. Pendências de negócio (pitch passou; os itens continuam abertos)

| # | Ação | Fonte |
|---|---|---|
| C1 | **Validar preços contra custo real** ("se a margem não fechar, o número está errado") — criticidade alta | spec pitch §8 |
| C2 | ~~Confirmar status do CNPJ/LTDA~~ — **RESOLVIDO em 21/08**: **CNPJ 68.629.561/0001-98 — DUNASTECH INOVA SIMPLES (I.S.)**, ATIVA, aberta em **17/08/2026** (nat. jur. 2348, CNAE 6201-5/01; sede Rua das Andorinhas 04, Pipa, Tibau do Sul/RN). Sócios: Leonardo B. Burgomeister (adm.), Ana Camilly G. de Araujo, Antonio C. da Cruz. A contradição dos Q&As se explica: no CONETUR (30/07) ainda não existia — falta só atualizar os dois Q&As (ver D3) | spec pitch §8; Q&As |
| C3 | Validar em fonte primária: investimento em governança das IGRs; "76% do PIB"; "75% do ICMS" | spec pitch §5, §8 |
| C4 | Confirmar com a SETUR se existe CPSI aberto no RN para turismo | spec pitch §7 |
| C5 | Registrar status real das conversas com Emprotur/SETUR (placeholder nunca preenchido) | qa-tecnico.md |
| C6 | Fechar e assinar acordo de sócios (Cenário B + vesting; meta original: 13/07) | startup/02 (branch) |
| C7 | Definir cliff e gatilhos por sócio; SEBRAE; contador; CNAEs | startup/02, /06 (branch) |
| C8 | One-pager B2G / carta de intenção; follow-ups do CONETUR | spec pitch §10; startup/07 |

### D. Higiene de processo e documentação

| # | Ação | Fonte |
|---|---|---|
| D1 | **Cherry-pick dos docs das branches** (`docs/startup/`, `docs/architecture/`, `AGENTS.md`) para a `main` — sem merge das branches (destrutivo) | plano consolidado Faixa B4/D1 |
| D2 | Atualizar ou arquivar o `.gsd/` (DECISIONS/TODO/ARCHITECTURE ainda descrevem Streamlit) — pendente desde 23/07 | plano consolidado Faixa D2 |
| D3 | Marcar como superados: `roteiro-3min.md`, `qa-tecnico.md`; anotar na spec do mapa 3D que a projeção globo foi removida pela spec de 29/07 | ver §4.4–4.6 |
| D4 | Marcar os checkboxes dos 2 planos superpowers já executados (senão "feito" e "não feito" são indistinguíveis — foi o que quase escondeu o ISA) | §4.3 |
| D5 | Jira: auditar board, 1 issue = 1 dono, sincronizar plano→issues (Faixas C1–C5) | plano consolidado |
| D6 | Corrigir baselines de teste citadas nos planos (dizem 185/143; hoje são **240 testes, 17 arquivos**) | §4.12 |
| D7 | E2E Playwright / audits CWV (nice-to-have) | plano consolidado Faixa D4 |

---

## 3. Arquivar sem executar (obsoletos)

- **Todo o conteúdo aberto do `.gsd/`**: 8 itens do TODO (citam Streamlit), 9 planos do ROADMAP, REQ-01..10 (Firestore), 4 next-steps do STATE, 6 critérios da SPEC (prazo 28/06), 4 dívidas do ARCHITECTURE — tudo já entregue ou superado pelo pivô.
- **Checklists de palco** (12 itens do cartão + pendências 1/5/7 do pitch): evento de 30/07 ocorreu.
- **Vídeo de backup da demo**: descartado por decisão registrada em 29/07 — dois docs ainda o pedem.
- **"Zerar erros de lint"** (Faixa B3; "82 issues"): `eslint` hoje sai **limpo**.
- **Kickoff de 11/07 e marcos de julho** do cronograma: vencidos/realizados.

---

## 4. Contradições entre documentos (resumo)

1. **`.gsd/` × código** — DECISION-001 ("tudo em `app.py`/Streamlit") segue `Accepted`; SPEC/STACK/REQUIREMENTS dizem Firestore. Nenhum ADR registra a reversão.
2. **Protocolo declarado × usado** — `PROJECT_RULES.md` exige o ciclo GSD via `.gsd/`; o trabalho real de jul–ago usou `docs/superpowers/` e nunca escreveu no `.gsd/`.
3. **Planos sem tracking** — 92 checkboxes, zero marcados; só lendo não se distingue plano executado (mapa 3D, transportes) de não executado (ISA).
4. **Spec do mapa 3D × spec da abertura** — a de 29/07 removeu a projeção globo; a de 28/07 nunca foi anotada e reintroduziria o defeito.
5. **Três roteiros de pitch** concorrentes, resolvidos por declaração mas com aberturas divergentes.
6. **CNPJ** — `qa-tecnico.md`: "em constituição"; `qa-conetur.md`: "ativo". Um fato, duas respostas.
7. **Três tabelas de preço** diferentes (Q&A técnico / startup 01 / spec do pitch) — a do pitch é a mais recente e a única com salvaguardas.
8. **Arquitetura** — a real (`docs/architecture/`) vive só numa branch; a da `main` (`.gsd/ARCHITECTURE.md`) descreve Streamlit.
9. **Caminhos Windows de outra máquina** em 4 docs versionados.
10. **Baselines de teste desatualizadas** nos planos (185/143 vs 240 atuais).

---

## 5. O que mudou em 20/08/2026 (esta sessão)

- **Revisão profunda do sistema**: 10 achados reportados (2 já corrigidos, 8 abertos — ver painel de findings). 46 testes novos (194 → **240**).
- **Login por CPF corrigido**: sessão anônima do Firebase Auth em vez de "CPF como senha"; papel sempre `tourist` nesse fluxo. ⚠️ Requer habilitar **Anonymous** no console do Firebase quando o Firebase for configurado.
- **Mapper do Supabase corrigido**: atrações e `monitorado` preservados; destino sem coordenada fica de fora com aviso; reserva estática de atrações enquanto o banco não tiver as suas.
- **Migrations aplicadas em produção** via MCP: `0004_destinos_monitorado.sql`, `0005_seed_atracoes.sql` e `0006_auth_supabase.sql`. Verificado no banco: 23 atrações, 17 destinos monitorados, 0 sem coordenada, e as 6 consultas da home respondendo 200 na primeira tentativa.
- **Firebase removido do projeto.** Era herança do MVP do hackathon (`f2f639b`) que sobreviveu a uma migração pela metade (`639376e` levou os dados e deixou o auth). Agora: `firebase` fora do `package.json`, `src/lib/firebase.ts` → `src/lib/feedbacks.ts` (Supabase + localStorage, sem Firestore), e `AuthProvider` sobre Supabase Auth + tabela `usuarios`. A 0006 alinhou o vocabulário de papéis (`user` → `tourist`), criou o trigger que impede o cliente de se autopromover a `admin`, e adicionou a policy de delete que faltava em `feedbacks`.
- **Erro de produção corrigido:** `ENVIRONMENT_FALLBACK` — 315 ocorrências atingindo 166 usuários desde junho. O `timeZone` era declarado só no servidor e o `NextIntlClientProvider` não o recebia, então data e hora saíam no fuso da Vercel (UTC) em vez do RN.
- **Banco alinhado ao catálogo** (`0007`): 4 coordenadas divergentes (a pior, a Lagoa de Pitangui, a 9 km — a causa do cache de rotas errar 100% das chaves) e 18 de 20 investimentos em escala ~10x menor, que mantinham o ISA em 71–90 com vários destinos em "Atenção". Depois: **20 saudáveis, 0 em atenção, 0 críticos**, faixa 82–90 como a calibração pede. `fluxo` e `transporte` já batiam.
- **Guarda contra a recaída:** `npm run verificar:banco` compara o Supabase com o catálogo e sai com erro em divergência. `npm test` não pega esse tipo de defeito porque roda contra o catálogo estático — o lado que está certo.
- **Bug no diagnóstico do ranking:** a frase principal dizia "classificada como **Atenção**" com a palavra fixa no código, contradizendo os próprios contadores. Passou a derivar do mesmo helper dos selos.
- **Bloco ISA implementado (B1–B4)**, seguindo a spec de 29/07:
  - `calcularISA` ganhou suavização K=3 — uma avaliação não apaga mais o baseline (curva medida: 90 / 68 / 54 / 45, igual à da spec);
  - `planRoute` aceita `isaByDestination` (opcional, retrocompatível), pontua `(ISA − 60) × 0,8` e substitui destino-assinatura crítico devolvendo `replacements`;
  - a home assina `subscribeFeedbacks` e passou a usar ISA real — antes passava `[]` e divergia do painel do gestor;
  - aviso âmbar de substituição em pt-BR, en e es.
  - ⚠️ **Não verificado ao vivo:** a substituição só dispara com ISA < 60, o que exigiria inserir avaliações ruins na tabela `feedbacks` de produção — que o item A3 manda manter limpa. A lógica está coberta por testes e a mensagem foi renderizada nos três idiomas.

## 6. Prioridade recomendada

1. ~~**Deploy** — auth/rate-limit em `/api/gemini` e `/api/scraper`~~ — **FEITO, verificado em produção em 21/08** (401/405 sem sessão). **A1, A2, A7 e 0008 feitos**.
2. **B10 + o bug da busca** — fechar `escolher(Infinity)` e o destino buscado que fura o alcance do transporte (os dois `it.fails` do planejador).
3. **D1 + D2** — trazer os docs das branches e aposentar o `.gsd/`, para o repo voltar a ter uma única fonte de verdade.
4. **C1–C2** — preço × custo real e situação societária, que travam qualquer proposta comercial pós-CONETUR.
5. **A8** — configurar Google Auth no Supabase, se o login social for para continuar.
