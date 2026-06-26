---
milestone: MVP Observatório Inteligente do Turismo
version: 1.0.0
updated: 2026-06-26T23:45:00-03:00
---

# Roadmap

> **Current Phase:** 1 - Mocks & Data Architect
> **Status:** planning

## Must-Haves (from SPEC)

- [ ] Tela A: Interface Mobile B2C/C2C com seleção de destino, rotas inteligentes (filtro Cadastur), formulário de avaliação rápida e salvamento em session_state.
- [ ] Tela B: Interface B2G com st.metrics (fluxo, receita, transporte, ISA), lógica de cálculo do ISA dinâmico, gatilho do Apify Scraper e exibição de posts.
- [ ] Integração com o Google Gemini API para geração de relatórios e insights de gestão a partir do payload coletado.
- [ ] Regras de negócio de monetização expostas de forma atrativa e premium na tela/pitch.
- [ ] Tratamento de erros das APIs Apify e Gemini.

---

## Phases

### Phase 1: Mocks & Data Architect
**Status:** ⬜ Not Started
**Objective:** Criar e estruturar as bases de dados mockadas em pandas/JSON para IBGE, Cadastur, Transporte e Investimentos, integrando-as à lógica de inicialização do Streamlit.

**Plans:**
- [ ] Plan 1.1: Estruturar os datasets estáticos (IBGE, Cadastur, Transporte, Investimento) em arquivos JSON ou diretamente no carregador de dataframes do Streamlit.

---

### Phase 2: Tela A - Visão Turista & Morador (B2C/C2C)
**Status:** ⬜ Not Started
**Objective:** Desenvolver a interface B2C móvel amigável no Streamlit, contendo seleção de atrativos, filtragem de empresas formais do Cadastur e formulário de avaliação que salva o estado da praia/atrativo em `st.session_state`.
**Depends on:** Phase 1

**Plans:**
- [ ] Plan 2.1: Implementar o layout mobile-friendly simulado, selectbox de destinos, e lista de rotas de empresas regularizadas.
- [ ] Plan 2.2: Criar o formulário de avaliação com checkboxes (Limpo, Sinalizado, Preservado, Manutenção, Superlotado) e o manipulador do st.session_state para salvar avaliações.

---

### Phase 3: Tela B - Observatório de Gestão (B2G) & APIs
**Status:** ⬜ Not Started
**Objective:** Construir a interface B2G com KPIs, cálculo do ISA baseando-se nas avaliações do B2C, integração do Instagram Scraper via Apify e motor de insights com Gemini AI.
**Depends on:** Phase 2

**Plans:**
- [ ] Plan 3.1: Criar o painel B2G com as st.metrics principais e implementar a lógica matemática de cálculo do ISA dinâmico.
- [ ] Plan 3.2: Implementar o gatilho e tratamento de erros do Apify Instagram Scraper com limite de 3 resultados.
- [ ] Plan 3.3: Implementar a integração com o Google Gemini API (google-generativeai), formulando o prompt estruturado com o payload de dados e exibindo o diagnóstico gerado.

---

### Phase 4: Integração, Polimento & Pitch (Monetização)
**Status:** ⬜ Not Started
**Objective:** Integrar os menus de navegação, aplicar o design system com estética premium (Tailwind CSS injetado / Glassmorphism), exibir seções de monetização (B2B Freemium / SaaS B2G) e realizar a validação final (compilação e testes).
**Depends on:** Phase 3

**Plans:**
- [ ] Plan 4.1: Integrar as visões na sidebar, estilizar o app de acordo com as regras de UI/UX premium do projeto, e adicionar cartões de pitch/monetização.
- [ ] Plan 4.2: Validação empírica final e testes de build do Streamlit.

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ⬜ | 0/1 | — |
| 2 | ⬜ | 0/2 | — |
| 3 | ⬜ | 0/3 | — |
| 4 | ⬜ | 0/2 | — |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | — | — | — |
| 2 | — | — | — |
| 3 | — | — | — |
| 4 | — | — | — |
