# ISA na geração de rotas — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o ISA participar da seleção de destinos do roteiro, substituindo destinos-assinatura em estado crítico e explicando a troca ao turista.

**Architecture:** O planner (`src/lib/route-planner.ts`) continua puro e recebe o ISA já calculado, injetado como `Record<string, number>`. O ISA entra como termo na pontuação de seleção; destinos-assinatura — que hoje entram forçados, sem passar por pontuação — ganham uma regra própria de substituição quando estão abaixo de 60. `TouristHomePage` assina os feedbacks, calcula o ISA e injeta.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, next-intl (pt-BR/en/es), Supabase Realtime.

**Spec:** `docs/superpowers/specs/2026-07-29-isa-na-geracao-de-rotas-design.md`

## Global Constraints

- Limiar de crítico: **ISA < 60**. Reusa `getISABadge` (≥80 saudável, ≥60 atenção, <60 crítico). Não inventar número novo.
- Pivô da pontuação: **60**. Peso do ISA: **0,8**. ISA ausente = 60 (efeito zero).
- Peso do prior na suavização: **K = 3**.
- O planner **não pode** importar `calcularISA`, `fluxoData` ou `investimentosData` — perderia a pureza e a testabilidade.
- `isaByDestination` é **opcional**: sem ele, o planner se comporta exatamente como hoje. Os 20 testes existentes de `route-planner.test.ts` são a rede de regressão disso.
- Toda string visível ao usuário vai nos três idiomas: `src/i18n/messages/pt-BR.json`, `en.json`, `es.json`.
- Testes rodam com `npx vitest run`. Typecheck com `npx tsc --noEmit`. Lint com `npx eslint src/`.
- Commits em português, sem acentos na mensagem, terminando com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Já concluído (commit `81c8427`)

A escala contínua do baseline do ISA (base 74, teto 95, penalidade de saturação só acima de 70) e a calibragem de investimento por destino **já foram implementadas e commitadas** antes do pitch. Este plano começa a partir daí. Não refazer.

## Estrutura de arquivos

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `src/data/mockData.ts` | `calcularISA` — suavização por amostra | Modificar |
| `src/data/mockData.test.ts` | Testes do ISA | Modificar |
| `src/lib/route-planner.ts` | Seleção, pontuação, substituição, ordenação | Modificar |
| `src/lib/route-planner.test.ts` | Testes do planner | Modificar |
| `src/components/tourist/TouristHomePage.tsx` | Assina feedbacks, injeta ISA, renderiza aviso | Modificar |
| `src/i18n/messages/{pt-BR,en,es}.json` | Chave `planner.isaReplacement` | Modificar |

---

### Task 1: Suavização do ISA por tamanho de amostra

Hoje `baseScore = feedbackBonus / feedbackCount` **substitui** o baseline inteiro. Uma única avaliação péssima leva um destino de 88 para 0. Esta task mistura baseline e feedback com peso por amostra.

**Files:**
- Modify: `src/data/mockData.ts` (função `calcularISA`)
- Test: `src/data/mockData.test.ts`

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: `calcularISA(destino: string, feedbacks: Feedback[]): number` — mesma assinatura de hoje. Passa a devolver a mistura entre baseline e feedbacks.

- [ ] **Step 1: Escrever os testes que falham**

Substituir os dois últimos testes de `src/data/mockData.test.ts` (`should calculate ISA based on positive feedback bonus...` e `should penalize the ISA score if there is overcrowding...`) por este bloco. O baseline de "Praia da Pipa" é **88** (investimento 4200 → bônus 16,8; saturação 76 → penalidade 3; 74 + 16,8 − 3 = 87,8 → 88).

