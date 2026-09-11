# Arquivo — estado `.gsd/` da era hackathon (congelado em 2026-06-26)

> Arquivado em 2026-09-10, resolvendo [BRU-34]. Fonte: `docs/PLANOS-CONSOLIDADOS.md` §2.D
> item D2, §3, §4 (contradições 1 e 2), §6 (prioridade 3).

## O que é isto

Os 9 arquivos aqui dentro (`SPEC.md`, `ROADMAP.md`, `STATE.md`, `REQUIREMENTS.md`,
`DECISIONS.md`, `JOURNAL.md`, `ARCHITECTURE.md`, `STACK.md`, `TODO.md`) eram o estado
vivo de `.gsd/` — a metodologia GSD (*Get Shit Done*) — gerado em **26/06/2026** durante
o Hackathon do Sol e nunca mais atualizado. Eles descrevem um produto que não existe
mais:

- **Stack**: Streamlit (`app.py`, `st.session_state`) evoluindo para Next.js + **Firebase
  Firestore**. O produto atual é **Next.js 16 + Supabase** (ver
  `docs/architecture/TECH-ARCHITECTURE.md`) — o Firebase foi removido do projeto em
  20/08/2026.
- **DECISION-001** ("tudo em `app.py`/Streamlit") seguia com `Status: Accepted` sem
  nenhum ADR registrando a reversão. Foi marcada `Superseded` neste arquivo (ver
  `DECISIONS.md`) como parte deste arquivamento — é o registro da reversão que faltava.
- **TODO.md**: 8 itens (setup de mocks, view B2C em Streamlit, scraper Apify, dashboard
  B2G, etc.) — todos entregues ou superados pelo pivô para Next.js.
- **ROADMAP.md**: 9 planos, 0 marcados — a fase 1 nunca foi de fato executada via ciclo
  GSD; o trabalho real de jul–ago usou `docs/superpowers/` (specs + planos TDD) sem
  nunca escrever em `.gsd/`.
- **REQUIREMENTS.md**: REQ-01–10, todos referenciando Firestore.
- **STATE.md**: 4 "next steps" (aprovar plano Next.js, rodar `create-next-app`,
  configurar Tailwind/Firebase) — obsoletos, o app já está em produção.
- **SPEC.md**: 6 critérios com prazo 28/06/2026, vencidos.
- **ARCHITECTURE.md**: 4 dívidas técnicas do snapshot `/map` de 26/06, descrevendo
  Streamlit.
- **JOURNAL.md**: log da única sessão GSD que existiu, mantido como registro histórico.

## Por que arquivar em vez de atualizar

O ciclo GSD (`SPEC → PLAN → EXECUTE → VERIFY → COMMIT` via `.gsd/`) não é o processo em
uso neste repositório desde julho de 2026. O trabalho de produto real (specs de mapa 3D,
ISA nas rotas, alcance dos transportes, etc.) foi conduzido inteiramente via
`docs/superpowers/specs/` e `docs/superpowers/plans/`, sem nunca tocar `.gsd/`. Atualizar
estes arquivos para refletir o estado atual manteria viva uma ficção de processo que
ninguém segue. Ver `PROJECT_RULES.md` para o aviso sobre o status do ciclo GSD.

## Onde está o estado real

- **Produto/arquitetura atual**: `docs/architecture/` (`PRODUCT.md`,
  `TECH-ARCHITECTURE.md`, `TAXONOMY.md`, `HARNESS.md`).
- **Specs e planos de feature**: `docs/superpowers/specs/` e `docs/superpowers/plans/`.
- **Negócio/societário**: `docs/startup/`.

A ferramenta GSD em si (`.agent/workflows/`, `.agents/skills/`, `.gsd/templates/`,
`.gsd/examples/`) permanece no repositório e continua funcional — os workflows tratam a
ausência de `.gsd/SPEC.md` como "projeto novo" — mas está **inativa** neste projeto desde
julho de 2026.
