# Alcance do transporte nos presets de rota (POTI)

**Data:** 2026-07-30
**Contexto:** pitch do CONETUR em 30/07/2026, 9h — mudança entra ANTES do palco
**Componentes alvo:** `src/lib/routePresets.ts`, `src/lib/route-planner.ts`, `src/lib/map/routeCoverage.ts`, `src/components/tourist/TouristHomePage.tsx`, `src/i18n/messages/{pt-BR,en,es}.json`

## Problema

O commit `4fa2aaf` fechou o buraco do **preenchimento**: distância virou barreira dura (`comfortableLegKm`), então a afinidade de estilo não arrasta mais o roteiro para fora do alcance do transporte. O que sobrou são trechos da **própria tabela de presets** — e a assinatura, por decisão, não passa pela barreira.

Medido contra o catálogo real (20 destinos), com o planejador em `4fa2aaf`:

| Combinação | Pior dia | Origem |
|---|---|---|
| `culture/shuttle` 1d | 313,1 km | preset (Forte → Mossoró 246,2 + Mossoró → Lajedo 66,9) |
| `ecotourism/buggy` 3d | 138,9 km | preset (Maracajaú ↔ Galinhos 112,6, contado como chegada do dia) |
| `family/hike` 1-3d | 39,7 km **a pé** | preset (Ponta Negra → Pipa) |
| `ecotourism/hike` 1-5d | 27,6 km **a pé** | preset (Pitangui → Maracajaú) |
| `adventure/hike` 13d | 70,4 km a pé | preenchimento (São Miguel do Gostoso) |
| `culture/buggy` 13d | 189 km de buggy | preenchimento (São Miguel do Gostoso) |

As duas últimas linhas são o mesmo defeito visto de outro ângulo: o catálogo tem 20 destinos, dos quais só ~10 ficam na Grande Natal. Durações longas esgotam o que está perto e o preenchimento cai no escape `escolher(Infinity)` — que existe para não devolver dia vazio, e portanto ignora a barreira de propósito. `hike` estoura o próprio limite de 8 km já a partir de 3-4 dias em **todos** os estilos.

## Escopo

**Dentro:** a tabela de presets, o teto de duração por transporte, um mínimo de duração para `culture/shuttle`, a cópia i18n dos presets alterados e o cache do OSRM.

**Fora, por decisão explícita:**

- `TRANSPORT_PROFILE` (`perDay`, `comfortableLegKm`, `distanceWeight`) — ver Decisão 4.
- Listas `STYLE_AFFINITY`.
- Coordenadas em `mockData.ts`.
- Ampliar o catálogo com destinos intermediários, que é o conserto de fundo. Ver "Próximos passos".

## Decisões

| # | Decisão | Motivo |
|---|---|---|
| 1 | Trocar 3 destinos de preset (`family/hike`, `ecotourism/hike`, `ecotourism/buggy`) | São erros claros de produto: pedem deslocamento que o transporte não faz num dia. Nenhum artifício do planejador conserta um preset que promete 39,7 km a pé |
| 2 | Teto de duração **por transporte**: `hike` 3, `buggy` 12, `shuttle` 15 | Oferecer 15 dias de caminhada é a origem dos dias de 70 km. Corte medido, não arbitrado — ver tabela abaixo |
| 3 | Mínimo de **3 dias** para `culture/shuttle` | A "Grande Rota Histórica" é longa de propósito e a cópia nomeia Mossoró e o Lajedo. O defeito é oferecê-la em 1-2 dias, não a rota em si |
| 4 | **Não** mexer em `comfortableLegKm` do shuttle | Medido: 180 → 140 → 120 dá o mesmo pior dia (246,2 km); a 100 fica **pior** (261,3 km). O dia de 244,9 km com Castelo de Bivar sempre esteve abaixo da assinatura de `culture/shuttle` (246,2), logo nunca foi o vínculo ativo |
| 5 | Os limites moram em `routePresets.ts` | Mesmo motivo já escrito no cabeçalho do módulo: planejador, UI e gerador de cache dependem deles. Duplicar faria o cache envelhecer calado |
| 6 | `ecotourism/hike` fica igual a `adventure/hike` | Dentro de 8 km o catálogo só tem 5 pares e todos já estão em uso. Já é padrão aceito: `relax/hike` e `gastronomy/hike` são ambos Pipa + Madeiro, diferenciados só pela cópia |

### Base de medição da Decisão 2