```ts
  it('should blend a single positive feedback with the static baseline', () => {
    const feedbacks: Feedback[] = [
      {
        id: 'test-1',
        destino: 'Praia da Pipa',
        nota_geral: 5,
        limpo: true,
        sinalizado: true,
        preservado: true,
        acessibilidade: true,
        seguranca: true,
        custo_beneficio: true,
        conservacao: true,
        superlotado: false,
        comentario: 'Excelente!',
        timestamp: Date.now(),
      },
    ];

    // nota do feedback = (90/90)*80 + (5-3)*5 = 90
    // baseline de Pipa = 88, K = 3 => (88*3 + 90) / 4 = 88,5 => 89
    expect(calcularISA('Praia da Pipa', feedbacks)).toBe(89);
  });

  it('should not let a single bad feedback destroy the score', () => {
    const ruim: Feedback = {
      id: 'test-2',
      destino: 'Praia da Pipa',
      nota_geral: 1,
      limpo: false,
      sinalizado: false,
      preservado: false,
      acessibilidade: false,
      seguranca: false,
      custo_beneficio: false,
      conservacao: false,
      superlotado: true,
      comentario: 'Muito ruim!',
      timestamp: Date.now(),
    };

    // nota do feedback = 0*80 - 10 - 15 = -25 => limitada a 0
    // (88*3 + 0) / 4 = 66
    expect(calcularISA('Praia da Pipa', [ruim])).toBe(66);
  });

  it('should reach the critical band after two bad feedbacks', () => {
    const ruim = (id: string): Feedback => ({
      id,
      destino: 'Praia da Pipa',
      nota_geral: 1,
      limpo: false,
      sinalizado: false,
      preservado: false,
      acessibilidade: false,
      seguranca: false,
      custo_beneficio: false,
      conservacao: false,
      superlotado: true,
      timestamp: Date.now(),
    });

    // (88*3 + 0 + 0) / 5 = 52,8 => 53, abaixo de 60 (crítico)
    const score = calcularISA('Praia da Pipa', [ruim('a'), ruim('b')]);
    expect(score).toBe(53);
    expect(score).toBeLessThan(60);
  });

  it('should never exceed 100 no matter how many great feedbacks arrive', () => {
    const otimo = (id: string): Feedback => ({
      id,
      destino: 'Praia da Pipa',
      nota_geral: 5,
      limpo: true,
      sinalizado: true,
      preservado: true,
      acessibilidade: true,
      seguranca: true,
      custo_beneficio: true,
      conservacao: true,
      superlotado: false,
      timestamp: Date.now(),
    });

    const muitos = Array.from({ length: 40 }, (_, i) => otimo(`ok-${i}`));
    expect(calcularISA('Praia da Pipa', muitos)).toBeLessThanOrEqual(100);
  });

  it('should ignore feedbacks belonging to other destinations', () => {
    const outro: Feedback = {
      id: 'test-3',
      destino: 'Dunas de Genipabu',
      nota_geral: 1,
      limpo: false,
      sinalizado: false,
      preservado: false,
      acessibilidade: false,
      seguranca: false,
      custo_beneficio: false,
      conservacao: false,
      superlotado: true,
      timestamp: Date.now(),
    };

    expect(calcularISA('Praia da Pipa', [outro])).toBe(88);
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/data/mockData.test.ts`
Expected: FAIL — `expected 90 to be 89`, `expected 0 to be 66`, `expected 0 to be 53`.

- [ ] **Step 3: Extrair a nota de um feedback para uma função**

Em `src/data/mockData.ts`, adicionar **acima** de `export function calcularISA`, logo após as constantes `ISA_*` já existentes:

```ts
const ISA_PRIOR_WEIGHT = 3; // avaliações-fantasma que seguram o baseline até haver amostra

// Nota de uma avaliação isolada, na mesma escala 0–100 do ISA.
function notaDoFeedback(f: Feedback): number {
  let score = 0;
  let count = 0;

  if (f.limpo) { score += 15; count += 15; } else { count += 15; }
  if (f.sinalizado) { score += 10; count += 10; } else { count += 10; }
  if (f.preservado) { score += 15; count += 15; } else { count += 15; }
  if (f.acessibilidade) { score += 10; count += 10; } else { count += 10; }
  if (f.seguranca) { score += 15; count += 15; } else { count += 15; }
  if (f.custo_beneficio) { score += 10; count += 10; } else { count += 10; }
  if (f.conservacao) { score += 15; count += 15; } else { count += 15; }

  const starFactor = (f.nota_geral - 3) * 5;
  const overcrowdingPenalty = f.superlotado ? -15 : 0;

  return Math.max(0, Math.min(100, (score / count) * 80 + starFactor + overcrowdingPenalty));
}
```

- [ ] **Step 4: Reescrever o corpo de `calcularISA` para misturar em vez de substituir**

Substituir todo o corpo da função `calcularISA` (do `const fluxo = ...` até o `return` final) por:

```ts
  const fluxo = fluxoData.find((f) => f.destino === destino);
  const investimento = investimentosData.find((i) => i.destino === destino);
  if (!fluxo || !investimento) return 70;

  // Baseline estático: vale enquanto não há amostra, e continua ancorando o
  // indicador depois que ela aparece.
  const investmentBonus = Math.min(
    ISA_INVESTMENT_CAP,
    investimento.total_mil / ISA_INVESTMENT_DIVISOR
  );
  const saturationPenalty = Math.max(
    0,
    (fluxo.saturacao_turistica - ISA_SATURATION_FREE) * ISA_SATURATION_WEIGHT
  );
  const baseline = ISA_BASE + investmentBonus - saturationPenalty;

  // Mistura ponderada por tamanho de amostra: uma avaliação isolada move o
  // indicador sem apagá-lo, e o peso do baseline cai conforme a amostra cresce.
  const destFeedbacks = feedbacks.filter((f) => f.destino === destino);
  const somaFeedbacks = destFeedbacks.reduce((acc, f) => acc + notaDoFeedback(f), 0);
  const isa =
    (baseline * ISA_PRIOR_WEIGHT + somaFeedbacks) / (ISA_PRIOR_WEIGHT + destFeedbacks.length);

  return Math.max(0, Math.min(100, Math.round(isa)));
```

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npx vitest run`
Expected: PASS — 63 testes. Os 20 de `route-planner.test.ts` continuam verdes (não usam ISA), e os de `mockData.test.ts` que checam o baseline sem feedbacks continuam valendo, porque com `n = 0` a mistura devolve o próprio baseline.

- [ ] **Step 6: Typecheck e lint**

Run: `npx tsc --noEmit && npx eslint src/`
Expected: sem saída (sucesso).

- [ ] **Step 7: Commit**

```bash
git add src/data/mockData.ts src/data/mockData.test.ts
git commit -m "feat(isa): mistura feedback com baseline por tamanho de amostra

Uma unica avaliacao ruim derrubava o ISA de 88 para 0, porque o caminho
de feedback substituia o baseline inteiro sem amostra minima.

Passa a misturar os dois com peso K=3: o baseline ancora o indicador
enquanto a amostra e pequena e perde influencia conforme ela cresce.
Duas avaliacoes ruins levam o destino a faixa critica, tres o consolidam
la -- curva gradual em vez de degrau.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: ISA como peso na seleção do planner

**Files:**
- Modify: `src/lib/route-planner.ts`
- Test: `src/lib/route-planner.test.ts`

**Interfaces:**
- Consumes: `calcularISA` da Task 1 (indiretamente — o planner recebe números prontos, não a função).
- Produces:
  - `PlanRouteOptions.isaByDestination?: Record<string, number>`
  - constantes exportadas `ISA_PIVOT = 60` e `ISA_CRITICAL = 60`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final de `src/lib/route-planner.test.ts`:

```ts
describe('planRoute — ISA como peso', () => {
  const todosNeutros = () =>
    Object.fromEntries(destinosInfo.map((d) => [d.nome, 60])) as Record<string, number>;

  it('sem mapa de ISA, produz exatamente a rota de hoje', () => {
    const semIsa = planRoute({ ...base, days: 6 });
    const comNeutro = planRoute({ ...base, days: 6, isaByDestination: todosNeutros() });

    expect(comNeutro.destinations.map((d) => d.nome)).toEqual(
      semIsa.destinations.map((d) => d.nome)
    );
  });

  it('trata destino ausente do mapa como neutro', () => {
    const semIsa = planRoute({ ...base, days: 5 });
    const parcial = planRoute({ ...base, days: 5, isaByDestination: { 'Galinhos': 60 } });

    expect(parcial.destinations.map((d) => d.nome)).toEqual(
      semIsa.destinations.map((d) => d.nome)
    );
  });

  it('puxa para dentro do roteiro um destino com ISA alto', () => {
    const semIsa = planRoute({ ...base, days: 4 });
    const forasteiro = destinosInfo.find(
      (d) => !semIsa.destinations.some((s) => s.nome === d.nome)
    )!;

    const isa = todosNeutros();
    isa[forasteiro.nome] = 100;

    const comIsa = planRoute({ ...base, days: 4, isaByDestination: isa });
    expect(comIsa.destinations.map((d) => d.nome)).toContain(forasteiro.nome);
  });

  it('empurra para fora um destino de preenchimento com ISA baixo', () => {
    const semIsa = planRoute({ ...base, days: 4 });
    const assinatura = ['Ponta Negra e Morro do Careca', 'Dunas de Genipabu', 'Praia da Pipa'];
    // um destino que entrou por pontuação, não por ser assinatura
    const preenchimento = semIsa.destinations.find((d) => !assinatura.includes(d.nome))!;

    const isa = todosNeutros();
    isa[preenchimento.nome] = 61; // saudável o bastante para não virar substituição

    // com todos os outros em 100, o de 61 perde a vaga
    for (const d of destinosInfo) {
      if (d.nome !== preenchimento.nome && !assinatura.includes(d.nome)) isa[d.nome] = 100;
    }

    const comIsa = planRoute({ ...base, days: 4, isaByDestination: isa });
    expect(comIsa.destinations.map((d) => d.nome)).not.toContain(preenchimento.nome);
  });
});
```

