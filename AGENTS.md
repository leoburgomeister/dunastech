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
