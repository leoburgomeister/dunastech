# Alcance do transporte nos presets de rota — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nenhuma combinação de estilo × transporte × duração pode pedir um deslocamento que o transporte não faz num dia.

**Architecture:** Duas frentes independentes. A primeira são **limites de duração** (teto por transporte, mínimo por combinação) que moram em `routePresets.ts` e são consumidos pelo planejador, pela UI e pelo gerador de cache — não tocam em chave de cache, então entram sozinhos e com segurança. A segunda são **três trocas na tabela de presets** mais a cópia i18n correspondente, que mudam as chaves do OSRM e por isso só são commitadas depois do cache regerado e verde.

**Tech Stack:** TypeScript, Next.js 16, React 19, vitest, next-intl (pt-BR/en/es), OSRM público via script `tsx`.

**Spec:** `docs/superpowers/specs/2026-07-30-alcance-do-transporte-nos-presets-design.md`

## Global Constraints

- Branch: `leoburgo/rotas-generation-issues-a1b624`, worktree `C:/Users/Leobu/dev/DunasTech/.claude/worktrees/superpowers-brainstorming-planning-a3b295`.
- **Não alterar** `TRANSPORT_PROFILE` (`perDay`, `comfortableLegKm`, `distanceWeight`), as listas `STYLE_AFFINITY` nem coordenadas em `mockData.ts`.
- Comentário em código é em português sem acentos, como o resto do repositório. Cópia de usuário (i18n) leva acento normal.
- Comentário explica **por que**, não o que — o padrão dos arquivos tocados.
- Os três destinos substitutos já existem em `mockData.ts`: `Parque das Dunas`, `Dunas de Genipabu`, `São Miguel do Gostoso`. Nenhum destino novo entra no catálogo.
- Toda mensagem de commit termina com `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Rodar comandos a partir da raiz do worktree acima.
- **Tarefas 1-4 commitam normalmente. Tarefas 5 e 6 formam um único commit** — a Tarefa 5 deixa tudo staged e não commita; a Tarefa 6 regenera o cache e commita o conjunto. Motivo: se o `cache:rotas` falhar, nada arriscado foi commitado e o rollback é `git checkout -- .`.

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/routePresets.ts` | **Modificar.** Ganha os limites de duração. Continua sendo a fonte única que planejador, UI e cache compartilham |
| `src/lib/routePresets.test.ts` | **Criar.** Hoje a tabela só é testada de lado, por `routeCache.test.ts`. Os limites merecem teste próprio |
| `src/lib/route-planner.ts` | **Modificar.** `clampDays` passa a apertar contra os limites da combinação |
| `src/lib/route-planner.test.ts` | **Modificar.** Um teste quebra de verdade; tetos de regressão descem |
| `src/lib/map/routeCoverage.ts` | **Modificar.** Enumeração do cache respeita os mesmos limites |
| `src/components/tourist/TouristHomePage.tsx` | **Modificar.** Contador não passa dos limites do par selecionado |
| `src/i18n/messages/{pt-BR,en,es}.json` | **Modificar.** Cópia de 3 combinações |
| `public/routes/osrm-cache.json` | **Regerado** por `npm run cache:rotas` |

---

### Task 1: Limites de duração em `routePresets.ts`

**Files:**
- Modify: `src/lib/routePresets.ts`
- Test: `src/lib/routePresets.test.ts` (criar)

**Interfaces:**
- Consumes: `Transport`, `TravelStyle`, `normalizeTransport`, `normalizeStyle` — já existem no módulo.
- Produces:
  - `MAX_DIAS_POR_TRANSPORTE: Record<Transport, number>`
  - `MIN_DIAS_POR_COMBINACAO: Record<string, number>` (chave `` `${TravelStyle}/${Transport}` ``)
  - `limitesDeDuracao(style: string, transport: string): { min: number; max: number }`

- [ ] **Step 1: Write the failing test**

