# 03 — Equipe e Governança

> Como a equipe se organiza, quem responde por quê, como cada um evolui (ramp-up) e como o founder gerencia, delega e acompanha.

---

## 1. Papéis (polidos)

### Leonardo — CEO / Founder & Product Owner
Estratégia, visão de negócio, posicionamento, priorização e entregas. Dono do backlog e da relação institucional (governo). **Ponto de apoio para dúvidas de todos — não muleta.** Decisão final.

### Antônio — Tech Lead (Versionamento, Git & Arquitetura de Backend)
Responsável por versionamento (Git), organização do repositório, arquitetura online do backend e integrações/APIs. Precisa de ramp-up técnico intenso (ver seção 4) para acompanhar o ritmo.

### Camilly (ADS) — Documentação, Organização & Scrum
Documentação técnica e de negócio, organização do Jira/board, atas de reunião, definição de pronto e apoio como facilitadora de Scrum. É a guardiã da rastreabilidade das decisões.

### Ari (ADS + Técnico em Gastronomia) — Desenvolvimento de Negócios / Campo
Aquisição de novos negócios de forma técnica; conhece o setor (gastronomia/turismo). Atua em campo: prospecção, relacionamento com prestadores, validação de mercado, apoio ao pitch técnico.

### Claudia — Corporate Affairs & Comunicação
Comunicação institucional, redes sociais, imagem/marca da empresa, secretariado geral e relações. Constrói a presença pública e apoia a articulação institucional.

> **Núcleo da sociedade:** Leonardo, Antônio, Ari, Camilly e Claudia.

---

## 2. Matriz RACI (por frente de trabalho)

Legenda: **R** = Responsável (executa) · **A** = Aprovador (responde final) · **C** = Consultado · **I** = Informado.

| Frente | Leonardo | Antônio | Camilly | Ari | Claudia |
|--------|:--------:|:-------:|:-------:|:---:|:-------:|
| Estratégia & Produto (backlog, prioridade) | A/R | C | C | C | I |
| Backend, Git & Arquitetura | A | R | I | I | I |
| Documentação & Organização (Jira/atas) | A | C | R | C | C |
| Desenvolvimento de negócios / Campo | A | I | I | R | C |
| Comunicação, Marca & Redes | A | I | I | C | R |
| Relação institucional / Governo | A/R | I | C | C | C |
| Sociedade & Jurídico | A/R | I | C | I | C |
| Pitch & Materiais (30/07) | A | C | C | R (técnico) | R (institucional) |

> Regra de ouro: **um A por linha**. Se todo mundo é responsável, ninguém é.

---

## 3. Governança de reuniões (cadência)

| Ritual | Frequência | Duração | Quem | Objetivo |
|--------|------------|---------|------|----------|
| **Daily standup** | Todo dia útil | 15 min | Todos | O que fiz / vou fazer / impedimentos |
| **Sprint Planning** | Início de cada sprint (semanal) | 45–60 min | Todos | Planejar entregas da semana |
| **Sprint Review + Retro** | Fim de cada sprint (marcos 15, 20, 24/07) | 45 min | Todos | Demonstrar entregas + melhorar processo |
| **Reunião de sociedade** | Kickoff (11/07) e quando necessário | — | Sócios | Decisões societárias/estratégicas |
| **Deep work** | Diário | ≥ 2h/dia | Individual | Execução real das tarefas |

**Regras de conduta (acordadas nas reuniões):**
- Tolerância de **15 min**; pontualidade é inegociável.
- **Câmera aberta** nas reuniões (etiqueta corporativa e compromisso).
- Uso obrigatório de **agenda/Google Calendar + alarmes**.
- **Dedicação mínima 2h/dia** por integrante (mais quando o marco exigir).
- Justificativas externas (chuva, energia) não resolvem entregas — buscar autonomia.
- Toda reunião gera **ata curta** (decisões + responsáveis + prazos) sob responsabilidade da Camilly.

---

## 4. Plano de Ramp-up — de TODOS (com proatividade obrigatória)

Cada membro tem uma **trilha de estudo** e deve trazer **evidência de progresso** (o que estudou, o que aplicou). Leonardo apoia dúvidas pontuais; **a iniciativa é de cada um**.

### Antônio — Tech
- Git na prática: branches, commits (convenção de [`PROJECT_RULES.md`](../../PROJECT_RULES.md)), pull requests, resolução de conflitos.
- Arquitetura de backend online: APIs REST, endpoints seguros (padrão do projeto em `/api`), variáveis de ambiente/segredos.
- Integrações do produto: Cadastur, SÍRIO, Gemini, Apify; ETL básico.
- Deploy (Vercel) e noções de banco (Firebase/Firestore).
- **Evidência:** abrir/mergear um PR, documentar a arquitetura do backend.

### Camilly — Documentação & Scrum
- Scrum na prática + uso do Jira (épicos, histórias, board, definição de pronto).
- Documentação técnica: casos de uso, diagramas simples, atas padronizadas.
- **Evidência:** board organizado + 2 atas + 1 diagrama de fluxo.

### Ari — Negócios & Campo
- Pitch técnico e venda para o setor público (GovTech): como o governo compra/pré-seleciona/MVP.
- Negociação e relacionamento; dados do setor turístico (para falar a língua do cliente).
- **Evidência:** lista de leads/parceiros mapeados + roteiro de abordagem.

### Claudia — Comunicação & Marca
- Branding e identidade visual; social media analytics; comunicação institucional.
- Fundamentos de startup (o que é, como funciona, como abrir).
- **Evidência:** proposta de identidade/marca + calendário de conteúdo inicial.

### Leonardo — Founder
- Aprofundamento em product/estratégia, modelagem de negócio e relação institucional.
- Mentoria pontual do time (ponto de apoio).

---

## 5. Como o founder gerencia (delegar, acompanhar, decidir)

1. **Delegar por RACI:** cada frente tem um responsável claro; o founder aprova, não executa tudo.
2. **Acompanhar por Jira + daily:** o board é a fonte da verdade; o daily expõe impedimentos cedo.
3. **Documentar para decidir:** decisões relevantes ficam em ata e em [`.gsd/DECISIONS.md`](../../.gsd/DECISIONS.md)/atas; nada de decisão "de boca".
4. **Cobrar entrega, não presença:** avaliação por resultado e evidência (princípio do repositório: "nunca aceitar 'deve funcionar'").
5. **Gestão de desempenho:** progresso alimenta o vesting (gatilhos por meta — ver [`02-FUNDACAO-E-SOCIEDADE.md`](02-FUNDACAO-E-SOCIEDADE.md)).

---

## 6. Indicadores de saúde da equipe

- % de tarefas concluídas por sprint (previsto x realizado).
- Comparecimento e pontualidade nas dailies.
- Impedimentos resolvidos com autonomia vs. escalados ao founder.
- Evidências de ramp-up entregues por membro.
