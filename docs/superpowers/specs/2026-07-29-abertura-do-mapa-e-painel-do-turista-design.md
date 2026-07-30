# Abertura do mapa e painel do turista

Data: 2026-07-29
Contexto: home da POTI (`/[locale]`), véspera do pitch do CONETUR.

## Problema

Gravação da home revelou três defeitos na primeira tela.

### 1. A abertura pisca e o estado nasce torto

Medido no browser (`window.__potiMap`, viewport 1594×835): no primeiro quadro
pintado o Rio Grande do Norte ocupa **28% da largura** do canvas, com centro
ótico em **35%** — pequeno e deslocado para a esquerda. Esse quadro fica
congelado até o estilo do MapTiler carregar.

Quatro descontinuidades se empilham nos primeiros segundos:

1. O mapa nasce em `RN_CENTER` / `RN_OVERVIEW_ZOOM` (6.4) e só o `fitBounds`
   posterior acerta o enquadramento.
2. No `load`, `apply3DScene` liga projeção globo, terreno (exageração 2.5) e sky
   no mesmo frame, sobre um zoom 6.4. Globo nessa altura encurva o quadro — é o
   "torto" que o usuário relatou.
3. No mesmo `load`, `fitBounds(RN_BOUNDS, { duration: 0 })` faz um corte seco de
   zoom 6.4 para ~7.3.
4. O `fetch('/geo/rn.geojson')` resolve num momento imprevisível e aplica a
   máscara com `fill-opacity: 0.55` sem transição: tudo fora do estado escurece
   de uma vez.

Defeito de mesma classe, fora da gravação: `styleUrl` depende de
`resolvedTheme`, que é `undefined` no primeiro render do cliente. No modo 2D de
fallback isso recria o mapa inteiro quando o tema resolve.

### 2. O rótulo do estado briga com o header