Criar `src/lib/routePresets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  limitesDeDuracao,
  MAX_DIAS_POR_TRANSPORTE,
  todasAsCombinacoes,
} from './routePresets';

describe('limitesDeDuracao', () => {
  it('teto de caminhada e 3 dias', () => {
    // A partir do 4o dia o roteiro a pe ja pedia 26,6 km entre paradas: o catalogo
    // tem 20 destinos e so 5 pares dentro dos 8 km que o planejador considera
    // caminhavel. Oferecer 15 dias de caminhada e o que produzia dia de 70 km.
    expect(limitesDeDuracao('adventure', 'hike').max).toBe(3);
  });

  it('teto de buggy e 12 dias e o de van e 15', () => {
    expect(limitesDeDuracao('adventure', 'buggy').max).toBe(12);
    expect(limitesDeDuracao('adventure', 'shuttle').max).toBe(15);
  });

  it('a Grande Rota Historica so existe a partir de 3 dias', () => {
    // cultura/van vai a Mossoro e ao Lajedo de proposito -- a copia os nomeia.
    // Em 1 dia isso vira 313 km; em 3, um destino por dia.
    expect(limitesDeDuracao('culture', 'shuttle').min).toBe(3);
  });

  it('as demais combinacoes comecam em 1 dia', () => {
    expect(limitesDeDuracao('culture', 'buggy').min).toBe(1);
    expect(limitesDeDuracao('family', 'hike').min).toBe(1);
  });

  it('normaliza estilo e transporte desconhecidos como o resto do modulo', () => {
    expect(limitesDeDuracao('estilo-que-nao-existe', 'trem')).toEqual(
      limitesDeDuracao('gastronomy', 'shuttle')
    );
  });

  it('todo minimo cabe no teto do proprio transporte', () => {
    for (const { style, transport } of todasAsCombinacoes()) {
      const { min, max } = limitesDeDuracao(style, transport);
      expect(min, `${style}/${transport}`).toBeLessThanOrEqual(max);
      expect(min).toBeGreaterThanOrEqual(1);
    }
  });

  it('todo transporte tem teto declarado', () => {
    expect(Object.keys(MAX_DIAS_POR_TRANSPORTE).sort()).toEqual(['buggy', 'hike', 'shuttle']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/routePresets.test.ts
```

Expected: FAIL — `limitesDeDuracao` e `MAX_DIAS_POR_TRANSPORTE` não são exportados.

- [ ] **Step 3: Write minimal implementation**

Em `src/lib/routePresets.ts`, depois de `normalizeStyle` e antes de `destinosDoRoteiro`:

```ts
/**
 * Teto do contador de duracao por transporte.
 *
 * O catalogo tem 20 destinos e so ~10 na Grande Natal. Passado o teto, o
 * preenchimento esgota o que esta perto e cai no escape `escolher(Infinity)` do
 * planejador — que ignora a barreira de distancia de proposito, para nao devolver
 * dia vazio. Dai sairam os 70 km a pe em 13 dias e os 189 km de buggy.
 *
 * Os cortes sao medidos, nao arbitrados: caminhada da 9,2 km de pior dia com teto
 * 3 e 26,6 km com teto 4; buggy da 55,6 km ate o teto 12 e 189 km no 13.
 */
export const MAX_DIAS_POR_TRANSPORTE: Record<Transport, number> = {
  hike: 3,
  buggy: 12,
  shuttle: 15,
};

/**
 * Combinacoes que so fazem sentido a partir de N dias. Chave: `${estilo}/${transporte}`.
 *
 * A "Grande Rota Historica" de van vai a Mossoro e ao Lajedo porque a descricao os
 * nomeia — ali o deslocamento longo E o roteiro. O defeito era oferece-la em 1 dia,
 * o que empilhava Forte + Mossoro + Lajedo num dia so: 313 km.
 */
export const MIN_DIAS_POR_COMBINACAO: Record<string, number> = {
  'culture/shuttle': 3,
};

/** Faixa de duracao valida para uma combinacao. Planejador, UI e cache usam esta. */
export function limitesDeDuracao(style: string, transport: string): { min: number; max: number } {
  const t = normalizeTransport(transport);
  const s = normalizeStyle(style);
  return { min: MIN_DIAS_POR_COMBINACAO[`${s}/${t}`] ?? 1, max: MAX_DIAS_POR_TRANSPORTE[t] };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/routePresets.test.ts
```

