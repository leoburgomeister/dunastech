# 02 — Fundação e Sociedade

> Define **quem é dono de quê**, **como se conquista participação**, **qual CNPJ abrir** e **quais parcerias** buscar.
>
> ⚠️ Este documento é um guia estratégico, **não é aconselhamento jurídico**. Antes de assinar contrato social e acordo de sócios, valide com um(a) advogado(a)/contador(a) (o SEBRAE oferece orientação gratuita).

---

## 1. Princípio fundador

A ideia e a liderança da DunasTech são de **Leonardo Barbosa Burgomeister (founder)**. Os demais participam como **sócios-membros** que **conquistam** sua participação por permanência e entrega (vesting). **Júlio não faz parte da sociedade.**

Objetivos do desenho societário:
1. Manter **controle claro** com o founder (evita paralisia decisória).
2. **Engajar e reter** o time com participação real, porém condicionada a entrega.
3. Ser **simples de acordar agora** e **robusto para escalar** (rodadas, advisors, novos sócios).

---

## 2. Modelo de equity ADOTADO — Cenário B (igualitário simples)

| Sócio | Participação | Observação |
|-------|:-----------:|------------|
| **Leonardo (founder)** | **72%** | Controle e direção estratégica |
| Antônio | 6% | Sujeito a vesting |
| Ari | 6% | Sujeito a vesting |
| Camilly | 6% | Sujeito a vesting |
| Claudia | 6% | Sujeito a vesting |
| **Reserva estratégica** | **4%** | Advisors, futuras contratações, captação |
| **Total** | **100%** | |

**Por que o Cenário B:** rápido de acordar, percebido como justo/igualitário entre os membros, mantém o controle do founder folgado (72%) e preserva uma reserva de 4% para não diluir ninguém em rodadas ou entrada de advisors.

> A "reserva estratégica" (4%) fica sob custódia do founder até ser alocada; não é distribuída automaticamente.

---

## 3. Regras de vesting (valem para todos, inclusive founder)

- **Período:** 4 anos.
- **Cliff:** 12 meses (nada vesta antes de 1 ano de dedicação; se sair antes, não leva participação). Para o contexto acelerado atual, pode-se adotar **cliff de 6 meses** para os membros — a definir no kickoff.
- **Liberação:** mensal ou trimestral após o cliff.
- **Gatilhos de desempenho (milestone-based):** parte da participação de cada membro só vesta ao atingir metas do seu papel. Exemplos:
  - Antônio: backend em produção + repositório/versionamento saudáveis.
  - Ari: 1ª carta de intenção/lead qualificado convertido.
  - Camilly: documentação e board mantidos com consistência ao longo de 2 sprints.
  - Claudia: marca + presença institucional/redes estabelecidas.
- **Bad leaver / Good leaver:** quem sai por justa causa/quebra de acordo perde participação não-vestida (bad leaver); saída de comum acordo preserva o já vestido (good leaver).
- **Recompra:** a sociedade (ou o founder) tem direito de recomprar cotas não-vestidas na saída.

---

## 4. Cenários alternativos (comparativo)

Mantidos como referência caso queira renegociar no futuro:

| Cenário | Founder | Reserva | Antônio | Ari | Camilly | Claudia | Quando usar |
|---------|:-------:|:-------:|:-------:|:---:|:-------:|:-------:|-------------|
| **B (ADOTADO)** | 72% | 4% | 6% | 6% | 6% | 6% | Simplicidade e percepção de justiça |
| A (por peso) | 70% | 5% | 8% | 7% | 5% | 5% | Premiar risco/receita |
| C (conservador) | 76% | 8% | 5% | 4% | 3,5% | 3,5% | Máximo controle + reserva p/ captação |
| D (retenção) | 66% | 5% | 9% | 8% | 6% | 6% | Máximo engajamento (controle no limite) |

---

## 5. Acordo de Sócios (o que precisa constar)

Documento a assinar **antes** de abrir o CNPJ (vale como compromisso e depois vira base do contrato social):

