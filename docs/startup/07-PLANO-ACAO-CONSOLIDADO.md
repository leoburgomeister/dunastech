# 07 — Plano de Ação Consolidado (remontado)

> **Data-base:** 23/07/2026 · **Marco crítico:** Reunião Governo **30/07**  
> **Fontes:** chat [Estrutura e cronograma](https://cursor.com/agents/bc-8b58ff1e-529c-4b05-b760-410a64fbcaf8) · chat [Development environment setup](https://cursor.com/agents/bc-a0d07fab-d742-4790-9f3e-4762c5489835) · atas Gemini (29/06, 07/07, 08/07, 09/07) · pacote `docs/startup/`  
> **Bloqueio atual:** Jira e Google Drive **ainda sem leitura neste agente** (MCP Atlassian precisa autenticação no Cursor Desktop; não há MCP Google Drive configurado).

---

## 0. Status de acesso (fazer agora)

| Fonte | Status | O que falta |
|-------|--------|-------------|
| **Jira** | ⛔ MCP Atlassian `needsAuth` — auth interativa **só no Cursor Desktop** | Autenticar **Atlassian** em Settings → MCP no Cursor Desktop; depois reabrir este chat / dizer “Jira liberado” |
| **Google Drive / atas originais** | ⛔ Sem MCP Drive; uploads `.docx` do chat Estrutura **não estão mais no ambiente** | (A) Autenticar Drive se houver MCP, **ou** (B) colar link da pasta Drive, **ou** (C) subir atas em `docs/drive/atas/` |
| **GitHub / docs startup** | ✅ Branch + PR #4 | Merge opcional do PR #4 |
| **Ambiente de dev** | ✅ PR #5 (draft) | Merge opcional do PR #5 |
| **Notion** | ⛔ `needsAuth` | Só se for fonte de verdade — autentique no Desktop |

**Pedido imediato ao founder:** no Cursor Desktop, autenticar o servidor MCP **Atlassian**. Assim dá para puxar épicos/sprints/tarefas reais e rebatizar este plano com o board vivo.

---

## 1. Norte (inalterado)

| Item | Decisão |
|------|---------|
| Empresa | **DunasTech** |
| Produto | **POTI** — Plataforma de Observação do Turismo Inteligente |
| Núcleo | Leonardo · Antônio · Ari · Camilly · Claudia (**Júlio fora**) |
| Equity | **Cenário B:** Leonardo 72% · Reserva 4% · 6% cada (4) · vesting 4 anos |
| Ritmo | **2h/dia** mín. + **daily 15 min** · sprints semanais · Jira + atas |
| Objetivo 30/07 | Pitch Secretaria de Turismo → **piloto / carta de intenção** |

---

## 2. O que as atas decidiram (base de processo)

### 07/07 — Kickoff 22h
- Jira + documentação técnica obrigatórios.
- Dedicação real até 30/07; quem não engaja sai.
- Incluir Camilly (técnica/docs) e Claudia (comunicação).
- Leonardo configura Jira / 1ª sprint; Ari organiza tarefas.

### 08/07 — Kickoff 00h
- Tolerância **15 min**; Google Calendar + alarmes obrigatórios.
- Scrum; Ari + Leonardo já montando sprints no Jira.
- Backend: Ari · Camilly · Antônio alinhando.
- Pesquisar sociedade / conflitos societários.
- Onboarding Camilly no Jira + WhatsApp.

### 09/07 — Reunião 00h
- Remover **Adrian**; oficializar **Claudia**.
- Câmera aberta; **2h/dia**; estudar Jira/Scrum/startup (dever de casa).
- Kickoff presencial/remoto **sábado 14h** (formalizado como **11/07 14h** nos docs).
- Crítica: pitch não lido; lacuna de arquitetura/APIs.

### 29/06
- Ata majoritariamente de **outro produto** (licenças); só contextualiza vitória do hackathon / ISA.

**Regras vigentes (de `03-EQUIPE-E-GOVERNANCA.md`):** tolerância 15′ · câmera · Calendar · 2h/dia · toda reunião → **ata curta (Camilly)** · nada “em progresso” fora do Jira.

---

## 3. Diagnóstico em 23/07 (cronograma original vs. hoje)

Cronograma canônico: [`05-CRONOGRAMA-KICKOFF.md`](05-CRONOGRAMA-KICKOFF.md).

| Marco | Data | Esperado | Situação em 23/07 |
|-------|------|----------|-------------------|
| Kickoff único | 11/07 | Sociedade + board + backlog | Docs/RACI prontos no Git; **board Jira não lido daqui** |
| Plano de Negócio v1 + Sprint 1 Review | 15/07 | Doc v1 + personas | Validar no Jira/Drive se entregue |
| Arquitetura + Dados | 20/07 | Backend/git + fontes | Código Next.js existe; `.gsd` ainda parcialmente desatualizado |
| MVP/ISA + Marca | 22/07 | ISA real + identidade | App tem ISA/pitch; **confirmar dado real vs mock** |
| Demo + Pitch deck v1 | **24/07** | Demo + deck | **PRÓXIMO MARCO (amanhã)** |
| Ensaio + materiais | 27/07 | Deck final + one-pager | Em 4 dias |
| Dry-run | 29/07 | Ensaio + Q&A | Em 6 dias |
| **Governo** | **30/07** | Pitch → piloto | Em 7 dias |

**Leitura:** janela crítica é **24 → 30/07**. Prioridade absoluta: demo estável + deck + proposta B2G. Sociedade/CNPJ e higiene de board não podem bloquear o pitch, mas devem constar como dívida explícita.

---

## 4. Plano de ação remontado (próximos 7 dias)

### Faixa A — Pitch Governo (P0, dono: Leonardo + Ari + Claudia)

| # | Ação | Dono | Prazo | Evidência de pronto |
|---|------|------|-------|---------------------|
| A1 | Congelar **demo ponta a ponta** (turista → avaliação → gestão/ISA) | Antônio / Leonardo | **24/07** | Link deploy ou gravação 3–5 min |
| A2 | **Pitch deck v1** (problema → ISA/POTI → piloto → pedido) | Leonardo / Ari | **24/07** | Arquivo no Drive/repo + versão numerada |
| A3 | One-pager B2G + doc de decisão p/ Secretaria | Claudia / Leonardo | **27/07** | PDF 1 página + rascunho de carta de intenção |
| A4 | Ensaio cronometrado + lista de Q&A governo | Todos | **27–29/07** | Ata do ensaio + ajustes no deck |
| A5 | Dry-run final | Todos | **29/07** | Gravação ou checklist assinado |
| A6 | Reunião 30/07 + registrar follow-ups na **mesma noite** | Leonardo / Camilly | **30/07** | Ata + próximos passos no Jira |

### Faixa B — Produto & dados para a demo (P0/P1, dono: Antônio)

| # | Ação | Dono | Prazo | Evidência |
|---|------|------|-------|-----------|
| B1 | Confirmar ISA com **dado real** em ≥3–5 atrativos (ou declarar mock explícito no pitch) | Antônio | 24/07 | Print/KPI + nota no deck |
| B2 | Validar fontes Cadastur / SÍRIO / IBGE (o que entra na demo) | Antônio + time | 24/07 | Tabela “fonte → status → fallback” |
| B3 | Zerar **2 erros de lint** críticos + smoke test | Antônio | 24/07 | `npm run lint` / `npm test` verdes no fluxo demo |
| B4 | Merge ou cherry-pick do que for útil do **PR #5** (AGENTS.md, MCPs, `docs/architecture/`) | Antônio / Leonardo | 25/07 | PR merged ou arquivos na `main` |
| B5 | Env reais só se necessário p/ demo (Firebase / Gemini / Apify); senão manter mock estável | Antônio | 24/07 | Checklist env |

### Faixa C — Jira & governança (P1, dono: Camilly) — *depende de acesso*

| # | Ação | Dono | Prazo | Evidência |
|---|------|------|-------|-----------|
| C1 | **Liberar MCP Atlassian** (Desktop) e colar URL do site Jira / project key | Leonardo | **hoje** | Agente consegue `search`/`getIssue` |
| C2 | Auditar board: épicos sugeridos vs. o que existe | Camilly | 24/07 | Export ou print do board |
| C3 | Sincronizar este plano → issues (1 issue = 1 dono = critério de aceite) | Camilly | 24/07 | Links DT-xxx (ou key real) |
| C4 | Atas diárias linkadas às issues | Camilly | contínuo | Pasta Drive ou `docs/drive/atas/` |
| C5 | Checklist sociedade: acordo Cenário B, cliff 6/12, SEBRAE/contador | Leonardo | paralelo (não bloqueia 30/07) | Ata de decisão |

### Faixa D — Ambiente & harness (do chat Development) (P2)

| # | Ação | Dono | Prazo | Evidência |
|---|------|------|-------|-----------|
| D1 | Manter `docs/architecture/` como fonte técnica | Antônio | pós-30/07 ok | Docs na `main` |
| D2 | Alinhar `.gsd/` (DECISIONS / JOURNAL / TODO ainda citam Streamlit) | Antônio | pós-demo | Diff limpo |
| D3 | Rodar `/plan` Fase 1 só **depois** do pitch (não abrir frente nova agora) | Leonardo | pós-30/07 | — |
| D4 | E2E Playwright / audits CWV — nice-to-have pós-30/07 | Antônio | depois | — |

---

## 5. Épicos Jira (alvo) — a preencher com keys reais após auth

1. **Fundação & Sociedade** — acordo, cliff, CNPJ/SEBRAE  
2. **Produto & MVP** — lint, ISA, demo 24/07  
3. **Dados & Integrações** — Cadastur, SÍRIO, IBGE, Apify  
4. **Go-to-Market & Institucional** — deck, one-pager, reunião 30/07  
5. **Marca & Comunicação** — identidade POTI/DunasTech, redes  

Colunas: `Backlog → A fazer → Em progresso → Em revisão → Concluído`.

> Assim que o Jira estiver autenticado, esta seção vira tabela `Épico | Key | Sprint | Status | Dono` espelhando o board.

---

## 6. Cadência até 30/07

| Quando | O quê | Dono |
|--------|-------|------|
| Todo dia útil | Daily 15′ (fiz / farei / bloqueio) + ata | Camilly |
| 24/07 | Review Sprint: demo + deck v1 | Leonardo |
| 27/07 | Materiais institucionais | Claudia / Leonardo |
| 29/07 | Dry-run | Todos |
| 30/07 | Pitch governo | Leonardo |
| Noite 30/07 | Ata + issues de follow-up | Camilly |

---

## 7. OKRs do trimestre (Jul–Set) — checagem rápida

1. **Chegar forte em 30/07** — deck + demo + proposta B2G; sociedade (dívida se não assinada).  
2. **Produto/dados** — lint crítico zerado; fontes documentadas; ISA em atrativos-chave.  
3. **Operação** — Jira vivo + atas; evidência de 2h/dia / ramp-up.

---

## 8. Integração do chat Development (soma ao plano)

O chat de setup **não** redefine o cronograma de negócio; ele **habilita execução**:

- App Next.js 16 + React 19 validado (`lint` tooling, `test` 10/10, `dev` OK).  
- MCPs: context7, playwright, firebase, chrome-devtools (via `.cursor/mcp.json` no PR #5).  
- Pacote `docs/architecture/` + `AGENTS.md`.  
- Firebase/Gemini/Apify **sem keys** = mock intencional (bom para demo se estável).  

**Implicação:** até 30/07, usar o ambiente como está; não gastar sprint em harness novo. Merge do PR #5 é higiene, não pré-requisito do pitch — a menos que falte doc de arquitetura no laptop da demo.

---

## 9. Próximo passo deste agente (quando você liberar)

1. Você autentica **Atlassian** no Cursor Desktop.  
2. (Opcional) Manda URL do projeto Jira + pasta Drive das atas.  
3. Eu: leio board + atas → atualizo este doc com **keys reais**, burndown até 30/07 e gaps vs. marcos 15/20/22.  
4. Se quiser, gero issues faltantes (só com autorização explícita de escrita).

---

*Documento gerado em 23/07/2026. Substitui a leitura dispersa dos dois chats como **plano operacional único** até o pitch; detalhes de sociedade/visão continuam em `00`–`06`.*
