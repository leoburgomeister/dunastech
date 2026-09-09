# AGENTS.md

## Cursor Cloud specific instructions

The primary product in this repo is `dunastech-app`, a Next.js 16 (App Router, Turbopack, React 19) tourism app ("DunasTech — Observatório Inteligente do Turismo") with `next-intl` i18n (`pt-BR`, `en`, `es`; default `pt-BR`). The rest of the repo (`.gsd/`, `.agent/`, `adapters/`, `docs/`, `scripts/`) is the "GSD" methodology/tooling and is not part of the running app.

- Package manager is npm (`package-lock.json`). The update script runs `npm install`.
- Standard commands live in `package.json` scripts: `npm run dev` (dev server on `http://localhost:3000`), `npm run lint`, `npm test` (Vitest), `npm run build`.
- Routes are locale-prefixed. `/` redirects; browse the app under `/pt-BR` (e.g. `/pt-BR`, `/pt-BR/avaliar`, `/pt-BR/gestao`).
- External services are all optional and degrade gracefully to mock/localStorage — no secrets are needed for local dev:
  - Firebase (`NEXT_PUBLIC_FIREBASE_*`): when unset, auth uses a mock user (localStorage) and feedback writes to localStorage. Google/CPF login and feedback submission fully work in this mock mode.
  - Gemini (`GEMINI_API_KEY`) powers `src/app/api/gemini`; Apify (`APIFY_API_TOKEN`) powers `src/app/api/scraper`. Without keys those specific API routes return errors, but the rest of the app is unaffected.
- `npm run lint` currently reports pre-existing errors/warnings in app source (unrelated to environment setup); the lint tooling itself works.
- Next.js prints a deprecation notice that the `middleware` file convention should become `proxy` — this is only a warning and does not affect running the dev server.

### MCP servers (`.cursor/mcp.json`)

Project MCP servers are declared in `.cursor/mcp.json` and launched by Cursor via `npx` (cross-platform, works on Windows/macOS/Linux). No secrets are required to start them:

- `context7` — up-to-date library docs (Next 16, React 19, Firebase, next-intl, MapLibre). Essential for the stack.
- `playwright` — browser automation / E2E of the tourist & gestão flows (headless, isolated Chrome).
- `chrome-devtools` — performance MCP: Lighthouse, Core Web Vitals, and performance traces (headless, isolated).
- `firebase` — Firestore/Auth/Hosting management via `firebase-tools`; run its `firebase_login` tool before operations that touch a real project.

Notes: the browser MCPs (`playwright`, `chrome-devtools`) require a Chrome/Chromium binary (present in Cloud). Drop `--headless` locally if you want to watch the browser. `context7` works keyless but accepts an optional `CONTEXT7_API_KEY` for higher rate limits.

### Architecture docs

High-level product, taxonomy, technical architecture, and GSD-harness maps live in `docs/architecture/` (start at `docs/architecture/README.md`). The `.gsd/` directory holds live GSD methodology state; some historical artifacts (`DECISIONS.md`, `JOURNAL.md`, `TODO.md`) still reference the pre-pivot Streamlit MVP.