1. **Participação e vesting** (tabela acima + regras da seção 3).
2. **Papéis e dedicação mínima** (2h/dia; ver [`03-EQUIPE-E-GOVERNANCA.md`](03-EQUIPE-E-GOVERNANCA.md)).
3. **Poder de decisão:** matérias do dia a dia = founder/PO; matérias relevantes (novos sócios, venda, dívida) exigem quórum definido.
4. **Propriedade intelectual:** todo código, marca, dados e materiais pertencem à empresa (cláusula de cessão de PI).
5. **Confidencialidade (NDA)** e **não-competição** durante e após a participação.
6. **Saída e recompra:** good/bad leaver, valuation de referência, direito de preferência.
7. **Drag along / Tag along:** proteção em evento de venda.
8. **Resolução de conflitos:** mediação → arbitragem/foro definido. (Reunião de junho já sinalizou pesquisar métodos de resolução de conflitos societários.)
9. **Distribuição de resultados:** enquanto em tração, reinvestimento; pró-labore só quando houver caixa.

---

## 6. Modelo de CNPJ (recomendação)

**Fase atual (pré-receita / piloto):** você pode operar o desenvolvimento e o pitch **sem CNPJ**, com o acordo de sócios assinado. Abrir a empresa faz sentido a partir do momento de faturar/contratar com o governo.

**Recomendação de abertura:**

- **SLU — Sociedade Limitada Unipessoal** (só Leonardo como titular) **ou** **LTDA multi-sócios** (incluindo os membros já vestidos).
  - A **SLU** é a mais simples para manter controle e adicionar sócios depois via alteração contratual conforme o vesting for cumprido. **Recomendada como ponto de partida.**
  - A **LTDA multi-sócios** já formaliza todos, mas engessa mais cedo e exige distrato em caso de saída.
- **Regime tributário:** **Simples Nacional** (menor complexidade e carga inicial).
- **MEI não serve** para este caso: teto de faturamento baixo, não permite sócios e restringe CNAEs de tecnologia/consultoria.

**CNAEs prováveis (validar com contador):**
- 62.01-5/01 — Desenvolvimento de programas de computador sob encomenda.
- 62.04-0/00 — Consultoria em tecnologia da informação.
- 63.11-9/00 — Tratamento de dados, provedores de aplicação e hospedagem.
- 63.19-4/00 — Portais, provedores de conteúdo e serviços de informação na internet.
- 70.20-4/00 — Atividades de consultoria em gestão empresarial (para os serviços/relatórios).

**Passos para abrir (quando decidir):**
1. Definir tipo societário e CNAEs com contador.
2. Registro na Junta Comercial (contrato social).
3. CNPJ na Receita + inscrições municipal/estadual conforme atividade.
4. Enquadramento no Simples Nacional.
5. Conta PJ + emissão de nota.

---

## 7. Parcerias-alvo

| Parceiro | Valor para nós | Próximo passo |
|----------|----------------|---------------|
| **SEBRAE Turismo** | Orientação de abertura, mentoria, editais, credibilidade | Agendar atendimento; usar orientação gratuita |
| **UFRN / UERN (OPOTUR)** | Credibilidade acadêmica, dados, pesquisa, talentos | Contato com pesquisadores; carta de parceria |
| **SETUR-RN / Emprotur** | Cliente-âncora B2G, dados oficiais, validação | Reunião 30/07 (Secretaria de Turismo) |
| **Prefeituras dos polos** | Expansão B2G, casos de uso | Após piloto estadual |
| **Iniciativa privada (hotéis/agências)** | Receita B2B, prova de mercado | Após tração pública |

---

## 8. Financiamento e incentivos (mapa inicial)

- **Leis de incentivo ao turismo / cartilha parlamentar do turismo** — emendas e apoio via parlamentares.
- **FUNGETUR** — linhas de crédito para o setor de turismo.
- **Editais de inovação** (SEBRAE, FAPERN, GovTech) — captação não-diluitiva.
- **Piloto pago com o governo** — a forma mais saudável de financiar tração (receita + validação).

> Estratégia atual (decisão do founder): **não depender de aporte financeiro imediato**; crescer com trabalho, piloto pago e incentivos não-diluitivos antes de pensar em investidor-anjo.

---

## 9. Checklist de fundação (curto prazo)

- [ ] Fechar e assinar o **acordo de sócios** (Cenário B + vesting) — meta: até 13/07.
- [ ] Definir cliff (6 ou 12 meses) e gatilhos de desempenho por membro.
- [ ] Agendar orientação no **SEBRAE**.
- [ ] Escolher contador e validar tipo societário + CNAEs.
- [ ] Definir marca institucional (ver [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md), seção 7).
- [ ] Registrar decisões em ata (Camilly).