Expected: PASS, 7 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/routePresets.ts src/lib/routePresets.test.ts
git commit -F - <<'EOF'
feat(rotas): limites de duracao por transporte e por combinacao

Teto de 3 dias para caminhada, 12 para buggy, 15 para van; minimo de 3 dias
para cultura/van. Ainda nao ligados a ninguem -- as tarefas seguintes ligam
planejador, contador da home e gerador de cache nesta mesma fonte.

Vive em routePresets.ts pelo motivo ja escrito no cabecalho do modulo: tres
consumidores dependem da tabela, e duplicar faria o cache envelhecer calado.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 2: `clampDays` aperta contra os limites

**Files:**
- Modify: `src/lib/route-planner.ts` (função `clampDays`, ~linha 235; chamada em `planRoute`, ~linha 354)
- Test: `src/lib/route-planner.test.ts`

**Interfaces:**
- Consumes: `limitesDeDuracao` da Tarefa 1.
- Produces: `planRoute` passa a devolver no máximo `max` e no mínimo `min` dias da combinação. Assinatura pública de `planRoute` **não muda**.

- [ ] **Step 1: Write the failing test**

Adicionar ao `describe('planRoute — duração')` em `src/lib/route-planner.test.ts`:

```ts
  it('nao passa do teto de duracao do transporte', () => {
    // Pedir 15 dias de caminhada devolvia 15 dias, com dia de 70 km a pe.
    expect(planRoute({ ...base, transport: 'hike', days: 15 }).days).toHaveLength(3);
    expect(planRoute({ ...base, transport: 'buggy', days: 15 }).days).toHaveLength(12);
    expect(planRoute({ ...base, transport: 'shuttle', days: 15 }).days).toHaveLength(15);
  });

  it('sobe a duracao ate o minimo da combinacao', () => {
    // cultura/van em 1 dia empilhava Forte + Mossoro + Lajedo: 313 km.
    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 1,
    });
    expect(plano.days).toHaveLength(3);
    expect(plano.days.every((d) => d.destinations.length > 0)).toBe(true);
  });
```

E **corrigir o teste que quebra**, `'nunca devolve um dia sem destino'`, que hoje varre `1..MAX_ROUTE_DAYS` para os três transportes e exige `days.length === dias`. Substituir o corpo por:

```ts
  it('nunca devolve um dia sem destino', () => {
    for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
      for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
        const { min, max } = limitesDeDuracao(estilo, transporte);
        for (let dias = min; dias <= max; dias++) {
          const plano = planRoute({ catalogue: destinosInfo, style: estilo, transport: transporte, days: dias });
          expect(plano.days, `${estilo}/${transporte}/${dias}d`).toHaveLength(dias);
          for (const dia of plano.days) {
            expect(dia.destinations.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });
```

E ajustar `'não empilha destinos no mesmo dia quando o passeio é a pé'`, que pede 5 dias de caminhada e agora recebe 3 — passava por acidente:

```ts
  it('não empilha destinos no mesmo dia quando o passeio é a pé', () => {
    const aPe = planRoute({ ...base, transport: 'hike', days: 3 });
    for (const dia of aPe.days) {
      expect(dia.destinations).toHaveLength(1);
    }
  });
```

Acrescentar ao topo do arquivo, junto do import de `destinosDoRoteiro`:

```ts
import { destinosDoRoteiro, limitesDeDuracao } from './routePresets';
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/route-planner.test.ts
```

Expected: FAIL — `nao passa do teto` recebe 15 dias de caminhada em vez de 3; `sobe a duracao ate o minimo` recebe 1 em vez de 3.

- [ ] **Step 3: Write minimal implementation**