O nome "Rio Grande do Norte" é um overlay fixo em `pl-14 pt-16` no canto
superior esquerdo. Cola no header do site, compete com o logo, e o eyebrow
"Observatório" repete o badge do painel ("POTI – Observatório do Turismo
Inteligente"). Some por opacidade no mergulho, o que lê como fantasma sobre o
close do destino.

### 3. O painel afoga o turista em texto

O step 1 apresenta, na ordem: badge, h1 de duas linhas, parágrafo de 55
palavras, card "O que oferecemos" com 4 itens (cada um com título *e*
descrição), busca por destino, estilo de viagem, duração, transporte, CTA e
rodapé de certificações. São ~180 palavras e 10 blocos antes de qualquer ação
possível. Os 4 itens usam linguagem institucional (Cadastur, Zeladoria
Ecológica, Painel Observatório) — argumento B2B, não convite ao turista.

## Decisões

Tomadas com o usuário antes do desenho:

| Questão | Decisão |
|---|---|
| Bloco "O que oferecemos" | Vira 4 selos sem descrição, no pé do painel |
| Rótulo "Rio Grande do Norte" | Etiqueta pequena ancorada no estado |
| Ritmo da abertura | Mesmo roteiro (2,6s + 5,2s), sem emendas |
| Foco do painel | Montar o roteiro; busca por destino é secundária |

## Solução

### Parte 1 — Abertura sem emendas

**1.1 O primeiro quadro já é o quadro final.** O mapa nasce em
`OPENING_FALLBACK_CAMERA` (`RN_CENTER` / `RN_OVERVIEW_ZOOM`, reto) e é
reenquadrado **sincronamente**, na linha seguinte à construção, por um novo
helper em `scene3d.ts`:

```ts
export function applyOpeningFraming(map: FramingTarget, width: number, height: number): void
```

O MapLibre só pinta no próximo frame de animação, então os dois passos do helper
cabem antes do primeiro pixel. `HomeRouteMap` lê `clientWidth/clientHeight` do
container (que já tem dimensão real, pois vem de `absolute inset-0`).

**A raiz do "torto, mais ao canto" era padding aplicado em dobro.** Lido na
fonte do MapLibre 5.24 (`cameraForBoxAndBearing`), o cálculo do zoom **soma** o
padding do transform ao padding da opção:

```js
availableWidth = tr.width - (edgePadding.left + edgePadding.right
                             + padding.left + padding.right)
```

e o centro é deslocado por `(padding.left - padding.right) / 2` — só pelo padding
da **opção**, porque o do transform já desloca a projeção por conta própria.
Além disso, `_fitInternal` **apaga** `options.padding` antes de aplicar
("calculatedOptions already accounts for padding"), ou seja, `fitBounds` nunca
grava padding no transform.

Consequência no código antigo: o efeito `map.setPadding(overviewPadding(...))`
já havia rodado quando o `fitBounds` do `'load'` executava com
`padding: overviewPadding(...)`. O painel era descontado **duas vezes** — num
canvas de 1274px, a faixa disponível caía de 690px para ~106px, e o centro ainda
era empurrado para a esquerda. Daí o estado pequeno e jogado no canto.

Portanto a ordem no helper não é detalhe:

1. `map.setPadding(overviewPadding(w, h))` — é onde o padding precisa ficar de
   todo jeito, para órbita, voo e `fitBounds` da rota respeitarem o painel;
2. `map.fitBounds(RN_BOUNDS, { padding: 0, pitch: 0, bearing: 0, duration: 0 })`.

Medido no browser em canvas 1274×655: antes, o estado nascia em 28% da largura;
com padding em dobro, 236px à esquerda do lugar; com a ordem correta, desvio
`(0, 0)` e caixa `x ∈ [56, 746]`, que é exatamente a área útil.

Container degenerado (largura ou altura zero) faz o helper retornar sem tocar em
nada: `cameraForBounds` devolve `undefined` quando o padding cobre o canvas e o
`fitBounds` viraria no-op silencioso, então o mapa fica no
`OPENING_FALLBACK_CAMERA`, que é legível.

**1.2 Fim do corte seco.** Com 1.1, o `fitBounds(..., { duration: 0 })` dentro
de `comecar()` é redundante e sai. `comecar()` passa a fazer uma coisa só:
esperar `INTRO_HOLD_MS` e voar.

**1.3 A projeção globo sai de vez; o terreno sai da abertura.** `apply3DScene`
é desmontada em duas funções e a projeção é descartada:

- `applySky(map)` — só céu e atmosfera, continua no `load`. Sem inclinação o céu
  nem aparece, então o primeiro quadro fica idêntico com ou sem ele.
- `applyTerrain(map, key)` — fonte raster-dem e `setTerrain`, ligada por um
  efeito quando o zoom cruza `RN_FADE_END_ZOOM` (10.5).
- `setProjection({ type: 'globe' })` — **removida**.

Por que o globo sai em vez de mudar de lugar: ele era ligado no `load`, isto é,
depois do primeiro quadro em mercator, e a troca reprojetava o mapa inteiro de
uma vez. Pior, no plano aberto o estado fica fora do eixo ótico (o painel empurra
o enquadramento para a esquerda) e no globo tudo que está fora do eixo aparece
cisalhado — outra fonte do contorno "torto". Acima de zoom ~12 o próprio MapLibre
converge o globo para mercator, então no mergulho a projeção não mudava nada: o
globo só tinha efeito visível justamente onde atrapalhava.

O terreno é amarrado ao mesmo limiar do fade do destaque, e não ao início do
mergulho, porque isso cobre de graça todos os caminhos de câmera — abertura,
destino buscado, roteiro gerado ao montar e o modo de movimento reduzido, que
salta direto para o destino. Um conceito só: "perto o bastante para o relevo
significar algo". O relevo do RN (dunas de 30–50 m) não é legível em zoom 7.

**1.4 Máscara em fade.** Duas defesas independentes:

- O `fetch(RN_GEOJSON_URL)` sai de dentro do `load` e vira promise memoizada em
  módulo, disparada no mount. Na prática já resolveu quando o `load` chega.
- As quatro camadas (máscara, dois halos, contorno) nascem com opacidade `0` e
  `*-opacity-transition: { duration: 900 }`. A expressão `fadeByZoom` real é
  aplicada via `setPaintProperty` no frame seguinte. `fill-opacity` e
  `line-opacity` são transicionáveis no style spec — verificado em
  `@maplibre/maplibre-gl-style-spec`.

**1.5 Guard de tema.** O efeito de init espera `resolvedTheme` estar definido
antes de criar o mapa, eliminando a recriação no modo 2D.

### Parte 2 — Etiqueta ancorada no estado

O overlay fixo é removido. Entra um `maplibregl.Marker` com
`pointer-events: none` num ponto interior do estado a oeste do centro
(`RN_LABEL_ANCHOR`), escolhido para nunca cruzar o painel flutuante.

- Uma linha: `RIO GRANDE DO NORTE`
- ~11px, `letter-spacing: 0.3em`, peso 700, branco, sombra suave
- O eyebrow "Observatório" é removido (duplicava o badge do painel)
- Fade controlado por `zoomProximo`, como hoje
- Classe `.rn-label` em `globals.css`, ao lado de `.hero-pin`

Por estar ancorada na terra, a etiqueta desliza junto no mergulho em vez de
flutuar parada.

### Parte 3 — Painel enxuto

Nova ordem do step 1:

1. Badge (mantido)
2. h1 (mantido)
3. Subtítulo curto — uma promessa, ~23 palavras
4. **Estilo de viagem**
5. Duração
6. Transporte
7. CTA "Continuar"
8. Busca compacta — *"Já sabe para onde vai?"*
9. Faixa de 4 selos

Mudanças de conteúdo:

| Bloco | Antes | Depois |
|---|---|---|
| `planner.description` | 55 palavras institucionais | *"Diga como você viaja. A POTI monta o roteiro no Rio Grande do Norte, com guias credenciados e dados reais de cada destino."* |
| "O que oferecemos" | Card com 4 × (título + descrição) | Faixa de selos: ícone + rótulo. Novas chaves `planner.seals.*` |
| Busca por destino | Bloco com label em caixa alta, acima de tudo | Campo compacto abaixo do CTA |
| Rodapé de certificações | `cadasturCert` + `activeGps` | Removido — os selos já cobrem |

Selos: Roteiros por IA (`Route`), Guias Cadastur (`ShieldCheck`), Zeladoria
ecológica (`Leaf`), Dados em tempo real (`BarChart3`).

As três locales (`pt-BR`, `en`, `es`) recebem `description` curta e
`planner.seals.*`. `cadasturCert` e `activeGps` permanecem nos arquivos: são
usadas em outros lugares do app.

## Arquivos

| Arquivo | Mudança |
|---|---|
| `src/lib/map/scene3d.ts` | `applyOpeningFraming()`, `OPENING_FALLBACK_CAMERA`; `apply3DScene` desmontada em `applySky` + `applyTerrain`; globo removido |
| `src/lib/map/rnHighlight.ts` | `highlightLayers()`, `RN_OPACITY_TRANSITION`, `RN_LABEL_ANCHOR`, `RN_MASK_COLOR` |
| `src/components/tourist/HomeRouteMap.tsx` | 1.1–1.5, etiqueta como Marker, `carregarMalhaRN()` memoizada |
| `src/components/tourist/TouristHomePage.tsx` | Step 1 reordenado e enxuto |
| `src/app/globals.css` | `.rn-label`, `.rn-label--out`, `@keyframes rnLabelIn` |
| `src/i18n/messages/{pt-BR,en,es}.json` | `description` curta, `planner.seals.*`, `searchNudge`, `searchHint` |

## Testes

143 testes passam (eram 121). Novos casos, na convenção de `src/lib/map/`:

- `scene3d.test.ts` — `applyOpeningFraming` põe o padding no transform **antes**
  de enquadrar, passa `padding: 0` ao `fitBounds` (o teste que guarda o defeito
  do padding em dobro), enquadra com `duration: 0`, acompanha o viewport e não
  toca em nada com container degenerado; `applySky` não mexe na projeção nem liga
  terreno; `applyTerrain` é idempotente.
- `rnHighlight.test.ts` — as camadas nascem com opacidade 0, declaram a transição,
  guardam a opacidade final como rampa de zoom que termina em 0, e
  `highlightLayers()` devolve objetos novos a cada chamada.

## Achados da revisão adversarial

Uma revisão multi-lente (5 lentes independentes + céticos, 13 agentes) sobre o
diff encontrou seis defeitos além do padding em dobro. Todos corrigidos.

**1. `isStyleLoaded()` como porta de efeito é armadilha.** Três lentes
convergiram nisto de forma independente. `Map.isStyleLoaded()` e `Map.loaded()`
retornam `false` enquanto **qualquer tile estiver em voo**, não apenas antes do
estilo ficar pronto. Usados como guard num efeito, o efeito desiste — e se as
dependências não mudarem mais, nunca roda de novo. Isso atingia:

- o relevo (`zoomProximo` vira `true` exatamente no meio do mergulho, com tiles
  carregando → `applyTerrain` nunca era chamado → o mergulho aterrava em satélite
  chapado, sem dunas);
- a órbita (`map.loaded()` + `once('load')`, com o efeito reexecutando quando
  `introDone` vira → `once('load')` registrado depois do evento já ter passado);
- o desenho da rota (mesmo padrão, com `'style.load'`, que dispara **uma vez só**
  na criação do mapa → roteiro gerado e nenhuma linha desenhada, sem erro no
  console). Defeito pré-existente, não introduzido aqui.

Correção: um estado `estiloCarregado`, ligado no `'load'` e zerado na limpeza do
init, entra nas dependências dos efeitos. Os dois lados são reativos, então
qualquer ordem de chegada funciona. `map.loaded()` e `once('load')` saíram do
arquivo como porta de efeito.

**2. O `Marker` do MapLibre escreve `opacity` inline.** `Marker._updateOpacity()`
faz `element.style.opacity = '1'` no elemento **raiz** a cada `move` e já no
`addTo`, e declaração inline vence regra de classe sem `!important` — o fade de
saída da etiqueta simplesmente não aconteceria. Correção estrutural: o texto foi
para um filho `.rn-label-text`, e é nele que a opacidade transita. Mesma divisão
que o `.hero-pin` já usava para `transform`. Efeito colateral bom: com terreno
ligado e a âncora ocluída o MapLibre põe `0.2` no raiz, e `0.2 × 0 = 0` — sem
rótulo fantasma.

**3. Visibilidade não pode depender de animação.** A etiqueta nascia com
`opacity: 0` + `@keyframes`. Em aba sem composição de frames o relógio da
animação não avança, ela congela na fase de atraso e o rótulo **nunca aparece** —
observado no browser embutido. O estado base agora é visível e só a classe
`--out` esconde, por transição. Sem transição, salta para 0, que é o resultado
correto, só menos suave.

**4. A etiqueta renascia opaca sobre o close.** O comentário afirmava que ela é
"sempre criada com `zoomProximo` em false". Não se sustenta: gerar um roteiro
desmonta o marcador e leva a câmera para zoom fechado; clicar em "Refazer"
(`setSuggestedRoute(null)`) remonta a etiqueta com `zoomProximo` já `true`.
Correção: espelho em `zoomProximoRef`, atualizado por um efeito declarado
**antes** do de criação, e a classe inicial sai dele.

**5. `setTerrain` realoca.** No ramo de adição o MapLibre faz
`this.terrain = new Terrain(...)` sem destruir o anterior, então recruzar o
limiar de zoom vazava um `Terrain` e um `RenderToTexture`. `applyTerrain` agora
sai cedo se `map.getTerrain()` já existir.

**6. Relevo ligado no meio do voo mede a elevação errada.** `flyTo` faz
`if (this.terrain) this._prepareElevation(targetCenter)` **no início** da
transição. Sem terreno ali, o auto-conserto de `_updateElevation` chama
`_prepareElevation(transform.center)` — o centro instantâneo da câmera em vez do
destino — e a altura da câmera converge para a elevação de um ponto de passagem.
Correção: `garantirRelevo(map)` é chamado **antes** de cada voo que termina perto
(mergulho e destino buscado), e o efeito por limiar de zoom fica como rede para
os caminhos sem voo nosso (roteiro ao montar, movimento reduzido). Seguro de
combinar por causa do item 5.

Polimentos no mesmo passe: `aria-label` do botão de limpar traduzido
(`planner.clearSearch`), `OPENING_ZOOM` órfã removida (seu comentário
argumentava contra o enquadramento atual), e `atmosphere-blend` documentado como
inerte sem a projeção globo.

Nota de método: os céticos refutaram todos os achados porque leram a árvore
**depois** das correções — um deles registra que "a correção sugerida já é
exatamente o que o código faz hoje". Foi uma corrida no workflow (arquivos
editados durante a revisão), não prova de que os achados eram falsos. Eles
verificaram a API na fonte instalada e confirmaram os mecanismos.

