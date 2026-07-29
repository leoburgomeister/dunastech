# Mapa 3D cinematográfico na home (POTI)

**Data:** 2026-07-28
**Contexto:** pitch do CONETUR em 30/07/2026 (2 dias)
**Componente alvo:** `src/components/tourist/HomeRouteMap.tsx`

## Problema

1. O mapa da home dispara confete (`canvas-confetti`) ao terminar a animação da rota. Lido pelo usuário como "parabéns" indevido no carregamento da página.
2. O mapa é 2D chapado. Para uma plataforma de turismo cujo produto é o litoral do RN, falta impacto visual.

## Decisão de plataforma

Avaliadas três opções. **Escolhida: MapLibre GL JS v5** (já instalado, v5.24).

### Apple MapKit JS — descartado

- Não faz 3D na web: sem tilt, sem terreno, sem malha. O "Flyover" da Apple é exclusivo de app nativo iOS.
- Exige Apple Developer Program (US$ 99/ano) e JWT ES256 assinado no servidor.
- Falha o requisito principal (3D) e não cabe no prazo.

### Google Maps Platform — descartado

Documentação oficial de cobertura:

> "Os dados de terreno em 3D estão disponíveis no mundo todo. Os dados de superfície 3D são limitados às áreas destacadas em azul."

- A rota do produto é **Natal → Genipabu → Pipa**. Natal (mancha urbana) provavelmente tem malha fotogramétrica; Genipabu e Pipa são litoral/rural e quase certamente só têm terreno. Ou seja, a maior parte da rota renderiza igual ao MapLibre, pagando.
- Photorealistic 3D Tiles é **SKU Enterprise: 1.000 eventos grátis/mês**, cobrado por Root Tile request. ≈33 carregamentos/dia num site público — estoura rápido, com cartão de crédito ativo.
- Exige projeto no Google Cloud + conta de faturamento.

**Pendência assumida:** as manchas azuis exatas para Natal/Genipabu/Pipa não foram confirmadas visualmente (o visualizador oficial é iframe e screenshots estavam indisponíveis na sessão). Verificável em <https://developers.google.com/maps/documentation/javascript/3d/coverage>. Isso não altera a decisão: mesmo com cobertura total em Natal, o limite de 1.000/mês inviabiliza uso em home pública.

### MapLibre GL JS v5 — escolhida

- Já é dependência do projeto (v5.24). Zero conta nova, zero cartão.
- v5 tem projeção globo, `setTerrain()` com `raster-dem`, camada `sky`, pitch/bearing.
- Tiles: **MapTiler free** (satélite + terrain-RGB), cadastro grátis sem cartão, 100k tiles/mês, licenciamento limpo para uso comercial.

## Premissa corrigida: o RN é plano

Ponto mais alto do estado ~800m; dunas de Genipabu ~30-50m; falésias de Pipa ~50m. Relevo puro não impressiona nessa geografia.

**O que vende o RN é cor** — água turquesa, areia branca, verde. Portanto o satélite drapeado é o núcleo do efeito, não enfeite, e o exagero de terreno precisa ser alto (~2.5x) para que duna e falésia fiquem legíveis.

## Desenho

### Cena 3D

| Camada | Implementação |
|---|---|
| Relevo | `raster-dem` MapTiler + `setTerrain({ exaggeration: 2.5 })` |
| Satélite | raster MapTiler drapeado sobre o relevo |
| Céu | camada `sky` com atmosfera / haze no horizonte |
| Globo | `setProjection({ type: 'globe' })` para a entrada |
| Rota + marcadores | lógica OSRM e marcadores atuais, preservados |

### Câmera cinematográfica

O mapa é **cenário**, não ferramenta (decisão do PO).

- **Entrada:** globo → `flyTo` mergulhando no litoral do RN, pitch ~65°
- **Repouso:** órbita lenta em torno da rota, ~40s/volta, quase imperceptível
- **Pausa automática** quando a aba perde foco (`visibilitychange`) — poupa GPU/bateria

Detalhe do contexto: nos passos 1 e 2 o mapa fica borrado (`blur-[6px] scale-105`) atrás do card POTI, em `TouristHomePage.tsx:407-416`. A órbita lenta roda desde o início — atrás do blur ela lê como "vivo" sem competir com o card. O `flyTo` de aproximação dispara quando a rota é gerada e o blur sai.

### Arquitetura

`HomeRouteMap.tsx` já tem ~270 linhas e cresceria demais. Divisão em três unidades testáveis isoladamente:

- **`HomeRouteMap.tsx`** — orquestra; mantém a API pública atual (`destinations`, `activeDay`, `isInteractive`)
- **`lib/map/scene3d.ts`** — monta terreno, satélite, céu, globo; recebe um `maplibregl.Map`, não conhece React
- **`lib/map/cinematic.ts`** — controlador de câmera (órbita, pausa, cleanup); recebe um `maplibregl.Map`, não conhece React

A API do componente não muda, então `TouristHomePage.tsx` não é tocado.

### Configuração

- Chave em `NEXT_PUBLIC_MAPTILER_KEY`, seguindo o padrão `NEXT_PUBLIC_*` já usado (Firebase, Supabase).
- Por ser `NEXT_PUBLIC_`, a chave é exposta no cliente — **restringir por domínio no painel do MapTiler** (`dunastech.com.br` + previews da Vercel). Isso é obrigatório, não opcional.
- Cadastrar a variável na Vercel em **Production e Preview**. As envs da integração Supabase hoje estão só em Production; repetir esse erro deixaria o preview sem mapa.

## Degradação e riscos

| Risco | Mitigação |
|---|---|
| Chave ausente ou inválida | Fallback para o estilo vetorial Carto atual. O mapa nunca some. |
| Usuário com `prefers-reduced-motion` | Cena 3D **estática**: relevo, satélite e céu permanecem; órbita e `flyTo` não rodam. Não é fallback para 2D. |
| GPU fraca no auditório | Fallback manual para o mapa 2D atual via `NEXT_PUBLIC_MAP_2D=1`, acionável em segundos se a máquina do evento engasgar |
| Tiles lentos na rede do evento | Manter o Carto como estilo inicial e promover a cena 3D só após `load` dos tiles |

O caminho de fallback é o comportamento que já está em produção hoje, ou seja, o pior caso é o estado atual.

## Escopo

**Incluído:**
- Remoção do confete (feito) e da dependência `canvas-confetti`
- Cena 3D (terreno, satélite, céu, globo)
- Câmera cinematográfica com pausa por foco
- Extração de `scene3d.ts` e `cinematic.ts`
- Fallbacks: sem chave, `prefers-reduced-motion`, erro de tiles

**Fora de escopo:**
- `DestinationMap.tsx` (mapa da página de destino) — continua 2D
- Google Photorealistic 3D como fase 2 pós-pitch
- Migração do `react-leaflet`/`leaflet`, ainda no `package.json`

## Critérios de aceite

1. Nenhum confete em nenhum estado da home
2. Home renderiza mapa 3D com relevo, satélite e céu, com câmera orbitando lentamente
3. Sem `NEXT_PUBLIC_MAPTILER_KEY`, a home renderiza o mapa 2D atual sem erro de console
4. Com `prefers-reduced-motion: reduce`, a cena 3D aparece estática — sem órbita e sem `flyTo`
5. Com `NEXT_PUBLIC_MAP_2D=1`, a home renderiza o mapa 2D atual mesmo com chave válida
6. Rota animada e marcadores seguem funcionando como hoje
7. `npm run build`, `npm run lint` e `npm run test` passam
