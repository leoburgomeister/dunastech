# DunasTech — Arquitetura Técnica

> Como o produto roda: stack, roteamento/i18n, providers, API routes, persistência com _graceful degradation_, mapas e ambiente.
> Fontes: `package.json`, `next.config.ts`, `src/middleware.ts`, `src/i18n/config.ts`, `src/providers/*`, `src/app/api/*`, `src/lib/*`.

## 1. Stack

| Camada | Pacote | Versão | Papel |
|--------|--------|--------|-------|
| Framework | `next` | 16.2.9 | App Router, API routes, Turbopack (dev) |
| UI | `react` / `react-dom` | 19.2.4 | Componentes client/server |
| i18n | `next-intl` | 4.13.0 | Locale por cookie, middleware, mensagens |
| Auth/DB | `firebase` | 12.15.0 | Auth (Google/CPF) + Firestore (feedbacks) |
| LLM | `@google/generative-ai` | 0.24.1 | Gemini `gemini-2.0-flash` (server, import dinâmico) |
| Scraping | `apify-client` | 2.23.4 | Instagram hashtag scraper (server, import dinâmico) |
| Mapas B2C | `maplibre-gl` | 5.24.0 | Mapas de rota/parceiros (estilos Carto GL) |
| Mapas B2G | `leaflet` + `react-leaflet` | 1.9.4 / 5.0.0 | Mapa multi-destino com ISA |
| Charts | `recharts` | 3.9.0 | KPIs de gestão + slides do pitch |
| Motion | `framer-motion` | 12.42.0 | Transições do pitch |
| Estilo | `tailwindcss` + `@tailwindcss/postcss` | v4 | CSS-first (`@import "tailwindcss"`), sem `tailwind.config.js` |
| Tema | `next-themes` | 0.4.6 | Dark/light por classe (`storageKey="dunastech-theme"`) |
| Ícones | `lucide-react` | 1.21.0 | Iconografia |
| Utils | `clsx`, `tailwind-merge` | — | helper `cn()` |
| Efeitos | `canvas-confetti` | 1.9.4 | Conclusão da animação de rota |
| Testes | `vitest` | 2.1.8 | Unit tests (`src/lib/utils.test.ts`, `src/data/mockData.test.ts`) |

**Path alias:** `@/*` → `./src/*` (`tsconfig.json`). `src/legacy/` é excluído da compilação.

## 2. Roteamento & i18n

O tree usa `src/app/[locale]/…`, mas o middleware define **`localePrefix: 'never'`** → as URLs **não** têm prefixo (`/`, `/gestao`, `/destino/...`). O locale vem do cookie `NEXT_LOCALE` / detecção, não do path.

```ts
// src/middleware.ts
export default createMiddleware({
  locales, defaultLocale,
  localeDetection: true,
  localePrefix: 'never', // cookie-based, URLs limpas
});
export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] };
```

O `next-intl/plugin` é plugado no `next.config.ts` apontando para `src/i18n/config.ts`, que carrega `messages/{locale}.json` e fixa o fuso `America/Fortaleza`.

**Redirects:** não há redirects em `next.config.ts`. Redirects são client-side — usuários não autenticados vão para `/login?redirect=…` (`EvaluationPage`, `perfil/page.tsx`), e o pós-login usa o query param `redirect`.

## 3. Árvore de providers

```tsx
// src/app/[locale]/layout.tsx (server component)
<html lang={locale} suppressHydrationWarning>
  <body>
    <ThemeProvider>            {/* next-themes: class, defaultTheme=dark */}
      <IntlProvider …>         {/* NextIntlClientProvider com locale+messages do server */}
        <AuthProvider>         {/* Firebase | mock localStorage */}
          {children}           {/* TouristLayout | AdminLayout */}
```

O layout server busca `locale`/`messages` e importa os CSS globais + de mapas (`globals.css`, `leaflet/dist/leaflet.css`, `maplibre-gl/dist/maplibre-gl.css`). Todos os três providers são client components.

## 4. API routes

### `POST /api/gemini` — `src/app/api/gemini/route.ts`
- **Env:** `GEMINI_API_KEY` (server, opcional). **Modelo:** `gemini-2.0-flash`.
- **Modo A — Chat** (`chatMode: true`): `message`, `history[]`, `feedbacks?` → resposta.
- **Modo B — Diagnóstico** (default): `destino` (obrigatório, 400 se ausente), `feedbacks?`, `transporteInfo?`, `investimentoInfo?`, `instagramData?`, `isaScore?`.
- **Resposta 200:** `{ source: "gemini" | "mock", insight: "<markdown>" }`.
- **Sem chave:** retorna **mock 200** (não erro) — `getSimulatedChatResponse` / `generateMockInsight`. `500` só em exceção não tratada.

