---
milestone: MVP Observatório Inteligente do Turismo
version: 1.0.0
updated: 2026-06-26T23:57:00-03:00
---

# Roadmap

> **Current Phase:** 1 - Next.js & Firebase Setup
> **Status:** planning

## Must-Haves (from SPEC)

- [ ] Setup do projeto Next.js com TypeScript e Tailwind CSS na raiz.
- [ ] Conexão e configuração do Firebase Firestore para gravação e escuta em tempo real.
- [ ] B2C View: Componente mobile com formulário reativo e filtro do Cadastur.
- [ ] B2G Dashboard: Componente com st.metrics equivalentes em React, gráficos dinâmicos (Recharts) e exibição de posts.
- [ ] Endpoints `/api/scraper` (Apify) e `/api/gemini` (Gemini API) operacionais.
- [ ] Deploy na Vercel configurado e testado.

---

## Phases

### Phase 1: Next.js & Firebase Setup
**Status:** ⬜ Not Started
**Objective:** Inicializar o app Next.js, configurar o Tailwind CSS, criar o projeto no Firebase Console, obter as chaves de configuração, inicializar o SDK do Firebase e carregar os mocks locais em JSON.

**Plans:**
- [ ] Plan 1.1: Rodar o bootstrap do `create-next-app` e limpar arquivos padrão desnecessários.
- [ ] Plan 1.2: Configurar a conexão do Firebase (Firestore) no projeto e criar a estrutura de dados inicial.

---

### Phase 2: Tela A - B2C Sensor & Firestore Write
**Status:** ⬜ Not Started
**Objective:** Desenvolver o layout mobile-first em React, permitindo que turistas selecionem o atrativo, visualizem rotas do Cadastur e enviem avaliações que persistem diretamente no Firestore.
**Depends on:** Phase 1

**Plans:**
- [ ] Plan 2.1: Criar a UI mobile da Tela A, com seletor de destino e listagem de empresas certificadas.
- [ ] Plan 2.2: Desenvolver o formulário de avaliação rápida e conectá-lo ao Firestore para salvar os dados em tempo real.

---

### Phase 3: Tela B - B2G Dashboard & API Routes
**Status:** ⬜ Not Started
**Objective:** Desenvolver o painel B2G com gráficos dinâmicos (Recharts), escuta em tempo real dos feedbacks do Firestore, e endpoints de backend para o scraping do Apify e insights de IA do Gemini.
**Depends on:** Phase 2

**Plans:**
- [ ] Plan 3.1: Construir a UI do dashboard B2G com KPIs, lista de feedbacks recentes e gráficos de transportes/investimentos.
- [ ] Plan 3.2: Implementar `/api/scraper` chamando a API do Apify para feeds de hashtag.
- [ ] Plan 3.3: Implementar `/api/gemini` enviando o payload do Firestore + mocks + Instagram para gerar insights pela API do Gemini.

---

### Phase 4: Integração, Polimento & Deploy na Vercel
**Status:** ⬜ Not Started
**Objective:** Implementar animações fluidas (Framer Motion), refinar o layout da barra de navegação, adicionar cards de pitch/monetização, rodar a validação de build e fazer deploy na Vercel.
**Depends on:** Phase 3

**Plans:**
- [ ] Plan 4.1: Ajustar roteamento, adicionar animações de transição e seções de pitch.
- [ ] Plan 4.2: Realizar o deploy na Vercel, configurar variáveis de ambiente e validar em produção.

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ⬜ | 0/2 | — |
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