## Verificação

Medido no browser embutido com `window.__potiMap`:

| | Antes | Primeira tentativa | Final |
|---|---|---|---|
| Zoom do 1º quadro | 6.4 | 7.04 | 7.04 |
| Largura ocupada | 28% do canvas | 100% da área útil | 100% da área útil |
| Desvio do centro ótico | — | −236px | **(0, 0)** |
| Caixa do estado | — | sai pela borda | idêntica à área útil |
| Salto em 11s | corte no `load` | nenhum | nenhum |

Duas resoluções, dois resultados idênticos em qualidade:

- canvas 1274×655 → zoom 7.04, desvio `(0, 0)`, caixa `x ∈ [56, 746]`, área útil
  `[56, 746]`, preenche 100%×77%
- canvas 1434×795 → zoom 7.34, desvio `(0, 0)`, caixa `x ∈ [56, 906]`, área útil
  `[56, 906]`, preenche 100%×76%

Container degenerado (canvas 400×300, antes do layout assentar) cai no
`OPENING_FALLBACK_CAMERA`: zoom 6.4, estado centrado, transbordando um pouco a
área útil — legível, que é o objetivo do fallback.

Etiqueta: `opacity: 1` no estado base com `animation-name: none` (não depende de
animação rodar), `letter-spacing: 3.3px` (0.3em), 11px, caixa alta. Imunidade ao
inline do Marker provada em runtime: com `style.opacity = '1'` forçado no raiz e
a classe `--out` aplicada, a opacidade efetiva é 0.

Painel: `description` de 47 → 23 palavras; ordem confirmada por `read_page` como
h1 → subtítulo → Estilo de Viagem → Duração → Transporte → Avançar → busca →
4 selos. `sr-only` do `aria-describedby` confirmado (`position: absolute`,
`width: 1px`). Etiqueta com `font-size: 11px`, `letter-spacing: 3.3px` (0.3em),
`uppercase`, peso 700.

Ressalva: o painel embutido do browser só compõe frames WebGL quando está
visível. Numa das execuções o estilo carregou e a sequência completa foi
observada (chegou a zoom 13.8, pitch 60, etiqueta com `rn-label--out`); nas
outras o `load` não dispara e só o quadro de abertura é verificável. **A conferência
visual do mergulho fica com o usuário no Chrome real.**

## Fora de escopo

- O wizard de dois passos continua sendo dois passos. Fundir step 1 e 2 é
  mudança de fluxo, não de densidade.
- Nenhum refactor do `TouristHomePage.tsx` (1998 linhas) além do step 1.
