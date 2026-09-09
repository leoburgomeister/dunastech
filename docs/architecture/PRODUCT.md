# DunasTech — A Ideia e o Produto

> Arquitetura do produto: visão, atores, proposta de valor, o índice ISA, features e monetização.
> Fontes: `src/app/[locale]/pitch/page.tsx`, `src/app/[locale]/layout.tsx`, `src/i18n/messages/pt-BR.json`, `src/data/mockData.ts`, `.gsd/SPEC.md`.

## 1. Visão

**DunasTech** é o **Observatório Inteligente do Turismo** do **Rio Grande do Norte (RN)**, concebido para o **Hackathon do Sol 2026** (Natal/RN).

> _"Conectando a voz do turista, dados do governo e Inteligência Artificial para planejar a sustentabilidade dos atrativos do Rio Grande do Norte."_ — `pitch/page.tsx`

A tese central: o turismo do RN é economicamente vital (no pitch: ~76% do PIB, ~75% do ICMS, ~73% dos empregos formais da região citada), mas é gerido "no escuro", com indicadores fragmentados. O DunasTech transforma **feedback cidadão + dados públicos + IA** em decisões acionáveis — não só para atrair visitantes, mas para **manter os destinos saudáveis**.

Tagline oficial: **DUNASTECH — _Observatório Inteligente do Turismo_** (`layout.tsx` metadata; `common.tagline`).
Hero do app turista: **_Roteiros com Alma Potiguar, Turismo Seguro e Sustentável_** (`planner.heading`/`subheading`).

## 2. Atores

| Ator | Segmento | O que faz na plataforma |
|------|----------|-------------------------|
| **Turista / morador** | B2C / C2C | Planeja roteiros por IA, avalia destinos ("sensor vivo"), consulta histórico de rotas, descobre negócios Cadastur. |
| **Prefeitura / gestão pública** | B2G | Observatório: ISA, saturação, feedbacks, escuta de Instagram, diagnósticos por IA, exports de relatórios. |
| **Microempreendedor** | B2B | Ganha visibilidade via **Vitrine** (negócio Cadastur), entra nos roteiros, é auditado pela qualidade cidadã. |
| **Admin / dev** | Interno | Autenticação compartilhada + alternância de painel (PanelSwitcher) entre B2C e B2G. |

## 3. Conceito central: ISA (Índice de Saúde do Atrativo)

O **ISA** é a métrica-âncora do produto — um score **0–100** da "saúde" de um destino, calculado em `calcularISA(destino, feedbacks[])` (`src/data/mockData.ts`).

- **Com feedbacks:** combina critérios ponderados (limpeza, sinalização, preservação, acessibilidade, segurança, custo-benefício, conservação), a nota geral (1–5) e uma penalidade por superlotação.
- **Sem feedbacks:** deriva de investimento público e saturação turística (proxy).
- **Faixas:** `≥ 80` Saudável · `≥ 60` Atenção · `< 60` Crítico.

O ISA é **derivado** (não persistido) e reaparece na home, no ranking, no dashboard de gestão e nos diagnósticos de IA — é o fio condutor entre B2C e B2G.

## 4. Features — B2C (o sensor)

| Feature | Rota | Descrição |
|---------|------|-----------|
| **Planejador de roteiro por IA** | `/` | Wizard de 6 passos (estilo, duração, transporte, grupo/orçamento/hospedagem, experiências) → dossiê de viagem, avaliação por destino, compartilhamento WhatsApp/PDF. |
| **Catálogo de destinos** | `/` | 20 destinos do RN com ISA, saturação e parceiros Cadastur. |
| **Detalhe do destino** | `/destino/[id]` | Herói, carga ecológica/saturação/fluxo, mapa de rota, atrações → vitrines, parceiros Cadastur, formulário de auditoria de conformidade. |
| **Ranking ISA** | `/ranking` | Leaderboard dos 20 destinos com filtros (todos/saudável/atenção/crítico) e diagnóstico expansível. |
| **Avaliação rápida** | `/avaliar` | (Requer login) escolhe destino, 1–5 estrelas, 8 toggles de critérios, conformidade sim/não, comentário → Firebase. |
| **Vitrine Cadastur** | `/vitrine/[id]` | Storefront de negócio regularizado: tipo, selo de regularização, nota, experiências, contato. |
| **Perfil** | `/perfil` | (Requer login) dados da conta + histórico de rotas (`localStorage`) + logout. |
| **Login** | `/login` | Google OAuth **ou** CPF/RNE/Passaporte + nome + e-mail. |
| **Pitch** | `/pitch` | Deck de 7 slides (economia, simuladores B2C, dashboard ISA B2G, ecossistema, Cadastur/monetização, CTA). |