### `POST /api/scraper` — `src/app/api/scraper/route.ts`
- **Env:** `APIFY_API_TOKEN` (server, opcional); fallback `body.apiToken` (do `localStorage` do cliente).
- **Body:** `hashtag` (obrigatório, 400 se ausente), `forceRefresh?`, `apiToken?`.
- **Resposta 200:** `{ source: "mock"|"mock-cache"|"apify"|"apify-cache", hashtag, posts[], totalLikes, totalComments, cachedAt }`.
- **Actor:** `apify/instagram-scraper`, `searchType: "hashtag"`, `resultsLimit: 3`. **Cache** em memória por hashtag, TTL 6h. Sentimento por keywords (`Positivo|Neutro|Crítica`).

## 5. Persistência & _graceful degradation_

O app foi desenhado para rodar **100% em modo mock** sem nenhuma variável de ambiente.

```
AuthProvider        firebase.ts (feedbacks)     API routes (Gemini/Apify)
   │                     │                            │
Firebase configurado?  Firebase configurado?       chave configurada?
   │  Sim / Não           │  Sim / Não                 │  Sim / Não
   ▼                     ▼                            ▼
Firestore + Auth   Firestore/onSnapshot          API real / resposta mock
 (users/{uid})     ↳ fallback: localStorage       (+ cache)
                     dunastech_feedbacks
```

- **`firebase.ts`:** singleton inicializado só quando `NEXT_PUBLIC_FIREBASE_API_KEY` **e** `..._PROJECT_ID` existem. `addFeedback` → Firestore, senão `localStorage`. `subscribeFeedbacks` → `onSnapshot` desc por `timestamp`, senão semeia 3 mocks e faz _poll_ a cada 2s.
- **`AuthProvider.tsx`:** configurado quando `API_KEY` + `AUTH_DOMAIN` + `PROJECT_ID` existem. Modo mock cria usuário demo/valida CPF via `validateCPF` e guarda em `dunastech_mock_user`. **Nota:** o `AuthProvider` chama `getAuth()`/`getFirestore()` diretamente e **não** importa `src/lib/firebase.ts`; para produção, considere centralizar a init.

## 6. Mapas

| | MapLibre GL (B2C) | Leaflet (B2G) |
|-|-------------------|---------------|
| Onde | `DestinationMap`, `HomeRouteMap` | `DestinosMap` |
| Basemap | estilos Carto GL vetoriais (dark/voyager) | tiles Carto raster |
| Features | marcadores DOM, rota GeoJSON animada, popups de parceiro, troca de estilo por tema | divIcons coloridos por ISA, popups, visão multi-destino |

Padrões SSR: todos os mapas via `dynamic(import, { ssr: false })`, com _gate_ `mounted` + placeholder e CSS de mapa em `globals.css`. `canvas-confetti` é importado dinamicamente ao concluir a rota.

## 7. Variáveis de ambiente

| Variável | Escopo | Necessária p/ | Sem ela |
|----------|--------|---------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | público | Auth + Firestore | mock auth + localStorage |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | público | gate do AuthProvider | mock auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | público | init Firestore | mock + localStorage |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | público | config completa | string vazia (não usado nos fluxos) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | público | config completa | string vazia |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | público | config completa | string vazia |
| `GEMINI_API_KEY` | server | LLM real em `/api/gemini` | insights mock (200) |
| `APIFY_API_TOKEN` | server | scrape real | posts mock; token do cliente ainda funciona |

**Dev local:** nenhuma é obrigatória. Cookie (não env): `NEXT_LOCALE`.

## 8. Diagrama de integração

```mermaid
flowchart TB
  subgraph client [Browser — Next.js 16]
    Pages[Páginas Tourist + Gestão]
    Providers[Theme / Intl / Auth]
    LS[(localStorage fallbacks)]
    Pages --> Providers --> LS
  end
  subgraph nextapi [API Routes]
    Gemini[/api/gemini]
    Scraper[/api/scraper]
  end
  subgraph external [Externos — opcionais]
    FB[(Firebase)]
    GM[Gemini]
    AP[Apify]
    Carto[Carto Basemaps]
  end
  Pages --> Gemini --> GM
  Pages --> Scraper --> AP
  Providers --> FB
  Pages --> Carto
  Gemini -. mock .-> Pages
  Scraper -. mock .-> Pages
  FB -. fallback .-> LS
```

## 9. Comandos (do `package.json`)

| Ação | Comando |
|------|---------|
| Dev | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Testes | `npm test` (Vitest) |
| Build | `npm run build` |

> Notas de setup e caveats do ambiente Cloud: ver `AGENTS.md`.