Em `src/lib/route-planner.ts`, trocar a importação:

```ts
import { destinosDoRoteiro, limitesDeDuracao } from './routePresets';
```

Substituir `clampDays` inteira:

```ts
/**
 * Aperta a duracao pedida contra tres tetos: o do transporte, o global e o tamanho
 * do catalogo. `piso` desce junto com o teto porque catalogo pequeno (ou teto baixo)
 * nao pode ser vencido pelo minimo da combinacao — o roteiro precisa de pelo menos
 * um destino por dia.
 */
function clampDays(
  requested: number,
  catalogueSize: number,
  style: TravelStyle,
  transport: TransportMode
): number {
  if (catalogueSize === 0) return 0;
  const { min, max } = limitesDeDuracao(style, transport);
  const teto = Math.min(max, MAX_ROUTE_DAYS, catalogueSize);
  const piso = Math.min(min, teto);
  if (!Number.isFinite(requested)) return piso;
  return Math.max(piso, Math.min(Math.round(requested), teto));
}
```

E, em `planRoute`, a chamada:

```ts
  const totalDays = clampDays(days, catalogue.length, style, transport);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/route-planner.test.ts
```

Expected: PASS. Três testes vizinhos continuam verdes sem alteração, e vale saber por quê antes de suspeitar deles:

- `'limita durações inválidas ou maiores que o catálogo'` e `'entrega exatamente a quantidade de dias pedida'` usam `adventure/shuttle`, cuja faixa é 1 a 15 — nada muda para eles.
- `'mantém as pernas curtas quando o passeio é a pé'` pede 4 dias a pé e agora recebe 3, mas segue comparando contra 4 dias de van: a caminhada fica com 3 destinos coesos e a van com 6, então a desigualdade continua valendo com folga.

- [ ] **Step 5: Commit**

```bash
git add src/lib/route-planner.ts src/lib/route-planner.test.ts
git commit -F - <<'EOF'
fix(rotas): duracao respeita o teto do transporte e o minimo da combinacao

planRoute honrava qualquer duracao de 1 a 15 para qualquer transporte, e era
dai que saiam os dias impossiveis das pontas: 15 dias de caminhada davam um dia
de 70 km a pe, e cultura/van em 1 dia empilhava Forte + Mossoro + Lajedo em
313 km.

O teste "nunca devolve um dia sem destino" varria 1..15 para os tres
transportes e exigia days.length === dias; agora varre a faixa valida de cada
combinacao. O teste do passeio a pe pedia 5 dias e recebia 3 -- passava por
acidente, agora pede 3.

A assinatura publica de planRoute nao muda.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Contador da home respeita os limites

**Files:**
- Modify: `src/components/tourist/TouristHomePage.tsx` (import linha 3 e 24-25; botões linhas 481 e 495)

**Interfaces:**
- Consumes: `limitesDeDuracao` da Tarefa 1.
- Produces: nada que outra tarefa use.

Sem teste automatizado: o repositório não tem testes de componente React, e introduzir a infraestrutura de render agora não cabe nas horas até o pitch. A verificação é manual, no Step 4. `planRoute` já é o contrato apertado pela Tarefa 2 — a UI aqui é conveniência, para o contador não exibir um número que o roteiro não vai entregar.

- [ ] **Step 1: Importar `useEffect` e `limitesDeDuracao`**

Linha 3, acrescentar `useEffect`:

```ts
import { useState, useMemo, useEffect } from 'react';
```

Linha 24, acrescentar `limitesDeDuracao`:

```ts
import { normalizeStyle, normalizeTransport, limitesDeDuracao } from '@/lib/routePresets';
```

- [ ] **Step 2: Derivar os limites e reapertar a duração ao trocar de combinação**

Logo depois da declaração `const [selectedTransport, setSelectedTransport] = useState('buggy');` (linha 76):

```tsx
  const limitesDuracao = limitesDeDuracao(selectedStyle, selectedTransport);

  // Trocar de estilo ou transporte pode deixar a duracao fora da faixa da nova
  // combinacao: "10 dias" e depois caminhada exibia 10 no contador enquanto o
  // roteiro entregava 3. O contador tem que dizer a verdade que planRoute aperta.
  useEffect(() => {
    setDurationDays((prev) => Math.min(Math.max(prev, limitesDuracao.min), limitesDuracao.max));
  }, [limitesDuracao.min, limitesDuracao.max]);