## 5. Features — B2G (o observatório de gestão)

Shell: `AdminLayout` (sidebar). Todas sob `/gestao`.

| Feature | Rota | Descrição |
|---------|------|-----------|
| **Visão geral** | `/gestao` | KPIs (visitantes, receita, ISA médio, variação de transporte), gráficos ISA/transporte, alertas de ISA crítico, feedbacks recentes. |
| **Destinos** | `/gestao/destinos` | Mapa (Leaflet) de sensores ativos/inativos; saturação, fluxo, dados IBGE, transporte, ISA por card. |
| **Municípios** | `/gestao/cidades` | Gestão territorial: agregados IBGE, receita, investimento; toggle de monitoramento por destino. |
| **Cadastur** | `/gestao/cadastur` | Compliance de ~800 operadores; status de vencimento (ativo/vencendo/vencido), busca/filtro, ação de notificar. |
| **Feedbacks** | `/gestao/feedbacks` | Stream em tempo real de feedbacks cidadãos; filtros por nota e tags. |
| **Social** | `/gestao/social` | Escuta de Instagram por hashtag (via Apify); posts, likes, comentários, KPIs de sentimento. |
| **DunasIA** | `/gestao/ia` | Diagnóstico estruturado (ISA, saturação, propostas) via Gemini + assistente de chat. |
| **Relatórios** | `/gestao/relatorios` | Hub de exports (simulado): PDF de auditoria de sustentabilidade, CSV de feedbacks, XML de prestação de contas. |

## 6. Jornadas do produto

```
Turista:  Home (planejador) → Destino → Vitrine (Cadastur)
          Home / Avaliar → Feedback → Firebase → Gestão (feedbacks, ISA, IA)

Gestor:   Dashboard → Destinos / Municípios / Cadastur
          Feedbacks + Social + IA → Relatórios (export)
```

O **loop de valor**: o turista gera feedback → o feedback alimenta o ISA e o Firestore → o gestor enxerga saúde/saturação em tempo real → diagnósticos de IA e relatórios fecham o ciclo de decisão sustentável.

## 7. Diferenciais

1. **Dados acionáveis** a partir de indicadores hoje fragmentados.
2. **Turista como sensor** — avaliações rápidas + auditoria de conformidade (foto vs. realidade).
3. **ISA unificado** como linguagem comum entre cidadão e gestor.
4. **Roteiros Cadastur-first** — itinerários priorizam hotéis, guias e agências legalizados.
5. **Transparência social** — sentimento e fluxo via Instagram.
6. **DunasIA** — diagnósticos e chat para gestores.

## 8. Monetização (pitch)

- **B2G SaaS** — assinatura para municípios (o observatório).
- **B2B freemium / Ads** — listagens patrocinadas para negócios Cadastur na Vitrine e nos roteiros.

## 9. Escopo (do `.gsd/SPEC.md`, `Status: FINALIZED`)

- **In:** frontend mobile-first B2C/C2C, dashboard B2G, persistência em tempo real (Firebase), API routes seguras (`/api/scraper`, `/api/gemini`), pitch/monetização, deploy Vercel.
- **Out (Non-Goals):** Python/Streamlit, cadastro completo com senhas (login é simulado/opcional), gateway de pagamento real (apenas mockup).

> Para o mapeamento de código destas features (rotas ↔ componentes ↔ entidades), ver [`TAXONOMY.md`](./TAXONOMY.md). Para como tudo isso roda, ver [`TECH-ARCHITECTURE.md`](./TECH-ARCHITECTURE.md).