- [ ] **Step 2: Rodar para confirmar que falha**

Run: `npx vitest run src/lib/route-planner.test.ts`
Expected: FAIL — TypeScript reclama que `isaByDestination` não existe em `PlanRouteOptions`.

- [ ] **Step 3: Adicionar a opção e as constantes**

Em `src/lib/route-planner.ts`, adicionar ao final da interface `PlanRouteOptions`:

```ts
  /** ISA 0–100 por nome de destino. Ausente = neutro, sem efeito na escolha. */
  isaByDestination?: Record<string, number>;
```

E junto das constantes já existentes `AFFINITY_STEP` / `MONITORED_BONUS`:

```ts
// Pivô da pontuação por ISA: o limiar de "atenção" do produto. Acima bonifica,
// abaixo penaliza, e um destino sem leitura cai exatamente aqui — efeito zero.
export const ISA_PIVOT = 60;
/** Abaixo disto o destino é considerado crítico (mesmo corte de `getISABadge`). */
export const ISA_CRITICAL = 60;
const ISA_WEIGHT = 0.8;
```

- [ ] **Step 4: Passar o mapa até a seleção e somar o termo**

Alterar a assinatura de `selectDestinations` para receber o mapa:

```ts
function selectDestinations(
  catalogue: DestinoInfo[],
  style: TravelStyle,
  transport: TransportMode,
  targetCount: number,
  anchor: DestinoInfo | null,
  isaByDestination: Record<string, number> | undefined
): DestinoInfo[] {
```

Dentro do laço guloso, substituir o cálculo de `score` por:

```ts
      const isa = isaByDestination?.[candidate.nome] ?? ISA_PIVOT;
      const isaScore = (isa - ISA_PIVOT) * ISA_WEIGHT;

      const score =
        affinityScore +
        (candidate.monitorado ? MONITORED_BONUS : 0) +
        isaScore -
        distancePenalty;
```

E em `planRoute`, passar o mapa adiante:

```ts
  const selected = selectDestinations(
    catalogue,
    style,
    transport,
    targetCount,
    anchor,
    isaByDestination
  );
```

Lembrar de desestruturar `isaByDestination` do `options` no topo de `planRoute`:

```ts
  const { catalogue, style, transport, days, anchorName, isaByDestination } = options;
```

- [ ] **Step 5: Rodar os testes**

Run: `npx vitest run src/lib/route-planner.test.ts`
Expected: PASS — 24 testes.

- [ ] **Step 6: Commit**