```

- [ ] **Step 3: Trocar os limites fixos dos botões**

Linha 481:

```tsx
                            onClick={() => setDurationDays(prev => Math.max(limitesDuracao.min, prev - 1))}
```

Linha 495:

```tsx
                            onClick={() => setDurationDays(prev => Math.min(limitesDuracao.max, prev + 1))}
```

`MAX_ROUTE_DAYS` era usado **só** na linha 495, então agora fica órfão. Remover da importação da linha 25, senão o lint acusa import não usado:

```ts
import { planRoute, haversineKm } from '@/lib/route-planner';
```

- [ ] **Step 4: Verificar no navegador**

```bash
npm run lint
```

Expected: sem erro.

Subir a home pelo preview e conferir, no painel de geração de rotas:
1. Selecionar **caminhada** — o `+` para de subir em 3.
2. Selecionar **cultura + van** — o `−` para de descer em 3.
3. Pôr 10 dias com van e trocar para caminhada — o contador cai sozinho para 3, não fica exibindo 10.

- [ ] **Step 5: Commit**

```bash
git add src/components/tourist/TouristHomePage.tsx
git commit -F - <<'EOF'
fix(home): contador de duracao respeita a faixa da combinacao escolhida

O contador ia de 1 a 15 para qualquer combinacao, entao dava para pedir 15 dias
de caminhada. Depois da tarefa anterior planRoute aperta a duracao, e sem esta
mudanca o contador exibiria 15 enquanto o roteiro entregava 3 -- um contador que
mente e pior que um contador limitado.

O efeito reaperta ao trocar de estilo ou transporte, senao "10 dias" seguido de
caminhada deixava o numero velho na tela.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Gerador de cache enumera só a faixa alcançável

**Files:**
- Modify: `src/lib/map/routeCoverage.ts` (função `trechosNecessarios`)

**Interfaces:**
- Consumes: `limitesDeDuracao` da Tarefa 1.
- Produces: `trechosNecessarios()` devolve um **subconjunto** do que devolvia antes. Nenhuma chave nova.

- [ ] **Step 1: Ajustar o laço**

Em `src/lib/map/routeCoverage.ts`, importar:

```ts
import { TRAVEL_STYLES, TRANSPORTS, limitesDeDuracao } from '../routePresets';
```

E trocar o laço de duração dentro de `trechosNecessarios`:

```ts
  for (const style of TRAVEL_STYLES) {
    for (const transport of TRANSPORTS) {
      // Duracao fora da faixa da combinacao e inalcancavel pela home: planRoute
      // apertaria para dentro dela e devolveria um plano que ja foi enumerado.
      // Enumerar assim mesmo so engordaria o asset com geometria orfa.
      const { min, max } = limitesDeDuracao(style, transport);
      const teto = Math.min(max, MAX_CACHED_DAYS);

      for (let days = min; days <= teto; days++) {
```

O resto do corpo do laço fica igual.

- [ ] **Step 2: Rodar a suíte inteira**

```bash
npm test
```

Expected: PASS, inclusive `routeCache.test.ts`. Nenhuma chave nova é pedida — o conjunto só encolheu, e o cache gravado já cobre o que sobrou. É por isso que esta tarefa não precisa de `cache:rotas`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/map/routeCoverage.ts
git commit -F - <<'EOF'
refactor(mapa): cache enumera so as duracoes que a home alcanca

trechosNecessarios varria 1..7 dias para toda combinacao. Com o teto por
transporte, caminhada de 4 a 7 dias vira um plano de 3 dias que ja foi
enumerado, e cultura/van de 1 a 2 nao existe mais. Enumerar assim mesmo so
gravaria geometria orfa.

