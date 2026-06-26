---
milestone: MVP Observatório Inteligente do Turismo
updated: 2026-06-26T23:46:00-03:00
---

# Requirements

## Overview

Requirements derived from SPEC.md for traceability and coverage tracking.

---

## Functional Requirements

| ID | Requirement | Source | Phase | Status |
|----|-------------|--------|-------|--------|
| REQ-01 | Estruturação dos dados mock de IBGE, Cadastur, Transporte e Investimentos | SPEC Goal 1, 2 | 1 | Pending |
| REQ-02 | Interface Mobile-Friendly para a visão B2C com seletor de destino | SPEC Goal 1 | 2 | Pending |
| REQ-03 | Filtragem de rotas/estabelecimentos locais baseados no Cadastur | SPEC Goal 1 | 2 | Pending |
| REQ-04 | Formulário de avaliação de saúde do atrativo salvando em st.session_state | SPEC Goal 1 | 2 | Pending |
| REQ-05 | Dashboard B2G exibindo st.metrics gerais (fluxo, receita, transportes) | SPEC Goal 2 | 3 | Pending |
| REQ-06 | Cálculo dinâmico do Índice de Saúde do Atrativo (ISA) baseado em mock e B2C | SPEC Goal 2 | 3 | Pending |
| REQ-07 | Gatilho para coletar posts do Instagram via Apify Scraper (hashtag search) | SPEC Goal 3 | 3 | Pending |
| REQ-08 | Motor de Insights com prompt para a API Gemini (diagnósticos gerenciais) | SPEC Goal 4 | 3 | Pending |
| REQ-09 | Apresentação premium das regras de negócio de monetização B2B/B2G | SPEC Goal 5 | 4 | Pending |

---

## Non-Functional Requirements

| ID | Requirement | Category | Phase | Status |
|----|-------------|----------|-------|--------|
| NFR-01 | Tempo de renderização do Streamlit fluido sem travamento | Performance | 4 | Pending |
| NFR-02 | Design responsivo para simular interface Mobile B2C no mesmo app | UX | 2, 4 | Pending |
| NFR-03 | Coleta do Apify limitada a 3 resultados por consulta | Cost Control | 3 | Pending |
| NFR-04 | Tratamento de erro robusto caso as chaves de API estejam vazias | Reliability | 3 | Pending |

---

## Constraints

| ID | Constraint | Source | Impact |
|----|------------|--------|--------|
| CON-01 | Executado inteiramente em Python + Streamlit | Technical | Todo o código frontend e backend fica em app.py |
| CON-02 | Prazo de entrega no Domingo, 28/06 às 13h59 | Hackathon | Foco na entrega funcional no prazo sem refatorações excessivas |

---

## Traceability Matrix

| Requirement | Plans | Tests | Status |
|-------------|-------|-------|--------|
| REQ-01 | 1.1 | Visualizar dataframes carregados | Pending |
| REQ-02 | 2.1 | Chavear para aba B2C e verificar layout | Pending |
| REQ-03 | 2.1 | Verificar filtro do Cadastur no selectbox | Pending |
| REQ-04 | 2.2 | Avaliar atrativo e verificar se salva no session_state | Pending |
| REQ-05 | 3.1 | Visualizar as métricas do painel B2G | Pending |
| REQ-06 | 3.1 | Verificar alteração do ISA após novos feedbacks B2C | Pending |
| REQ-07 | 3.2 | Rodar busca de hashtag e checar feed do Instagram | Pending |
| REQ-08 | 3.3 | Enviar dados ao Gemini e ler resposta de diagnóstico | Pending |
| REQ-09 | 4.1 | Verificar presença dos cards de pitch e monetização | Pending |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| Pending | Not yet started |
| In Progress | Being implemented |
| Complete | Implemented and verified |
| Blocked | Cannot proceed |
| Deferred | Moved to later milestone |