| Transporte | Teto | Pior dia | No teto seguinte |
|---|---|---|---|
| `hike` | **3** | 9,2 km | teto 4 → 26,6 km |
| `buggy` | **12** | 55,6 km | teto 13 → 189 km |
| `shuttle` | **15** | 246,2 km | — |

O corte do `hike` é abrupto entre 3 e 4 dias; o do `buggy`, entre 12 e 13. Tetos 8, 10 e 12 dão o mesmo pior dia para buggy (55,6 km), então 12 é o mais generoso que não custa nada.

## Desenho

### 1. Trocas na tabela de presets

`src/lib/routePresets.ts`, dentro de `ROTEIROS`:

| Combinação | Hoje | Nova | Trecho |
|---|---|---|---|
| `family.hike` | Ponta Negra + Praia da Pipa | Ponta Negra + **Parque das Dunas** | 39,7 → 6,8 km |
| `ecotourism.hike` | Pitangui + Parrachos de Maracajaú | Pitangui + **Dunas de Genipabu** | 27,6 → 7,8 km |
| `ecotourism.buggy` | Maracajaú + Galinhos | Maracajaú + **São Miguel do Gostoso** | 112,6 → 48,5 km |

Todos os três substitutos já existem em `mockData.ts` e já estão nas listas `STYLE_AFFINITY` dos respectivos estilos, então nada de novo entra no catálogo.

### 2. Limites de duração

Novo export em `routePresets.ts` — é dado de produto sobre a tabela, e é o módulo que planejador, UI e cache já compartilham:

```ts
/** Teto do contador de duração por transporte. */
export const MAX_DIAS_POR_TRANSPORTE: Record<Transport, number> = {
  hike: 3,
  buggy: 12,
  shuttle: 15,
};

/** Combinações que só fazem sentido a partir de N dias. Chave: `${estilo}/${transporte}`. */
export const MIN_DIAS_POR_COMBINACAO: Record<string, number> = {
  'culture/shuttle': 3,
};

export function limitesDeDuracao(style: string, transport: string): { min: number; max: number } {
  const t = normalizeTransport(transport);
  const s = normalizeStyle(style);
  return { min: MIN_DIAS_POR_COMBINACAO[`${s}/${t}`] ?? 1, max: MAX_DIAS_POR_TRANSPORTE[t] };
}
```

`MAX_ROUTE_DAYS = 15` continua em `route-planner.ts` como teto global (é o do shuttle) e continua exportado — `TouristHomePage` já o importa.

### 3. Consumidores

| Onde | Mudança |
|---|---|
| `route-planner.ts` → `clampDays` | Passa a receber `style` e `transport` e a apertar contra `limitesDeDuracao`, além de `MAX_ROUTE_DAYS` e do tamanho do catálogo. `planRoute` já tem os dois em mãos |
| `TouristHomePage.tsx:481` / `:495` | Os botões −/+ do contador usam `min`/`max` do par selecionado no lugar de `1` e `MAX_ROUTE_DAYS` |
| `TouristHomePage.tsx` | Efeito que reaperta `durationDays` quando estilo ou transporte muda: sobe até `min`, desce até `max`. Senão "10 dias" + trocar para caminhada deixa o contador exibindo 10 e o roteiro entregando 3 |
| `routeCoverage.ts` → `trechosNecessarios` | O laço `days = 1..MAX_CACHED_DAYS` respeita os mesmos limites, senão o cache grava geometria de duração inalcançável |

O aperto é do lado do planejador **e** da UI de propósito: `planRoute` é o contrato, a UI é conveniência. Um sem o outro devolve um contador que mente.

### 4. Cópia i18n

Três combinações × três idiomas. Os títulos/descrições atuais nomeiam explicitamente os destinos que saem:

| Chave | Some da cópia | Entra |
|---|---|---|
| `planner.routes.family.hike` | "praia familiar de Pipa" | Parque das Dunas |
| `planner.routes.ecotourism.hike` | "Parrachos de Maracajaú" / "Parrachos" no título | Dunas de Genipabu |
| `planner.routes.ecotourism.buggy` | "vila de pescadores de Galinhos" | São Miguel do Gostoso |

`ecotourism.hike` precisa de título novo, não só de descrição: hoje é "Trilha Ecológica das Lagoas & **Parrachos**".

Invariante 2 do planejador (`[[rotas-planejador-invariantes]]`) é exatamente isto: enquanto a duração couber na assinatura, a assinatura é o roteiro inteiro, e o título promete nome por nome. Cópia desatualizada quebra a invariante sem quebrar teste nenhum.

### 5. Tetos de regressão

`route-planner.test.ts`, teste "nenhum dia da faixa demonstrável piora o que a assinatura já pedia":

