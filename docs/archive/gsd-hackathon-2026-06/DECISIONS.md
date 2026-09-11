# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical decisions and their rationale.
>
> **Archived 2026-09-10** — see [`../README.md`](./README.md). DECISION-001 below is
> **Superseded**: the product pivoted from Streamlit/`app.py` to Next.js, and later from
> Firebase/Firestore to Supabase (see `docs/architecture/TECH-ARCHITECTURE.md` for the
> current stack). No ADR had recorded this reversal until now.

## Decisions

### [DECISION-001] Single-File Streamlit Architecture with Session State
**Date**: 2026-06-26
**Status**: Superseded (2026-09-10) — see note above. Originally `Accepted`.

#### Context
We need to develop an MVP within 48 hours for the Hackathon do Sol. The project requires a mobile-friendly B2C view and a B2G dashboard, with mock databases, an external scraper, and Google Gemini API integration.

#### Decision
We will build the entire UI and backend logic in a single file `app.py` leveraging Streamlit's built-in session state (`st.session_state`) for temporary in-memory state preservation (like tourist feedback).

#### Rationale
- Eases deployment to Streamlit Community Cloud.
- Extremely rapid development and styling loop.
- No need to maintain external database servers or complex ORM configurations.

#### Consequences
- `app.py` might become large, so we must modularize it using clear helper functions.
- In-memory data is volatile; reloading the page resets the feedback database (acceptable for MVP/hackathon purposes).

---

*Last updated: 2026-06-26*