O conjunto so encolheu, entao o cache atual continua cobrindo tudo e o teste de
cobertura passa sem regerar nada.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Trocas de preset, cópia i18n e tetos de regressão

**Files:**
- Modify: `src/lib/routePresets.ts` (tabela `ROTEIROS`)
- Modify: `src/lib/route-planner.test.ts` (tetos do teste `'nenhum dia da faixa demonstrável piora o que a assinatura já pedia'`)
- Modify: `src/i18n/messages/pt-BR.json`, `src/i18n/messages/en.json`, `src/i18n/messages/es.json`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: chaves de cache novas para `family/hike`, `ecotourism/hike` e `ecotourism/buggy`, consumidas pela Tarefa 6.

> **Esta tarefa NÃO commita.** Deixa tudo staged; a Tarefa 6 commita o conjunto junto do cache regerado.

- [ ] **Step 1: Baixar os tetos de regressão (o teste falha primeiro)**

Em `src/lib/route-planner.test.ts`, no teste `'nenhum dia da faixa demonstrável piora o que a assinatura já pedia'`, substituir o bloco de comentário e a constante `teto`:

```ts
    // Teto por transporte na faixa que o cache do OSRM cobre (MAX_CACHED_DAYS = 7), que e
    // a faixa que a apresentacao usa.
    //
    // Nao e teto de conforto, e trava de regressao. Os 246,2 km que sobram sao o trecho
    // Forte -> Mossoro da assinatura de cultura/van: um dia de transfer, prometido pela
    // propria copia da "Grande Rota Historica". Baixar mais que isso exige mexer na
    // tabela de presets (e regerar o cache do OSRM), nao no planejador.
    const teto: Record<'hike' | 'buggy' | 'shuttle', number> = {
      hike: 9.2,
      buggy: 55.6,
      shuttle: 246.2,
    };
```

- [ ] **Step 2: Rodar para ver falhar**

```bash
npx vitest run src/lib/route-planner.test.ts -t "nenhum dia da faixa"
```

Expected: FAIL, com mensagens nomeando os dias que ainda estouram — `family/hike` em 39,7 km, `ecotourism/hike` em 27,6 km e `ecotourism/buggy` em 112,6 km.

- [ ] **Step 3: Trocar os três presets**

Em `src/lib/routePresets.ts`, dentro de `ROTEIROS`:

```ts
  ecotourism: {
    hike: ['Lagoa de Pitangui', 'Dunas de Genipabu'],
    buggy: ['Parrachos de Maracajaú', 'São Miguel do Gostoso'],
    shuttle: ['Lagoa de Pitangui', 'Parrachos de Maracajaú', 'Galinhos'],
  },
  family: {
    hike: ['Ponta Negra e Morro do Careca', 'Parque das Dunas'],
    buggy: ['Forte dos Reis Magos', 'Dunas de Genipabu'],
    shuttle: ['Ponta Negra e Morro do Careca', 'Forte dos Reis Magos', 'Praia da Pipa'],
  },
```

Acrescentar, logo acima de `const ROTEIROS: Tabela = {`:

```ts
// Trecho de preset e o unico caminho por onde ainda entrava dia impossivel: a
// assinatura nao passa pela barreira de distancia, de proposito. Tres pediam o que o
// transporte nao faz num dia -- Ponta Negra -> Pipa a pe (39,7 km), Pitangui ->
// Maracajau a pe (27,6 km) e Maracajau -> Galinhos de buggy (112,6 km). Os
// substitutos ficam em 6,8 / 7,8 / 48,5 km.
//
// ecoturismo/caminhada repete a dupla de aventura/caminhada: dentro dos 8 km que o
// planejador considera caminhavel o catalogo so tem 5 pares, e todos ja estao em uso.
// Ja era padrao aceito -- relax/caminhada e gastronomia/caminhada sao ambos Pipa +
// Madeiro, diferenciados so pela copia.
```