```bash
git add src/lib/route-planner.ts src/lib/route-planner.test.ts
git commit -m "feat(rotas): ISA como peso na selecao de destinos

O planner escolhia por afinidade de estilo, proximidade e um bonus de
monitorado. O ISA -- o diferencial declarado do produto -- nao entrava.

Adiciona isaByDestination como opcao e soma (isa - 60) * 0,8 ao score.
Pivo em 60 reusa o limiar de atencao ja usado no selo. Sem o mapa, o
planner se comporta identico ao anterior, o que mantem os 20 testes
existentes como rede de regressao.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Substituição de destino-assinatura crítico

Destinos-assinatura entram forçados **antes** de qualquer pontuação, então o peso da Task 2 não os alcança. Esta task dá ao ISA acesso a esse caminho.

**Files:**
- Modify: `src/lib/route-planner.ts`
- Test: `src/lib/route-planner.test.ts`

**Interfaces:**
- Consumes: `ISA_PIVOT`, `ISA_CRITICAL`, `isaByDestination` da Task 2.
- Produces:
  - `interface SeedReplacement { removed: string; isa: number; replacedBy: string }`
  - `PlannedRoute.replacements: SeedReplacement[]`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final de `src/lib/route-planner.test.ts`:

```ts
describe('planRoute — substituição de destino-assinatura crítico', () => {
  const neutros = () =>
    Object.fromEntries(destinosInfo.map((d) => [d.nome, 75])) as Record<string, number>;

  it('não registra substituição quando ninguém está crítico', () => {
    const plano = planRoute({ ...base, days: 5, isaByDestination: neutros() });
    expect(plano.replacements).toEqual([]);
  });

  it('tira o assinatura crítico e coloca um substituto no lugar', () => {
    const isa = neutros();
    isa['Ponta Negra e Morro do Careca'] = 38;

    const plano = planRoute({ ...base, days: 3, isaByDestination: isa });
    const nomes = plano.destinations.map((d) => d.nome);

    expect(nomes).not.toContain('Ponta Negra e Morro do Careca');
    expect(plano.replacements).toHaveLength(1);
    expect(plano.replacements[0].removed).toBe('Ponta Negra e Morro do Careca');
    expect(plano.replacements[0].isa).toBe(38);
    expect(nomes).toContain(plano.replacements[0].replacedBy);
  });

  it('escolhe um substituto saudável', () => {
    const isa = neutros();
    isa['Ponta Negra e Morro do Careca'] = 38;

    const plano = planRoute({ ...base, days: 3, isaByDestination: isa });
    const substituto = plano.replacements[0].replacedBy;

    expect(isa[substituto]).toBeGreaterThanOrEqual(60);
  });

  it('escolhe um substituto perto do destino removido', () => {
    const isa = neutros();
    isa['Ponta Negra e Morro do Careca'] = 38;

    const plano = planRoute({ ...base, days: 3, isaByDestination: isa });
    const removido = destinosInfo.find((d) => d.nome === 'Ponta Negra e Morro do Careca')!;
    const substituto = destinosInfo.find((d) => d.nome === plano.replacements[0].replacedBy)!;

    const dist = haversineKm(
      removido.latitude,
      removido.longitude,
      substituto.latitude,
      substituto.longitude
    );
    // Mossoró fica a ~250 km; um substituto sensato de Ponta Negra fica na Grande Natal
    expect(dist).toBeLessThan(60);
  });

  it('mantém o assinatura quando não há nenhum substituto saudável', () => {
    const isa = Object.fromEntries(destinosInfo.map((d) => [d.nome, 20])) as Record<string, number>;

    const plano = planRoute({ ...base, days: 3, isaByDestination: isa });

    expect(plano.destinations.map((d) => d.nome)).toContain('Ponta Negra e Morro do Careca');
    expect(plano.replacements).toEqual([]);
  });

  it('nunca substitui o ponto de partida buscado pelo usuário', () => {
    const isa = neutros();
    isa['Praia da Pipa'] = 20;

    const plano = planRoute({ ...base, days: 4, isaByDestination: isa, anchorName: 'Praia da Pipa' });

    expect(plano.destinations[0].nome).toBe('Praia da Pipa');
    expect(plano.replacements.some((r) => r.removed === 'Praia da Pipa')).toBe(false);
  });

  it('preserva as invariantes do roteiro com o ISA ligado', () => {
    const isa = neutros();
    isa['Ponta Negra e Morro do Careca'] = 30;
    isa['Praia da Pipa'] = 45;
    isa['Dunas de Genipabu'] = 55;

    for (let dias = 1; dias <= MAX_ROUTE_DAYS; dias++) {
      for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
        for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
          const plano = planRoute({
            catalogue: destinosInfo,
            style: estilo,
            transport: transporte,
            days: dias,
            isaByDestination: isa,
          });

          expect(plano.days).toHaveLength(dias);
          for (const dia of plano.days) expect(dia.destinations.length).toBeGreaterThan(0);

          const nomes = plano.destinations.map((d) => d.nome);
          expect(new Set(nomes).size).toBe(nomes.length);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Rodar para confirmar que falha**

Run: `npx vitest run src/lib/route-planner.test.ts`
Expected: FAIL — `replacements` não existe em `PlannedRoute`.

- [ ] **Step 3: Declarar o tipo do resultado da substituição**

Em `src/lib/route-planner.ts`, adicionar antes de `PlannedRoute`:

```ts
export interface SeedReplacement {
  /** Destino-assinatura que saiu do roteiro. */
  removed: string;
  /** ISA que motivou a saída. */
  isa: number;
  /** Destino que entrou no lugar. */
  replacedBy: string;
}
```

E acrescentar o campo em `PlannedRoute`:

```ts
export interface PlannedRoute {
  destinations: DestinoInfo[];
  days: PlannedDay[];
  totalKm: number;
  /** Trocas feitas por ISA crítico. Vazio quando nada foi substituído. */
  replacements: SeedReplacement[];
}
```

- [ ] **Step 4: Escrever a busca do substituto**

Adicionar em `src/lib/route-planner.ts`, acima de `selectDestinations`:

```ts
/**
 * Melhor destino saudável para ocupar a vaga de um assinatura crítico. A distância é
 * medida até o destino removido — não até o resto do grupo — para o substituto cair na
 * mesma região e a rota preservar a promessa geográfica do título.
 */
function bestHealthyNear(
  origin: DestinoInfo,
  catalogue: DestinoInfo[],
  taken: Set<string>,
  affinity: string[],
  profile: { comfortableLegKm: number; distanceWeight: number },
  isaByDestination: Record<string, number> | undefined
): DestinoInfo | null {
  let best: DestinoInfo | null = null;
  let bestScore = -Infinity;

  for (const candidate of catalogue) {
    if (taken.has(candidate.nome) || candidate.nome === origin.nome) continue;

    const isa = isaByDestination?.[candidate.nome] ?? ISA_PIVOT;
    if (isa < ISA_CRITICAL) continue;

    const affinityIndex = affinity.indexOf(candidate.nome);
    const affinityScore =
      affinityIndex === -1 ? 0 : (affinity.length - affinityIndex) * AFFINITY_STEP;

    const distancePenalty =
      profile.distanceWeight *
      (distanceBetween(origin, candidate) / profile.comfortableLegKm) *
      AFFINITY_STEP;

    const score =
      affinityScore +
      (isa - ISA_PIVOT) * ISA_WEIGHT +
      (candidate.monitorado ? MONITORED_BONUS : 0) -
      distancePenalty;

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}
```

- [ ] **Step 5: Aplicar a regra na entrada dos assinatura**

Em `selectDestinations`, trocar o tipo de retorno e o bloco que insere os seeds.

Assinatura nova:

```ts
function selectDestinations(
  catalogue: DestinoInfo[],
  style: TravelStyle,
  transport: TransportMode,
  targetCount: number,
  anchor: DestinoInfo | null,
  isaByDestination: Record<string, number> | undefined
): { selected: DestinoInfo[]; replacements: SeedReplacement[] } {
```

Logo após `const taken = new Set<string>();`, declarar:

```ts
  const replacements: SeedReplacement[] = [];
```

Substituir o bloco:

```ts
  if (anchor) take(anchor);
  for (const nome of SIGNATURE_SEEDS[style][transport]) {
    take(catalogue.find((d) => d.nome === nome));
  }
```

por:

```ts
  // A âncora é escolha explícita do turista: entra mesmo em estado crítico, e nunca
  // é substituída. O selo de ISA na tela já mostra a situação.
  if (anchor) take(anchor);

  for (const nome of SIGNATURE_SEEDS[style][transport]) {
    const seed = catalogue.find((d) => d.nome === nome);
    if (!seed || taken.has(seed.nome)) continue;

    const isa = isaByDestination?.[seed.nome] ?? ISA_PIVOT;
    if (isa >= ISA_CRITICAL) {
      take(seed);
      continue;
    }

    const substituto = bestHealthyNear(seed, catalogue, taken, affinity, profile, isaByDestination);
    if (!substituto) {
      // Catálogo inteiro em estado crítico: roteiro degradado é melhor que roteiro vazio.
      take(seed);
      continue;
    }

    replacements.push({ removed: seed.nome, isa, replacedBy: substituto.nome });
    take(substituto);
  }
```

E o `return` da função passa de `return selected;` para:

```ts
  return { selected, replacements };
```

- [ ] **Step 6: Repassar em `planRoute`**

Trocar a chamada e o retorno:

```ts
  const { selected, replacements } = selectDestinations(
    catalogue,
    style,
    transport,
    targetCount,
    anchor,
    isaByDestination
  );
  const ordered = optimizeOrder(selected, anchor?.nome);
```

E no `return` final de `planRoute`:

```ts
  return {
    destinations: ordered,
    days: plannedDays,
    totalKm: Number(routeLengthKm(ordered).toFixed(1)),
    replacements,
  };
```

O retorno antecipado do catálogo vazio também precisa do campo:

```ts
  if (totalDays === 0) {
    return { destinations: [], days: [], totalKm: 0, replacements: [] };
  }
```

- [ ] **Step 7: Rodar a suíte inteira**

Run: `npx vitest run`
Expected: PASS — 70 testes.

- [ ] **Step 8: Typecheck e lint**

Run: `npx tsc --noEmit && npx eslint src/`
Expected: sem saída.

- [ ] **Step 9: Commit**

```bash
git add src/lib/route-planner.ts src/lib/route-planner.test.ts
git commit -m "feat(rotas): substitui destino-assinatura em estado critico

Destinos-assinatura entram forcados antes de qualquer pontuacao, entao o
peso do ISA nao os alcancava: um cartao-postal degradado seguia no
roteiro de qualquer forma.

Abaixo de 60 o assinatura sai e entra o melhor destino saudavel proximo,
com a distancia medida ate o removido para o substituto cair na mesma
regiao. A troca volta em replacements para a interface explicar o motivo.

A ancora de busca nunca e substituida -- e escolha explicita do turista.
Sem nenhum substituto saudavel, o assinatura e mantido.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Home consumindo feedbacks reais

Hoje a home chama `calcularISA(d.nome, [] as Feedback[])` — array vazio literal. O gestor e o turista veem números diferentes, e nenhuma avaliação afeta roteiro.

**Files:**
- Modify: `src/components/tourist/TouristHomePage.tsx`

**Interfaces:**
- Consumes: `planRoute` com `isaByDestination` (Tasks 2 e 3), `calcularISA` (Task 1).
- Produces: `suggestedRoute.replacements: SeedReplacement[]` no state, consumido pela Task 5.

- [ ] **Step 1: Importar o que falta**

Em `src/components/tourist/TouristHomePage.tsx`, trocar:

```tsx
import { addFeedback } from '@/lib/firebase';
```

por:

```tsx
import { addFeedback, subscribeFeedbacks } from '@/lib/firebase';
```

E acrescentar `calcularISA` já vem importado; garantir que `useEffect` está na lista do React:

```tsx
import { useState, useMemo, useEffect } from 'react';
```

Adicionar `SeedReplacement` ao import de tipos do planner:

```tsx
import type { PlannedDay, TravelStyle, TransportMode, SeedReplacement } from '@/lib/route-planner';
```

- [ ] **Step 2: Assinar os feedbacks e derivar o mapa de ISA**

Adicionar logo abaixo de `const tRanking = useTranslations('ranking');`:

```tsx
  // Mesma fonte que o painel do gestor usa (Supabase Realtime, com queda para Firestore
  // e depois localStorage). Sem isso o ISA do turista ignora as avaliações reais.
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const unsub = subscribeFeedbacks(setFeedbacks);
    return () => unsub();
  }, []);

  const isaByDestination = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const d of destinosInfo) mapa[d.nome] = calcularISA(d.nome, feedbacks);
    return mapa;
  }, [feedbacks]);
