# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision
Criar o **Observatório Inteligente do Turismo** (DunasTech) para o Hackathon do Sol: um "Sistema de Inteligência Turística Vivo" de duas frentes (B2C/C2C e B2G). O app atua como um guia e sensor social para turistas e moradores reportarem o estado dos atrativos e descobrirem empresas regularizadas, enquanto fornece um painel gerencial e preditivo alimentado por IA (Gemini) e dados reais (Apify Instagram Scraper) para a gestão pública planejar a sustentabilidade turística.

## Goals
1. **Visualizador Mobile B2C/C2C (O Sensor)** — Interface simulando dispositivo móvel onde turistas selecionam destinos do RN, visualizam rotas inteligentes (empresas formais filtradas pelo Cadastur) e enviam avaliações rápidas de conservação e limpeza para o `st.session_state`.
2. **Dashboard de Gestão B2G (Observatório de Gestão)** — Painel com st.metrics de fluxo, receita, dados de transporte e o Índice de Saúde do Atrativo (ISA) dinâmico, alimentado por dados históricos mockados e avaliações do sensor B2C.
3. **Sensor Social Real-Time (Apify Integration)** — Coleta automatizada de postagens reais do Instagram para o destino selecionado utilizando o scraper do Apify com limite econômico de 3 resultados.
4. **Motor de Insights IA (Gemini API Integration)** — Motor inteligente que cruza o estado atual do atrativo (dados B2C, transporte, investimentos e dados do Instagram) gerando diagnósticos textuais automáticos acionáveis pela prefeitura.
5. **Pitch de Negócios & Monetização** — Apresentação visível e clara das regras de negócio (modelo Freemium/Ads para B2B e SaaS recorrente para B2G) embutida na plataforma para avaliação da banca.

## Non-Goals (Out of Scope)
- Banco de dados de produção persistente (SQL/NoSQL) — dados serão mantidos em memória via `st.session_state` e mocks em JSON.
- Módulo de autenticação/login de usuários (estilo Auth0/Firebase) — simulação direta via troca de visão na sidebar.
- Processamento real de pagamentos B2B ou assinaturas de prefeitura.
- Scraping irrestrito do Instagram (máximo 3 posts por consulta).

## Constraints
- **Stack:** Desenvolvido exclusivamente em Python com Streamlit.
- **Data Source:** Dados de base (IBGE, Cadastur, ANAC/Transporte, Investimentos) pré-carregados via pandas / JSON mocks.
- **Orçamento de API:** Chamadas de scraping limitadas a 3 resultados por rodada para controle de créditos no Apify.
- **Tratamento de Erros:** Erros das APIs (Apify e Gemini) devem ser tratados com `try/except` elegantes sem quebrar o fluxo do dashboard.
- **Prazo de Entrega:** Link de produção 100% web e funcional até domingo, 28/06 às 13h59.

## Success Criteria
- [ ] Barra lateral funcional para chavear entre Tela A (B2C/C2C) e Tela B (B2G).
- [ ] Tela A permitindo selecionar destino, filtrar negócios pelo Cadastur, e registrar formulário de saúde (limpeza, sinalização, lotação, etc.) no `st.session_state`.
- [ ] Tela B exibindo KPIs estáticos de fluxo, receita e transportes baseados no mock, e calculando o ISA dinamicamente com base nas avaliações do B2C.
- [ ] Botão do Apify disparando consulta real de hashtag e exibindo feeds de forma estilizada.
- [ ] Motor Gemini recolhendo dados e gerando diagnóstico contextual preciso.
- [ ] Sem falhas de runtime (try/except nos handlers das APIs se as chaves estiverem vazias ou falharem).

## User Stories

### As a Turista / Morador (B2C)
- I want to report a destination's state (cleanliness, saturation, etc.) and see certified local businesses
- So that I can support local tourism formalization and help preserve the destination's environment.

### As a Gestor Público / Secretário de Turismo (B2G)
- I want to monitor key performance indicators, calculate the ISA score, query Instagram trends, and get AI-generated diagnoses
- So that I can make data-driven, sustainable decisions to mitigate overtourism and direct investments.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Streamlit layout & menus | Must-have | Sidebar navigation between Tela A and Tela B. |
| Cadastur filter | Must-have | Show only businesses present in mock JSON. |
| st.session_state evaluations | Must-have | Save B2C checkboxes inputs dynamically. |
| ISA Score calculation | Must-have | Formula: Weight(investments) + Weight(cleanliness evaluation) + Weight(flux/saturation). |
| Apify Instagram Scraper | Must-have | Search hashtag with limit 3, render results. |
| Gemini AI Insights | Must-have | Call `google-generativeai` with context payload and render response. |
| Robust Error Handling | Must-have | Prevent crashes when API tokens are missing or invalid (fallback to mock or warnings). |

---

*Last updated: 2026-06-26*
