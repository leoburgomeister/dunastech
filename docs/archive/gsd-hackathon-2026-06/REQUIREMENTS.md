---
milestone: MVP Observatório Inteligente do Turismo
updated: 2026-06-26T23:57:00-03:00
---

# Requirements

## Overview

Requirements derived from SPEC.md for Next.js, Firebase and Vercel stack.

---

## Functional Requirements

| ID | Requirement | Source | Phase | Status |
|----|-------------|--------|-------|--------|
| REQ-01 | Inicialização do projeto Next.js com TypeScript e Tailwind CSS | SPEC Goal 1, 6 | 1 | Pending |
| REQ-02 | Configuração e conexão do SDK do Firebase Firestore no client-side | SPEC Goal 3 | 1 | Pending |
| REQ-03 | Interface mobile B2C com seleção de destino e listagem do Cadastur | SPEC Goal 1 | 2 | Pending |
| REQ-04 | Gravação das avaliações do formulário B2C no Firestore | SPEC Goal 3 | 2 | Pending |
| REQ-05 | Dashboard B2G com KPIs e gráficos usando dados estáticos (mocks) | SPEC Goal 2 | 3 | Pending |
| REQ-06 | Escuta em tempo real do Firestore no B2G e cálculo dinâmico do ISA | SPEC Goal 2, 3 | 3 | Pending |
| REQ-07 | Rota `/api/scraper` integrada com Apify (Instagram Scraper) | SPEC Goal 4 | 3 | Pending |
| REQ-08 | Rota `/api/gemini` integrada com API do Gemini (AI Insights) | SPEC Goal 4 | 3 | Pending |
| REQ-09 | Página/Componente com o pitch comercial de monetização (B2B/B2G) | SPEC Goal 5 | 4 | Pending |
| REQ-10 | Deploy de produção do site na Vercel com variáveis de ambiente | SPEC Goal 6 | 4 | Pending |

---

## Non-Functional Requirements

| ID | Requirement | Category | Phase | Status |
|----|-------------|----------|-------|--------|
| NFR-01 | UX Mobile-first responsiva para a visão B2C | UX | 2, 4 | Pending |
| NFR-02 | API Keys protegidas no backend (Server-side API Routes) | Security | 3 | Pending |
| NFR-03 | Sincronização em tempo real menor que 2 segundos via Firestore listeners | Performance | 3 | Pending |
| NFR-04 | Feedback visual de carregamento (skeletons/spinners) durante requisições de API | UX | 3 | Pending |

---

## Constraints

| ID | Constraint | Source | Impact |
|----|------------|--------|--------|
| CON-01 | Deploy na plataforma Vercel | Technical | Next.js otimizado para Vercel Serverless |
| CON-02 | Coleta do Apify limitada a 3 resultados por hashtag | Cost Control | Limitação no payload da API `/api/scraper` |
| CON-03 | Prazo final: Domingo 28/06 às 13h59 | Hackathon | Foco em componentes funcionais e sem refatorações redundantes |

---

## Traceability Matrix

| Requirement | Plans | Tests | Status |
|-------------|-------|-------|--------|
| REQ-01 | 1.1 | Rodar `npm run dev` e acessar localhost | Pending |
| REQ-02 | 1.2 | Verificar logs de conexão do Firebase sem erros | Pending |
| REQ-03 | 2.1 | Acessar rota B2C no celular/simulador e ver layout | Pending |
| REQ-04 | 2.2 | Submeter formulário B2C e verificar registro no Firebase Console | Pending |
| REQ-05 | 3.1 | Acessar rota B2G e visualizar gráficos e métricas mockadas | Pending |
| REQ-06 | 3.1 | Submeter no B2C e observar o ISA e KPIs do B2G mudarem em tempo real | Pending |
| REQ-07 | 3.2 | Chamar `/api/scraper` e checar JSON retornado com posts | Pending |
| REQ-08 | 3.3 | Chamar `/api/gemini` e ver resposta textual coerente da IA | Pending |
| REQ-09 | 4.1 | Visualizar seções de monetização no rodapé/dashboard | Pending |
| REQ-10 | 4.2 | Acessar URL da Vercel e testar o app em produção | Pending |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| Pending | Not yet started |
| In Progress | Being implemented |
| Complete | Implemented and verified |
| Blocked | Cannot proceed |
| Deferred | Moved to later milestone |