```

- [ ] **Step 3: Fazer o memo `destinations` usar o ISA real**

Substituir o memo `destinations` por:

```tsx
  const destinations = useMemo(() => {
    return destinosInfo.map(d => {
      const fluxo = fluxoData.find(f => f.destino === d.nome);
      const isa = isaByDestination[d.nome] ?? 0;
      const partners = cadasturData.filter(c => c.destino === d.nome && c.regularizado);
      return { ...d, fluxo, isa, partners };
    }).sort((a, b) => b.isa - a.isa);
  }, [isaByDestination]);
```

- [ ] **Step 4: Injetar o ISA na geração e guardar as substituições**

Em `handleGenerateRoute`, acrescentar o campo na chamada:

```tsx
    const plan = planRoute({
      catalogue: destinosInfo,
      style: selectedStyle as TravelStyle,
      transport: transportKey,
      days: durationDays,
      anchorName: matchedQueryDest,
      isaByDestination,
    });
```

E incluir as substituições no objeto gerado:

```tsx
    const generated = {
      title,
      description,
      destinations: plan.destinations,
      days: routeDays,
      replacements: plan.replacements,
    };
```

- [ ] **Step 5: Estender o tipo do state**

Atualizar a declaração de `suggestedRoute`:

```tsx
  const [suggestedRoute, setSuggestedRoute] = useState<{
    title: string;
    description: string;
    destinations: typeof destinosInfo;
    days: RouteDay[];
    replacements: SeedReplacement[];
  } | null>(null);