- [ ] **Step 4: Rodar o teste do planejador**

```bash
npx vitest run src/lib/route-planner.test.ts
```

Expected: PASS. `routeCache.test.ts` ainda vai falhar — é o esperado, e a Tarefa 6 resolve.

- [ ] **Step 5: Atualizar a cópia em pt-BR**

Em `src/i18n/messages/pt-BR.json`, sob `planner.routes`:

```json
    "ecotourism": {
      "hike": {
        "title": "Trilha Ecológica das Lagoas & Dunas",
        "description": "Caminhada explorando a Lagoa de Pitangui e as dunas móveis de Genipabu."
      },
      "buggy": {
        "title": "Rota de Buggy Sustentável Litoral Norte",
        "description": "Passeio de buggy conectando os Parrachos de Maracajaú à vila de pescadores de São Miguel do Gostoso."
      }
    },
    "family": {
      "hike": {
        "title": "Caminhada em Família Ponta Negra & Parque das Dunas",
        "description": "Passeio tranquilo pela orla de Ponta Negra e pelas trilhas sombreadas do Parque das Dunas, ideal para crianças."
      }
    }
```

Manter as demais chaves de `ecotourism` e `family` como estão — o trecho acima mostra só o que muda.

- [ ] **Step 6: Atualizar a cópia em en**

Em `src/i18n/messages/en.json`:

```json
    "ecotourism": {
      "hike": {
        "title": "Lagoons & Dunes Ecological Trail",
        "description": "A hike exploring Pitangui Lagoon and the shifting dunes of Genipabu."
      },
      "buggy": {
        "title": "Sustainable North Coast Buggy Route",
        "description": "Buggy tour connecting the Maracajaú reef pools to the fishing village of São Miguel do Gostoso."
      }
    },
    "family": {
      "hike": {
        "title": "Family Walk: Ponta Negra & Parque das Dunas",
        "description": "A relaxed stroll along Ponta Negra's waterfront and the shaded trails of Parque das Dunas, great for kids."
      }
    }
```

- [ ] **Step 7: Atualizar a cópia em es**

Em `src/i18n/messages/es.json`:

```json
    "ecotourism": {
      "hike": {
        "title": "Sendero Ecológico: Lagunas y Dunas",
        "description": "Caminata explorando la Laguna de Pitangui y las dunas móviles de Genipabu."
      },
      "buggy": {
        "title": "Ruta de Buggy Sostenible Litoral Norte",
        "description": "Paseo en buggy conectando los arrecifes de Maracajaú con el pueblo pesquero de São Miguel do Gostoso."
      }
    },
    "family": {
      "hike": {
        "title": "Paseo Familiar: Ponta Negra y Parque das Dunas",
        "description": "Un paseo tranquilo por el paseo marítimo de Ponta Negra y los senderos sombreados del Parque das Dunas, ideal para niños."
      }
    }
```

- [ ] **Step 8: Conferir que nenhuma cópia nomeia destino que saiu**

```bash
git diff src/i18n/messages/ | grep -E "^\+" | grep -iE "pipa|parrachos|galinhos|maracaj"
```

Expected: só a linha de `ecotourism.buggy`, que legitimamente mantém "Parrachos de Maracajaú" (o destino continua na combinação). Nenhuma linha nova pode citar Pipa em `family.hike` nem Galinhos em `ecotourism.buggy`.

- [ ] **Step 9: Deixar staged, sem commitar**

```bash
git add src/lib/routePresets.ts src/lib/route-planner.test.ts src/i18n/messages/
git status --short
```

Expected: os 5 arquivos em staged. **Não commitar** — a Tarefa 6 fecha o commit com o cache.

---

### Task 6: Regenerar o cache do OSRM e fechar o commit

**Files:**
- Modify: `public/routes/osrm-cache.json` (gerado)

**Interfaces:**
- Consumes: a tabela alterada na Tarefa 5 e a enumeração encolhida na Tarefa 4.
- Produces: nada.

