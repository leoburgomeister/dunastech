# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision
Criar o **Observatório Inteligente do Turismo** (DunasTech) para o Hackathon do Sol usando uma aplicação web mobile-first. O app atuará como um guia e sensor social (B2C/C2C) para que turistas avaliem destinos do RN e vejam empresas regularizadas do Cadastur, e um painel preditivo e analítico de gestão sustentável (B2G) alimentado por IA (Gemini API) e posts do Instagram (Apify Scraper) integrados em tempo real através do Firebase.

## Goals
1. **Frontend Mobile-First B2C/C2C (O Sensor)** — Interface web altamente fluida em React (Next.js) otimizada para smartphones, com seletor de destino, exibição de rotas de empresas regularizadas e formulário de avaliação rápida.
2. **Dashboard B2G (Observatório de Gestão)** — Painel administrativo com métricas analíticas e gráficos interativos (fluxo, receita, transportes, e o ISA dinâmico) consumindo os dados em tempo real do Firebase.
3. **Persistência em Tempo Real (Firebase)** — Sincronização automática das avaliações do B2C no Firestore para alimentar instantaneamente o painel B2G.
4. **Backend Seguro (API Routes)** — Endpoints do Next.js `/api/scraper` (Apify Instagram Scraper) e `/api/gemini` (Gemini API Insights) para ocultar credenciais e chaves do lado do cliente.
5. **Pitch & Monetização** — Visualizações elegantes dos modelos de negócios (SaaS e Ads/Freemium) no próprio frontend.
6. **Deploy Contínuo** — Deploy 100% funcional na Vercel.

## Non-Goals (Out of Scope)
- Código em Python ou Streamlit.
- Cadastro completo de usuários com senhas (login simulado/opcional por perfil).
- Gateway de pagamento real (apenas mockup).

## Constraints
- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Firebase (Firestore), Vercel.
- **APIs:** Chamadas do Apify limitadas a 3 posts para economia de créditos.
- **Prazo:** Entrega até Domingo, 28/06 às 13h59.

## Success Criteria
- [ ] Deploy concluído com sucesso na Vercel.
- [ ] Chaveamento fluido de rotas/abas entre B2C (mobile) e B2G (desktop/dashboard).
- [ ] Avaliações do B2C gravadas com sucesso no Firestore.
- [ ] Dashboard B2G consumindo o Firestore e atualizando o ISA dinamicamente.
- [ ] Integração com Apify retornando mídias reais via API Route.
- [ ] Integração com Gemini retornando diagnóstico gerencial formatado.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Next.js App Router Setup | Must-have | App router, Tailwind CSS. |
| Firebase Client Integration | Must-have | Write evaluations to Firestore, listen in real-time. |
| Secure API Routes | Must-have | Server-side endpoints for Gemini and Apify. |
| Recharts / ChartJS Graphics | Must-have | Dynamic charts for the B2G dashboard. |
| Responsive Layout | Must-have | Mobile layout for B2C, grid for B2G. |

---

*Last updated: 2026-06-26*