```

- [ ] **Step 6: Typecheck, lint e testes**

Run: `npx tsc --noEmit && npx eslint src/ && npx vitest run`
Expected: sem erros; 70 testes passando.

- [ ] **Step 7: Commit**

```bash
git add src/components/tourist/TouristHomePage.tsx
git commit -m "feat(home): usa feedbacks reais no ISA e injeta no planner

A home chamava calcularISA com um array vazio literal, entao o ISA do
turista ignorava as avaliacoes e divergia do numero exibido ao gestor.

Passa a assinar a mesma fonte do painel e injeta o mapa de ISA na geracao
de rotas, fechando o ciclo: avaliacao de turista muda o indicador e
desvia o roteiro.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Aviso de substituição na interface

**Files:**
- Modify: `src/components/tourist/TouristHomePage.tsx`
- Modify: `src/i18n/messages/pt-BR.json`, `src/i18n/messages/en.json`, `src/i18n/messages/es.json`

**Interfaces:**
- Consumes: `suggestedRoute.replacements` da Task 4.
- Produces: nada — é a ponta da cadeia.

- [ ] **Step 1: Adicionar a chave em pt-BR**

Em `src/i18n/messages/pt-BR.json`, logo após a linha `"dayPlanMulti": ...`:

```json
    "isaReplacement": "{removed} ficou fora do roteiro — ISA {isa} (crítico). Sugerimos {replacedBy} no lugar.",
```