- [ ] **Step 1: Confirmar que o teste de cobertura falha antes**

```bash
npx vitest run src/lib/map/routeCache.test.ts
```

Expected: FAIL em `'TODA combinacao de estilo x transporte tem rota gravada'`, nomeando `family/hike`, `ecotourism/hike` e `ecotourism/buggy`. É a trava funcionando: a tabela mudou e o cache está velho.

- [ ] **Step 2: Regenerar**

```bash
npm run cache:rotas
```

Precisa de internet. ~3 min, rate limit de 1,2 s por rota. A saída informa quantas geometrias entraram, quantas órfãs saíram e quantas falharam.

**Se o comando falhar ou reportar falhas > 0:** parar e reverter tudo o que a Tarefa 5 deixou staged, sem commitar nada:

```bash
git checkout -- src/lib/routePresets.ts src/lib/route-planner.test.ts src/i18n/messages/ public/routes/osrm-cache.json
```

As Tarefas 1-4 continuam commitadas e válidas — elas não dependem desta.

- [ ] **Step 3: Rodar a suíte inteira**

```bash
npm test
```

Expected: PASS, incluindo a cobertura do cache.

- [ ] **Step 4: Lint e build**

```bash
npm run lint && npm run build
```

Expected: ambos verdes.

- [ ] **Step 5: Verificar na home**

Subir a home pelo preview e conferir:
1. **família + caminhada** — o roteiro mostra Parque das Dunas, não Praia da Pipa, e o título diz "Parque das Dunas".
2. **ecoturismo + buggy** — mostra São Miguel do Gostoso, não Galinhos.
3. **ecoturismo + caminhada** — mostra Dunas de Genipabu, não Parrachos.
4. Trocar o idioma para en e es e reconferir os três títulos.
5. O traço da rota aparece no mapa nas três combinações (se sumir ou ficar reto, o cache não pegou).

- [ ] **Step 6: Commit**

```bash
git add public/routes/osrm-cache.json
git commit -F - <<'EOF'
fix(rotas): presets deixam de pedir deslocamento que o transporte nao faz

Tres trechos da tabela pediam num dia o que o transporte nao roda:
familia/caminhada ligava Ponta Negra a Pipa (39,7 km A PE), ecoturismo/
caminhada ligava Pitangui a Maracajau (27,6 km a pe) e ecoturismo/buggy
ligava Maracajau a Galinhos (112,6 km). A assinatura nao passa pela barreira
de distancia -- de proposito, porque e o que o titulo promete --, entao o
unico conserto era trocar o destino.

Substitutos: Parque das Dunas (6,8 km de Ponta Negra), Dunas de Genipabu
(7,8 km de Pitangui) e Sao Miguel do Gostoso (48,5 km de Maracajau). Os tres
ja estavam no catalogo e nas listas de afinidade dos respectivos estilos.

Copia i18n atualizada nos tres idiomas: os titulos nomeiam os destinos, entao
trocar destino sem trocar copia quebraria a invariante de que o roteiro nao
inventa parada que o titulo nao prometeu.

Tetos de regressao caem de 39,7 / 138,9 / 313,1 para 9,2 / 55,6 / 246,2 km.
Os 246,2 que sobram sao o trecho Forte -> Mossoro da assinatura de cultura/van,
que a copia da "Grande Rota Historica" promete.

Cache do OSRM regerado.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

## Rollback

Depois do commit da Tarefa 6, se algo aparecer em cima da hora:

```bash
git revert --no-edit <sha-da-tarefa-6>
```

`git revert` e não `git checkout -- <arquivo>`: os limites de duração (Tarefa 1) e a tabela `ROTEIROS` (Tarefa 5) moram os dois em `routePresets.ts`, então descartar o arquivo levaria junto trabalho seguro. Separar por commit, não por arquivo, é o que torna o rollback preciso.

As Tarefas 1-4 não precisam de rollback: não tocam em chave de cache, só reduzem o que é alcançável.