| Transporte | Teto hoje | Novo |
|---|---|---|
| `hike` | 39,7 | **9,2** |
| `buggy` | 138,9 | **55,6** |
| `shuttle` | 313,1 | **246,2** |

Os 246,2 km que sobram são o trecho Forte → Mossoró da assinatura de `culture/shuttle`: um dia de transfer de van, honesto e prometido pela cópia.

### 6. Testes existentes que quebram

O teto por transporte muda o contrato de `planRoute`, e alguns testes assumem que qualquer duração de 1 a 15 é honrada por qualquer transporte:

| Teste | Situação | Ação |
|---|---|---|
| `'nunca devolve um dia sem destino'` | Varre os 3 transportes × 1..15 dias e exige `days.length === dias`. Com o teto, `hike` de 15 dias devolve 3 | **Quebra.** Passa a varrer até o teto do transporte |
| `'não empilha destinos no mesmo dia quando o passeio é a pé'` | Pede 5 dias de `hike`, recebe 3 | Passa, mas por acidente. Ajustar para pedir 3 |
| `'mantém as pernas curtas quando o passeio é a pé'` | `hike` 4 dias → 3 | Passa; confirmar |
| Teste dos tetos (§5) | Varre 1..7 para todo transporte; `hike` 4-7 vira 3 | Passa, com repetição inócua |

Testes novos: teto por transporte, mínimo de `culture/shuttle`, e o contador da UI não passando dos limites.

## Travas conhecidas

**Cache do OSRM.** As três trocas mudam as chaves de `family/hike`, `ecotourism/hike` e `ecotourism/buggy`, em todas as durações de 1 a 7 dias, tanto na rota inteira quanto nos trechos por dia. O teto de duração também reduz o conjunto que `trechosNecessarios()` enumera. Rodar `npm run cache:rotas` (internet, ~3 min, rate limit 1,2 s/rota) e commitar `public/routes/osrm-cache.json`. Sem isso `routeCache.test.ts` falha; ignorado, o traço da rota volta a depender do OSRM público ao vivo — o risco que o cache existe para eliminar num auditório.

**Acordeão do cronograma.** Não é tocado aqui, mas continua valendo: os dias nascem fechados (`expandedDay = null`).

## Ordem dos commits e rollback

O pitch é às 9h de hoje, então a mudança entra em **dois commits**, do mais seguro para o mais arriscado:

| # | Conteúdo | Toca chave de cache? |
|---|---|---|
| 1 | Limites de duração (§2, §3) + testes | **Não** |
| 2 | Trocas de preset (§1) + cópia i18n (§4) + tetos de regressão (§5) + `osrm-cache.json` regerado | **Sim** |

O commit 1 só reduz o que é alcançável: `trechosNecessarios()` passa a pedir um subconjunto do que já está gravado, e o teste de cobertura continua passando sem regerar nada.

Se o `cache:rotas` falhar por rede ou rate limit e não houver tempo, reverter **só o commit 2**:

```bash
git revert --no-edit <sha-do-commit-2>
```

`git revert` e não `git checkout -- <arquivo>`: os limites de duração e a tabela `ROTEIROS` moram os dois em `routePresets.ts` (Decisão 5), então descartar o arquivo levaria junto o commit 1. Separar por commit, não por arquivo, é o que torna o rollback preciso.

## Verificação

1. `npm test` — verde, com os tetos novos de §5.
2. `npm run lint` e `npm run build`.
3. `npm run cache:rotas`, e `npm test` de novo (cobertura do cache).
4. Na home: `família + caminhada` mostra Parque das Dunas e não Pipa; `cultura + van` não deixa o contador descer de 3; `caminhada` não deixa passar de 3; os três títulos batem com os destinos exibidos, nos três idiomas.

## Próximos passos (depois de 30/07)

- **Catálogo intermediário.** O conserto de fundo: entre a Grande Natal e o litoral norte não há nada entre Maracajaú (40 km do Forte) e Gostoso (+48 km); entre Natal e Mossoró, 246 km sem parada. Com destinos intermediários, o preenchimento para de escolher entre "perto demais" e "longe demais", e o teto de `hike` pode subir.
- **`escolher(Infinity)`.** O escape que ignora a barreira para não devolver dia vazio. Com o teto por transporte ele quase não dispara mais, mas continua sendo a única porta por onde entra dia impossível. Alternativa: permitir dia com destino repetido ou dia de descanso explícito, em vez de alcançar longe.
- Reavaliar o teto de `buggy` (12) se o catálogo do litoral norte crescer.