- [ ] **Step 2: Adicionar a chave em en**

Em `src/i18n/messages/en.json`, logo após a linha `"dayPlanMulti": ...`:

```json
    "isaReplacement": "{removed} was left out of this itinerary — ISA {isa} (critical). We suggest {replacedBy} instead.",
```

- [ ] **Step 3: Adicionar a chave em es**

Em `src/i18n/messages/es.json`, logo após a linha `"dayPlanMulti": ...`:

```json
    "isaReplacement": "{removed} quedó fuera del itinerario — ISA {isa} (crítico). Sugerimos {replacedBy} en su lugar.",
```

- [ ] **Step 4: Renderizar o aviso no passo 3**

Em `src/components/tourist/TouristHomePage.tsx`, no bloco `{step === 3 && (...)}`, inserir logo **depois** do parágrafo da descrição (`{suggestedRoute.description}</p>`) e **antes** da `<div>` que abre a lista de dias:

```tsx
                      {suggestedRoute.replacements.length > 0 && (
                        <div className="space-y-1.5 shrink-0">
                          {suggestedRoute.replacements.map(r => (
                            <div
                              key={r.removed}
                              className="flex items-start gap-1.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed"
                            >
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>
                                {t('isaReplacement', {
                                  removed: r.removed,
                                  isa: r.isa,
                                  replacedBy: r.replacedBy,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
```

`ShieldAlert` já está importado de `lucide-react` no topo do arquivo — usado pelo aviso de caminhada longa.

- [ ] **Step 5: Typecheck, lint e testes**

Run: `npx tsc --noEmit && npx eslint src/ && npx vitest run`
Expected: sem erros; 70 testes passando.

- [ ] **Step 6: Verificar no app rodando**

Iniciar o preview (`preview_start` com a configuração `dunastech-dev` de `.claude/launch.json`) e abrir `/pt-BR`.

Como forçar uma substituição sem depender do banco: no console da página, não há injeção direta de ISA. Verificar de duas formas:

1. **Caminho feliz (sem substituição):** gerar um roteiro de 6 dias, estilo Aventura, transporte Translado. Confirmar que aparecem 6 dias e **nenhum** aviso âmbar — porque a calibragem deixa todos os destinos entre 82 e 90.
2. **Caminho da substituição:** enviar duas avaliações ruins para "Ponta Negra e Morro do Careca" pela própria tela de avaliação do app (nota 1 estrela, nenhum critério marcado, "Superlotado" marcado). Aguardar o Realtime atualizar, clicar em "Refazer" e gerar de novo. Esperado: Ponta Negra sai do roteiro, entra um substituto da Grande Natal, e o aviso âmbar aparece acima da lista de dias com o ISA que motivou a troca.

Confirmar também que não há erro no console (`read_console_messages`) nem no servidor (`preview_logs`).

- [ ] **Step 7: Commit**

```bash
git add src/components/tourist/TouristHomePage.tsx src/i18n/messages/pt-BR.json src/i18n/messages/en.json src/i18n/messages/es.json
git commit -m "feat(rotas): explica ao turista a troca por ISA critico

Substituir um destino em silencio esconde justamente o criterio que
diferencia a plataforma. O roteiro passa a mostrar qual atrativo saiu,
com que ISA, e quem entrou no lugar.

Reusa o padrao de aviso ambar que o roteiro ja usa para trecho longo a
pe, nos tres idiomas.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Verificação final

- [ ] `npx vitest run` — 70 testes passando
- [ ] `npx tsc --noEmit` — sem saída
- [ ] `npx eslint src/` — sem saída
- [ ] Roteiro de 6 dias renderiza 6 dias
- [ ] Nenhum aviso âmbar com a calibragem atual (todos os destinos entre 82 e 90)
- [ ] Duas avaliações ruins em um destino-assinatura disparam a substituição e o aviso
- [ ] Sem erros no console do navegador e no log do servidor

## Fora deste plano

Registrados no spec, seção "Próximos passos": suspensão de atrativo pela IGR (bloqueada por não haver sessão Supabase no browser), camada de `regioes_turisticas` no schema, fallback do ISA para destinos sem fluxo/investimento, e `atracoes: []` sendo zerado no sync do Supabase.
